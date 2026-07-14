<?php
/* ============================================
   Database Setup and Initialization Utility
   ============================================ */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: text/html; charset=UTF-8");

$host = "localhost";
$username = "root";
$password = "";
$db_name = "resumeforge";

$messages = [];
$success = true;

try {
    // 1. Connect to MySQL Server (no db selected)
    $pdo = new PDO("mysql:host=$host", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $messages[] = "✔ Successfully connected to MySQL server.";

    // 2. Create Database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $messages[] = "✔ Database `$db_name` created or already exists.";

    // 3. Connect to Database
    $pdo->exec("USE `$db_name`");
    $messages[] = "✔ Using database `$db_name`.";

    // 4. Create Table: users
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NULL,
            `email` VARCHAR(191) NOT NULL UNIQUE,
            `password` VARCHAR(255) NULL,
            `profile_photo` VARCHAR(255) NULL,
            `is_verified` TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $messages[] = "✔ Table `users` checked/created.";

    // 5. Create Table: otp_requests
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `otp_requests` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `email` VARCHAR(191) NOT NULL,
            `otp` VARCHAR(6) NOT NULL,
            `type` ENUM('register', 'login', 'reset') NOT NULL,
            `expires_at` DATETIME NOT NULL,
            `is_used` TINYINT(1) DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (`email`),
            INDEX (`otp`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $messages[] = "✔ Table `otp_requests` checked/created.";

    // 6. Create Table: user_sessions
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `user_sessions` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NOT NULL,
            `token` VARCHAR(255) NOT NULL,
            `user_agent` TEXT NULL,
            `ip_address` VARCHAR(45) NULL,
            `expires_at` DATETIME NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (`token`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $messages[] = "✔ Table `user_sessions` checked/created.";

    // 7. Create Table: email_logs
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `email_logs` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `email` VARCHAR(191) NOT NULL,
            `otp` VARCHAR(6) NOT NULL,
            `type` ENUM('register', 'login', 'reset') NOT NULL,
            `status` ENUM('sent', 'failed') DEFAULT 'sent',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $messages[] = "✔ Table `email_logs` checked/created.";

    // 8. Create Table: activity_logs
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `activity_logs` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT NULL,
            `action` VARCHAR(191) NOT NULL,
            `ip_address` VARCHAR(45) NULL,
            `user_agent` TEXT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $messages[] = "✔ Table `activity_logs` checked/created.";

} catch (PDOException $e) {
    $success = false;
    $messages[] = "❌ Error: " . $e->getMessage();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResumeForge — DB Setup Utility</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0a0a1a;
            --bg-secondary: #111128;
            --text-primary: #f0f0ff;
            --text-secondary: #a0a0c0;
            --accent-primary: #6C63FF;
            --accent-secondary: #FF6B9D;
            --accent-tertiary: #00D4AA;
            --accent-danger: #FF4757;
            --gradient-primary: linear-gradient(135deg, #6C63FF 0%, #FF6B9D 100%);
            --radius-lg: 16px;
            --glass-border: 1px solid rgba(255, 255, 255, 0.08);
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .container {
            width: 100%;
            max-width: 600px;
            background: var(--bg-secondary);
            border: var(--glass-border);
            border-radius: var(--radius-lg);
            padding: 40px;
            box-shadow: 0 16px 64px rgba(0, 0, 0, 0.25);
        }
        h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 8px;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 30px;
        }
        .log-box {
            background: rgba(0, 0, 0, 0.3);
            border: var(--glass-border);
            border-radius: 8px;
            padding: 20px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 30px;
            max-height: 300px;
            overflow-y: auto;
        }
        .log-entry {
            margin-bottom: 8px;
        }
        .log-entry:last-child {
            margin-bottom: 0;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            margin-bottom: 20px;
        }
        .status-badge.success {
            background: rgba(0, 212, 170, 0.15);
            color: var(--accent-tertiary);
        }
        .status-badge.error {
            background: rgba(255, 71, 87, 0.15);
            color: var(--accent-danger);
        }
        .btn {
            display: block;
            width: 100%;
            text-align: center;
            padding: 14px;
            background: var(--gradient-primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 4px 20px rgba(108, 99, 255, 0.3);
            transition: all 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(108, 99, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ResumeForge DB Setup</h1>
        <div class="subtitle">MySQL Database Initialization & Table Check</div>

        <div style="text-align: center;">
            <div class="status-badge <?php echo $success ? 'success' : 'error'; ?>">
                <?php echo $success ? '✔ SETUP COMPLETED SUCCESSFULY' : '❌ SETUP FAILED'; ?>
            </div>
        </div>

        <div class="log-box">
            <?php foreach ($messages as $msg): ?>
                <div class="log-entry"><?php echo htmlspecialchars($msg); ?></div>
            <?php endforeach; ?>
        </div>

        <?php if ($success): ?>
            <a href="../index.html" class="btn">Go to Application →</a>
        <?php else: ?>
            <button onclick="window.location.reload();" class="btn">Retry Setup ↻</button>
        <?php endif; ?>
    </div>
</body>
</html>
