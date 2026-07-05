<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
    exit;
}

$requestId = $_POST['request_id'] ?? null;
$action = $_POST['action'] ?? null;

if (!$requestId || !$action) {
    echo json_encode(["success" => false, "message" => "L'ID de la demande et l'action sont obligatoires."]);
    exit;
}

try {
    $stmtReq = $db->prepare("SELECT sender_id, receiver_id FROM friend_requests WHERE id = ? AND status = 'pending'");
    $stmtReq->execute([$requestId]);
    $request = $stmtReq->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        echo json_encode(["success" => false, "message" => "Demande introuvable."]);
        exit;
    }

    $senderId = $request['sender_id'];
    $receiverId = $request['receiver_id'];

    if ($action === 'accept') {
        $stmtDeleteReq = $db->prepare("DELETE FROM friend_requests WHERE id = ?");
        $stmtDeleteReq->execute([$requestId]);

        $stmtFriend1 = $db->prepare("INSERT INTO friends (user_id, friend_id) VALUES (?, ?)");
        $stmtFriend1->execute([$senderId, $receiverId]);
        $stmtFriend2 = $db->prepare("INSERT INTO friends (user_id, friend_id) VALUES (?, ?)");
        $stmtFriend2->execute([$receiverId, $senderId]);
        echo json_encode(["success" => true, "message" => "Invitation acceptée, vous êtes maintenant amis !"]);
    } 
    else {
        $stmtDeleteReq = $db->prepare("DELETE FROM friend_requests WHERE id = ?");
        $stmtDeleteReq->execute([$requestId]);
        echo json_encode(["success" => true, "message" => "Invitation déclinée."]);
    } 
   
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>