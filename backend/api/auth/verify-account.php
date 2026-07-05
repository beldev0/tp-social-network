<?php
// 1. Inclure la configuration globale (PDO, Dotenv, Composer)
require_once __DIR__ . '/../config.php';

// 2. Récupérer l'ID utilisateur et le code envoyés en FormData depuis React
$userId = $_POST['user_id'] ?? null;
$code = $_POST['code'] ?? null;

if (!$userId || !$code) {
    echo json_encode(["success" => false, "message" => "L'ID utilisateur et le code sont obligatoires."]);
    exit;
}

try {
    $stmtCheck = $db->prepare("SELECT id, status FROM verification_codes WHERE user_id = ? AND code = ?");
    $stmtCheck->execute([$userId, $code]);
    $verification = $stmtCheck->fetch();

    if (!$verification) {
        echo json_encode(["success" => false, "error_type" => "invalid", "message" => "Code de vérification incorrect."]);
        exit;
    }

    if ($verification['status'] === 'used') {
        echo json_encode(["success" => false, "error_type" => "is_used", "message" => "Ce code a déjà été utilisé."]);
        exit;
    }

    $codeId = $verification['id'];

    $stmtUpdateCode = $db->prepare("UPDATE verification_codes SET status = 'used' WHERE id = ?");
    $stmtUpdateCode->execute([$codeId]);

    $stmtUser = $db->prepare("SELECT id, firstname, lastname, email, avatar, role, is_active FROM users WHERE id = ?");
    $stmtUser->execute([$userId]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Utilisateur introuvable."]);
        exit;
    }

    if ($user['is_active'] == 0) {
        $stmtActivate = $db->prepare("UPDATE users SET is_active = 1 WHERE id = ?");
        $stmtActivate->execute([$userId]);
        
        $user['is_active'] = 1;
    }

    $user['avatar'] = 'assets/images/' . $user['avatar'];
    
    echo json_encode([
        "success" => true,
        "message" => "Code validé avec succès !",
        "user" => $user // Contient id, firstname, lastname, email, avatar, role
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>