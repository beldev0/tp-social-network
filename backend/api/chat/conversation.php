<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
    exit;
}
$currentUserId = $_GET['current_user_id'] ?? 0;

try {
    $sql = "
        SELECT DISTINCT u.id, u.firstname, u.lastname, CONCAT('assets/images/', u.avatar) AS avatar
        FROM users u
        WHERE u.id IN (
            SELECT receiver_id FROM messages WHERE sender_id = ?
            UNION
            SELECT sender_id FROM messages WHERE receiver_id = ?
        ) AND u.is_active = 1
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute([$currentUserId, $currentUserId]);
    $conversations = $stmt->fetchAll();

    echo json_encode(["success" => true, "conversations" => $conversations]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
