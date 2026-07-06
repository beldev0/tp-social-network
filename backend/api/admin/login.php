<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
    exit;
}

$email = $_POST['email'] ?? null;
$password = $_POST['password'] ?? null;

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Tous les champs sont obligatoires."]);
    exit;
}

try {
    $stmt = $db->prepare("SELECT id, firstname, lastname, email, password, avatar, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "message" => "Identifiants incorrects."]);
        exit;
    }

    if ($user['role'] === 'user') {
        echo json_encode(["success" => false, "message" => "Accès refusé. Réservé au personnel autorisé."]);
        exit;
    }

    $user['avatar'] = 'assets/images/' . $user['avatar'];

    echo json_encode([
        "success" => true,
        "message" => "Connexion Administration réussie !",
        "user" => $user 
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
