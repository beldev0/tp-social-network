<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = "
            SELECT p.id, p.contenu, p.created_at, u.firstname, u.lastname 
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        ";
        $posts = $db->query($sql)->fetchAll();

        echo json_encode(["success" => true, "posts" => $posts]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    $postId = $_GET['post_id'] ?? null;

    if (!$postId) {
        echo json_encode(["success" => false, "message" => "L'ID du post est manquant."]);
        exit;
    }

    try {
        $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
        $stmt->execute([$postId]);

        echo json_encode(["success" => true, "message" => "La publication a été supprimée par la modération."]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}
