<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId    = $_POST['user_id'] ?? null;
    $articleId = $_POST['article_id'] ?? null; 

    if (!$userId || !$articleId) {
        echo json_encode(["success" => false, "message" => "Les IDs de l'utilisateur et du post sont requis."]);
        exit;
    }

    try {
        $stmtCheck = $db->prepare("SELECT id FROM likes WHERE user_id = ? AND article_id = ?");
        $stmtCheck->execute([$userId, $articleId]);
        $like = $stmtCheck->fetch();

        if ($like) {
            $stmtDelete = $db->prepare("DELETE FROM likes WHERE id = ?");
            $stmtDelete->execute([$like['id']]);
            echo json_encode(["success" => true, "action" => "unliked", "message" => "Like retiré."]);
        } else {
            $stmtInsert = $db->prepare("INSERT INTO likes (user_id, article_id) VALUES (?, ?)");
            $stmtInsert->execute([$userId, $articleId]);
            echo json_encode(["success" => true, "action" => "liked", "message" => "Post liké !"]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}