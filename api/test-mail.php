<?php
require_once __DIR__ . '/libs/PHPMailer/Exception.php';
require_once __DIR__ . '/libs/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/libs/PHPMailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mailConfig = include __DIR__ . '/config/mail.php';
$mail = new PHPMailer(true);

try {
    $mail->SMTPDebug = 2; // Enable verbose debug output
    $mail->isSMTP();
    $mail->Host       = $mailConfig['smtp_host'];
    $mail->SMTPAuth   = $mailConfig['smtp_auth'];
    $mail->Username   = $mailConfig['smtp_user'];
    $mail->Password   = $mailConfig['smtp_pass'];
    $mail->SMTPSecure = $mailConfig['smtp_secure'] === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $mailConfig['smtp_port'];
    
    $mail->setFrom($mailConfig['from_email'], $mailConfig['from_name']);
    $mail->addAddress('rudra7673patel@gmail.com'); 

    $mail->isHTML(false);
    $mail->Subject = 'Test Email';
    $mail->Body    = 'This is a test email.';

    $mail->send();
    echo "Message has been sent\n";
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}\n";
}
?>
