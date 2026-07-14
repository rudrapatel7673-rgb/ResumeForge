<?php
/* ============================================
   API: Verify OTP (Secure & Production-Ready)
   ============================================ */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed. Use POST."]);
    exit();
}

require_once __DIR__ . '/config/database.php';

try {
    // 1. Parse and validate JSON input
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON input."]);
        exit();
    }

    if (empty($data->email) || empty($data->otp)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Incomplete request parameters (email and otp are required)."]);
        exit();
    }

    $email = trim($data->email);
    $otp = trim($data->otp);
    $name = !empty($data->name) ? trim($data->name) : null;

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // 2. Start Database Transaction
    $db->beginTransaction();

    // 3. Fetch latest active, unused, unexpired OTP request
    $query = "SELECT id, type, expires_at 
              FROM otp_requests 
              WHERE email = :email AND otp = :otp AND is_used = 0 
              ORDER BY created_at DESC LIMIT 1 FOR UPDATE"; // FOR UPDATE locks row for consistency
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":otp", $otp);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid OTP code. Please request a new code."]);
        exit();
    }

    $otpRequest = $stmt->fetch();
    $now = date("Y-m-d H:i:s");

    if (strtotime($otpRequest['expires_at']) < strtotime($now)) {
        $db->rollBack();
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "OTP code has expired. Please request a new code."]);
        exit();
    }

    // 4. Mark OTP request as used
    $query = "UPDATE otp_requests SET is_used = 1 WHERE id = :id";
    $updateStmt = $db->prepare($query);
    $updateStmt->bindParam(":id", $otpRequest['id']);
    $updateStmt->execute();

    $type = $otpRequest['type'];
    $userId = null;
    $user_name = '';

    // 5. Account provisioning (Register vs Login)
    if ($type === 'register') {
        // Double check email does not exist just before inserting (race conditions check)
        $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1 FOR UPDATE";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":email", $email);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "This email is already registered. Please Login."]);
            exit();
        }

        // Insert new user
        $insertUserQuery = "INSERT INTO users (name, email, is_verified) VALUES (:name, :email, 1)";
        $userStmt = $db->prepare($insertUserQuery);
        $userStmt->bindParam(":name", $name);
        $userStmt->bindParam(":email", $email);
        $userStmt->execute();
        
        $userId = $db->lastInsertId();
        $user_name = $name;
    } else {
        // Fetch existing user info
        $fetchUserQuery = "SELECT id, name FROM users WHERE email = :email LIMIT 1";
        $userStmt = $db->prepare($fetchUserQuery);
        $userStmt->bindParam(":email", $email);
        $userStmt->execute();
        
        $user = $userStmt->fetch();
        if (!$user) {
            $db->rollBack();
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Account not found. Please Register."]);
            exit();
        }
        $userId = $user['id'];
        $user_name = $user['name'] ?? $email;
    }

    // 6. Create User Session
    $token = bin2hex(random_bytes(32));
    $expires_at = date("Y-m-d H:i:s", strtotime("+30 days"));
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;

    $sessionQuery = "INSERT INTO user_sessions (user_id, token, user_agent, ip_address, expires_at) 
                     VALUES (:user_id, :token, :ua, :ip, :expires_at)";
    $sessionStmt = $db->prepare($sessionQuery);
    $sessionStmt->bindParam(":user_id", $userId);
    $sessionStmt->bindParam(":token", $token);
    $sessionStmt->bindParam(":ua", $ua);
    $sessionStmt->bindParam(":ip", $ip);
    $sessionStmt->bindParam(":expires_at", $expires_at);
    $sessionStmt->execute();

    // 7. Log Activity
    $action = "Logged in via OTP (" . $type . ")";
    $logQuery = "INSERT INTO activity_logs (user_id, action, ip_address, user_agent) 
                 VALUES (:user_id, :action, :ip, :ua)";
    $logStmt = $db->prepare($logQuery);
    $logStmt->bindParam(":user_id", $userId);
    $logStmt->bindParam(":action", $action);
    $logStmt->bindParam(":ip", $ip);
    $logStmt->bindParam(":ua", $ua);
    $logStmt->execute();

    // Commit all operations successfully
    $db->commit();

    // Response
    echo json_encode([
        "success" => true,
        "message" => "Verification successful.",
        "token" => $token,
        "user" => [
            "id" => $userId,
            "name" => $user_name,
            "email" => $email
        ]
    ]);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
