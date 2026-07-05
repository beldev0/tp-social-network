<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

// -------------------------------------------------------------------------
// CAS 1 : POST - Ajouter un commentaire
// -------------------------------------------------------------------------
if ($method === 'POST') {
    $texte  = $_POST['texte'] ?? null;
    $userId = $_POST['user_id'] ?? null;
    $postId = $_POST['post_id'] ?? null;

    if (!$texte || !$userId || !$postId) {
        echo json_encode(["success" => false, "message" => "Tous les champs sont obligatoires."]);
        exit;
    }

    try {
        $stmt = $db->prepare("INSERT INTO comments (texte, user_id, post_id) VALUES (?, ?, ?)");
        $stmt->execute([$texte, $userId, $postId]);
        
        echo json_encode(["success" => true, "message" => "Commentaire ajouté avec succès !"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// Supprimer un commentaire

if ($method === 'DELETE') {
    // Envoyé en paramètres d'URL (ex: comment.php?comment_id=12&user_id=5)
    $commentId = $_GET['comment_id'] ?? null;
    $userId    = $_GET['user_id'] ?? null;

    if (!$commentId || !$userId) {
        echo json_encode(["success" => false, "message" => "L'ID du commentaire et de l'utilisateur sont requis."]);
        exit;
    }

    try {
        $stmt = $db->prepare("DELETE FROM comments WHERE id = ? AND user_id = ?");
        $stmt->execute([$commentId, $userId]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Commentaire supprimé !"]);
        } else {
            echo json_encode(["success" => false, "message" => "Action impossible (Non-auteur ou commentaire inexistant)."]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}