<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $currentUserId = $_GET['current_user_id'];

    try {
        $sql = "
            SELECT fr.id AS request_id, fr.created_at, u.id AS sender_id, u.firstname, u.lastname, CONCAT('assets/images/', u.avatar) AS avatar
            FROM friend_requests fr
            JOIN users u ON fr.sender_id = u.id
            WHERE fr.receiver_id = ? AND fr.status = 'pending'
            ORDER BY fr.created_at DESC
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute([$currentUserId]);
        $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "requests" => $requests]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}


if ($method === 'POST') {
    $senderId = $_POST['sender_id'] ?? null;
    $receiverId = $_POST['receiver_id'] ?? null;

    if (!$senderId || !$receiverId) {
        echo json_encode(["success" => false, "message" => "Les IDs de l'expéditeur et du destinataire sont requis."]);
        exit;
    }

    try {
        $stmtCheck = $db->prepare("
            SELECT id FROM friend_requests 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
        ");
        $stmtCheck->execute([$senderId, $receiverId, $receiverId, $senderId]);
        
        if ($stmtCheck->fetch()) {
            echo json_encode(["success" => false, "message" => "Une invitation existe déjà ou vous êtes déjà liés."]);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 'pending')");
        $stmt->execute([$senderId, $receiverId]);

        echo json_encode(["success" => true, "message" => "Invitation envoyée !"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}