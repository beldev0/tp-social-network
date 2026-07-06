<?php
require_once __DIR__ . '/../config.php';

$userId    = $_POST['user_id'] ?? null;
$firstname = $_POST['firstname'] ?? null;
$lastname  = $_POST['lastname'] ?? null;
$email     = $_POST['email'] ?? null;

if (!$userId || !$firstname || !$lastname || !$email) {
    echo json_encode(["success" => false, "message" => "Tous les champs sont obligatoires."]);
    exit;
}

try {
    $stmtCheck = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmtCheck->execute([$email, $userId]);
    if ($stmtCheck->fetch()) {
        echo json_encode(["success" => false, "message" => "Cette adresse email est déjà prise."]);
        exit;
    }

    $stmtUpdate = $db->prepare("UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE id = ?");
    $stmtUpdate->execute([$firstname, $lastname, $email, $userId]);

    $stmtUser = $db->prepare("SELECT id, firstname, lastname, email, avatar, role, is_active FROM users WHERE id = ?");
    $stmtUser->execute([$userId]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    $user['avatar'] = 'assets/images/' . $user['avatar'];

    echo json_encode([
        "success" => true,
        "message" => "Informations personnelles mises à jour !",
        "user" => $user
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>