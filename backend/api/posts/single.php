<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$postId = $_GET['id'] ?? null;

if (!$postId) {
    echo json_encode(["success" => false, "message" => "L'ID du post est manquant."]);
    exit;
}

if ($method === 'GET') {
    try {
        $stmtPost = $db->prepare("
            SELECT p.id, p.contenu, p.created_at, p.user_id, u.firstname, u.lastname, CONCAT('assets/images/', u.avatar) AS user_avatar
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        ");
        $stmtPost->execute([$postId]);
        $post = $stmtPost->fetch(PDO::FETCH_ASSOC);

        if (!$post) {
            echo json_encode(["success" => false, "message" => "Post introuvable."]);
            exit;
        }

        $stmtComments = $db->prepare("
            SELECT c.id, c.texte, c.created_at, c.user_id, u.firstname, u.lastname, CONCAT('assets/images/', u.avatar) AS user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmtComments->execute([$postId]);
        $comments = $stmtComments->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "post" => $post,
            "comments" => $comments
        ]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}


if ($method === 'DELETE') {
    $userId = $_GET['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(["success" => false, "message" => "L'ID de l'auteur est requis pour supprimer."]);
        exit;
    }

    try {
        $stmt = $db->prepare("DELETE FROM posts WHERE id = ? AND user_id = ?");
        $stmt->execute([$postId, $userId]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Post supprimé avec succès !"]);
        } else {
            echo json_encode(["success" => false, "message" => "Impossible de supprimer (Post inexistant ou non-auteur)."]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}
