<?php
require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT id, firstname, lastname, email, CONCAT('assets/images/', avatar) AS avatar, is_active FROM users WHERE role = 'user' ORDER BY id DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "users" => $users]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

// Ajouter un membre du Staff (Modérateur ou Admin)

if ($method === 'POST') {
    $firstname = $_POST['firstname'] ?? null;
    $lastname = $_POST['lastname'] ?? null;
    $email = $_POST['email'] ?? null;
    $password = $_POST['password'] ?? null;
    $role = $_POST['role'] ?? 'moderator'; 

    if (!$firstname || !$lastname || !$email || !$password) {
        echo json_encode(["success" => false, "message" => "Tous les champs sont obligatoires."]);
        exit;
    }

    try {
        // Vérifier si l'email existe déjà
        $stmtCheck = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmtCheck->execute([$email]);
        if ($stmtCheck->fetch()) {
            echo json_encode(["success" => false, "message" => "Cet e-mail est déjà utilisé."]);
            exit;
        }
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO users (firstname, lastname, email, password, role, is_active) VALUES (?, ?, ?, ?, ?, 1)");
        $stmt->execute([$firstname, $lastname, $email, $hashedPassword, $role]);

        echo json_encode(["success" => true, "message" => "Nouveau membre du staff créé avec succès !"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    $userId = $_GET['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(["success" => false, "message" => "L'ID de l'utilisateur est manquant."]);
        exit;
    }

    try {
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);

        echo json_encode(["success" => true, "message" => "Le compte a été supprimé définitivement."]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}
