<?php
require_once __DIR__ . '/../config.php';

$userId = $_POST['user_id'] ?? null;
$newPassword = $_POST['new_password'] ?? null;

if (!$userId || !$newPassword) {
    echo json_encode(["success" => false, "message" => "L'ID utilisateur et le nouveau mot de passe sont obligatoires."]);
    exit;
}

try {
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    $stmtUpdate = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmtUpdate->execute([$hashedPassword, $userId]);

    $stmtUser = $db->prepare("SELECT id, firstname, lastname, email, avatar, role, is_active FROM users WHERE id = ?");
    $stmtUser->execute([$userId]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Utilisateur introuvable."]);
        exit;
    }

    $user['avatar'] = 'assets/images/' . $user['avatar'];

    echo json_encode([
        "success" => true,
        "message" => "Votre mot de passe a été modifié avec succès !",
        "user" => $user
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>