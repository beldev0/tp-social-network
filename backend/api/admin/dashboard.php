<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
    exit;
}

try {
    $totalUsers = $db->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();
    $totalPosts = $db->query("SELECT COUNT(*) FROM posts")->fetchColumn();
    $totalComments = $db->query("SELECT COUNT(*) FROM comments")->fetchColumn();

    $stmtRecent = $db->query("
        SELECT id, firstname, lastname, email, is_active 
        FROM users 
        WHERE role = 'user' 
        ORDER BY id DESC 
        LIMIT 5
    ");
    $recentUsers = $stmtRecent->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "stats" => [
            "total_users" => (int)$totalUsers,
            "total_posts" => (int)$totalPosts,
            "total_comments" => (int)$totalComments
        ],
        "recent_users" => $recentUsers
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
