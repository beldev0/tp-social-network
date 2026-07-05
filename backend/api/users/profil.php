<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée. Utilisez GET."]);
    exit;
}

$profileId = $_GET['profile_id'] ?? null;
$currentUserId = $_GET['current_user_id'] ?? 0;

if (!$profileId) {
    echo json_encode(["success" => false, "message" => "L'ID du profil ciblé est obligatoire."]);
    exit;
}

try {
    $sqlUser = "
        SELECT 
            u.id, u.firstname, u.lastname, u.email, 
            CONCAT('assets/images/', u.avatar) AS avatar, 
            u.role,
            EXISTS(SELECT 1 FROM friends f WHERE f.user_id = ? AND f.friend_id = u.id) AS is_friend,
            (SELECT status FROM friend_requests fr 
             WHERE (fr.sender_id = ? AND fr.receiver_id = u.id) 
                OR (fr.sender_id = u.id AND fr.receiver_id = ?) 
             LIMIT 1) AS request_status
        FROM users u 
        WHERE u.id = ? AND u.is_active = 1
    ";

    $stmtUser = $db->prepare($sqlUser);
    $stmtUser->execute([$currentUserId, $currentUserId, $currentUserId, $profileId]);
    $user = $stmtUser->fetch();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Utilisateur introuvable ou inactif."]);
        exit;
    }

    $user['is_friend'] = (bool)$user['is_friend'];
    $user['request_status'] = $user['request_status'] ?? 'none';

    $stmtPosts = $db->prepare("SELECT id, contenu, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC");
    $stmtPosts->execute([$profileId]);
    $posts = $stmtPosts->fetchAll();

    echo json_encode([
        "success" => true,
        "user" => $user,
        "posts" => $posts
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
