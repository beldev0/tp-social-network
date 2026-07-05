<?php
// 1. Inclure la configuration globale (PDO, Dotenv, Composer)
require_once __DIR__ .'/../config.php';

use PHPMailer\PHPMailer\PHPMailer;

// 2. Récupérer les données envoyées en FormData depuis React
$firstname = $_POST['firstname'] ?? null;
$lastname  = $_POST['lastname'] ?? null;
$email     = $_POST['email'] ?? null;
$password  = $_POST['password'] ?? null;

// Vérification de base des champs
if (!$firstname || !$lastname || !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Tous les champs sont obligatoires."]);
    exit;
}

try {
    // 3. Vérifier si l'email existe déjà
    $stmtCheck = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->fetch()) {
        echo json_encode(["success" => false, "message" => "Cette adresse email est déjà utilisée."]);
        exit;
    }

    // 4. Insérer l'utilisateur (Compte inactif par défaut)
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $stmtUser = $db->prepare("INSERT INTO users (firstname, lastname, email, password, is_active) VALUES (?, ?, ?, ?, 0)");
    $stmtUser->execute([$firstname, $lastname, $email, $hashedPassword]);
    
    // Récupérer l'ID généré pour cet utilisateur
    $userId = $db->lastInsertId();

    // 5. Générer un code simple à 6 chiffres
    $verificationCode = rand(100000, 999999);

    // 6. Enregistrer le code dans la table en statut 'not_used'
    $stmtCode = $db->prepare("INSERT INTO verification_codes (user_id, code, status) VALUES (?, ?, 'not_used')");
    $stmtCode->execute([$userId, $verificationCode]);

    // 7. Envoi de l'email avec PHPMailer
    $mail = new PHPMailer(true);
    
    $mail->isSMTP();
    $mail->Host = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth = true;
    $mail->Username = $_ENV['SMTP_USER'];
    $mail->Password = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = $_ENV['SMTP_PORT'];
    $mail->CharSet = 'UTF-8';

    $mail->setFrom($_ENV['SMTP_USER'], $_ENV['SMTP_FROM_NAME']);
    $mail->addAddress($email, "$firstname $lastname");

    $mail->isHTML(true);
    $mail->Subject = "Votre code de validation";
    
    $mail->Body = "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;'>
        <h2>Bienvenue $firstname !</h2>
        <p>Merci pour votre inscription. Voici votre code de validation :</p>
        <div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #007bff; margin: 20px 0;'>
            $verificationCode
        </div>
        <p>Entrez ce code sur le site pour valider votre inscription.</p>
    </div>
    ";

    $mail->send();

    echo json_encode([
        "success" => true, 
        "message" => "Inscription réussie ! Code envoyé par email.",
        "id" => $userId
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
