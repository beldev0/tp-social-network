<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
    exit;
}

$currentUserId = $_GET['current_user_id'] ?? null;
$contactId = $_GET['contact_id'] ?? null;

if (!$currentUserId || !$contactId) {
    echo json_encode(["success" => false, "message" => "Les IDs de l'utilisateur et du contact sont requis."]);
    exit;
}

try {
    $sql = "
        SELECT id, sender_id, receiver_id, message, 
               CASE 
                   WHEN image_url IS NOT NULL THEN CONCAT('assets/images/chat/', image_url)
                   ELSE NULL 
               END AS image_url, 
               created_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at ASC
    ";

    $stmt = $db->prepare($sql);
    $stmt->execute([$currentUserId, $contactId, $contactId, $currentUserId]);
    $messages = $stmt->fetchAll();

    echo json_encode(["success" => true, "messages" => $messages]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
