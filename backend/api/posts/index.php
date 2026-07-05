<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $currentUserId = $_GET['current_user_id'];

    try {
        $sql = "
            SELECT 
                p.id,
                CASE 
                    WHEN LENGTH(p.contenu) > 150 THEN CONCAT(SUBSTRING(p.contenu, 1, 150), '...')
                    ELSE p.contenu
                END AS contenu,
                p.created_at,
                p.user_id,
                u.firstname,
                u.lastname,
                CONCAT('assets/images/', u.avatar) AS user_avatar,
                (SELECT COUNT(*) FROM likes l WHERE l.article_id = p.id) AS total_likes,
                (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS total_comments,
                EXISTS(SELECT 1 FROM likes l WHERE l.article_id = p.id AND l.user_id = ?) AS has_liked
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$currentUserId]);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($posts as &$post) {
            $post['has_liked'] = (bool)$post['has_liked'];
        }

        echo json_encode(["success" => true, "posts" => $posts]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $postId  = $_POST['post_id'] ?? null; 
    $userId  = $_POST['user_id'] ?? null;
    $contenu = $_POST['contenu'] ?? null;

    if (!$userId || !$contenu) {
        echo json_encode(["success" => false, "message" => "L'ID utilisateur et le contenu sont obligatoires."]);
        exit;
    }

    try {
        if ($postId) {
            $stmtCheck = $db->prepare("SELECT id FROM posts WHERE id = ? AND user_id = ?");
            $stmtCheck->execute([$postId, $userId]);
            if (!$stmtCheck->fetch()) {
                echo json_encode(["success" => false, "message" => "Action non autorisée ou post introuvable."]);
                exit;
            }

            $stmt = $db->prepare("UPDATE posts SET contenu = ? WHERE id = ?");
            $stmt->execute([$contenu, $postId]);
            echo json_encode(["success" => true, "message" => "Post modifié avec succès !"]);
        } else {
            $stmt = $db->prepare("INSERT INTO posts (contenu, user_id) VALUES (?, ?)");
            $stmt->execute([$contenu, $userId]);
            echo json_encode(["success" => true, "message" => "Post publié avec succès !"]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}