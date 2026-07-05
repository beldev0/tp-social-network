<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $currentUserId = $_GET['current_user_id'] ?? 0;

    try {
        $sql = "
            SELECT 
                u.id, u.firstname, u.lastname, u.email, 
                CONCAT('assets/images/', u.avatar) AS avatar,
                EXISTS(SELECT 1 FROM friends f WHERE f.user_id = ? AND f.friend_id = u.id) AS is_friend,
                (SELECT status FROM friend_requests fr 
                 WHERE (fr.sender_id = ? AND fr.receiver_id = u.id) 
                    OR (fr.sender_id = u.id AND fr.receiver_id = ?) 
                 LIMIT 1) AS request_status
            FROM users u
            WHERE u.id != ? AND u.is_active = 1
            ORDER BY u.lastname ASC
        ";

        $stmt = $db->prepare($sql);
        $stmt->execute([$currentUserId, $currentUserId, $currentUserId, $currentUserId]);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($users as &$user) {
            $user['is_friend'] = (bool)$user['is_friend'];
            $user['request_status'] = $user['request_status'] ?? 'none';
        }

        echo json_encode(["success" => true, "users" => $users]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

