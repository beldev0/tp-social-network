<?php
require_once __DIR__ . '/../config.php';

$userId = $_POST['user_id'] ?? null;
$oldPassword = $_POST['old_password'] ?? null;
$newPassword = $_POST['new_password'] ?? null;

if (!$userId || !$oldPassword || !$newPassword) {
    echo json_encode(["success" => false, "message" => "Tous les champs sont obligatoires."]);
    exit;
}

try {
    $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($oldPassword, $user['password'])) {
        echo json_encode(["success" => false, "message" => "L'ancien mot de passe est incorrect."]);
        exit;
    }

    $newHashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmtUpdate = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmtUpdate->execute([$newHashedPassword, $userId]);

    echo json_encode(["success" => true, "message" => "Mot de passe modifié avec succès !"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>