<?php
require_once __DIR__ . '/../config.php';

use PHPMailer\PHPMailer\PHPMailer;

$email = $_POST['email'] ?? null;

if (!$email) {
    echo json_encode(["success" => false, "message" => "L'adresse email est obligatoire."]);
    exit;
}

try {
    $stmt = $db->prepare("SELECT id, firstname, lastname FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Aucun compte n'est associé à cet email."]);
        exit;
    }

    $userId = $user['id'];
    $firstname = $user['firstname'];
    $lastname = $user['lastname'];
   
    $resetCode = rand(100000, 999999);

    $stmtCode = $db->prepare("INSERT INTO verification_codes (user_id, code, status) VALUES (?, ?, 'not_used')");
    $stmtCode->execute([$userId, $resetCode]);

    $mail = new PHPMailer(true);
    
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $_ENV['SMTP_PORT'];
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom($_ENV['SMTP_USER'], $_ENV['SMTP_FROM_NAME']);
    $mail->addAddress($email, "$firstname $lastname");

    $mail->isHTML(true);
    $mail->Subject = "Réinitialisation de votre mot de passe";
    
    $mail->Body = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
        <h2>Bonjour $firstname,</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de sécurité :</p>
        <div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #dc3545; margin: 20px 0;'>
            $resetCode
        </div>
        <p>Ce code est temporaire. Entrez-le sur l'application pour pouvoir définir un nouveau mot de passe.</p>
    </div>
    ";

    $mail->send();

    echo json_encode([
        "success" => true,
        "message" => "Un code de réinitialisation a été envoyé par email.",
        "user_id" => $userId
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>