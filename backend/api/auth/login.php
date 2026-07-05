<?php
require_once __DIR__ . '/../config.php';

// 2. Récupérer les données envoyées en FormData depuis React
$email= $_POST['email'] ?? null;
$password = $_POST['password'] ?? null;

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "L'email et le mot de passe sont obligatoires."]);
    exit;
}

try {
    $stmt = $db->prepare("SELECT id, firstname, lastname, email, password, avatar, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "Identifiants incorrect."]);
        exit;
    }

    // Cas 2 : Le mot de passe est incorrect
    if (!password_verify($password, $user['password'])) {
        echo json_encode(["success" => false, "message" => "Identifiants incorrect."]);
        exit;
    }

    if ($user['is_active'] == 0) {
        echo json_encode([
            "success" => false, 
            "error_type" => "not_active",
            "message" => "Votre compte n'est pas activé. Veuillez valider votre code.",
            "user_id" => $user['id'] 
        ]);
        exit;
    }

    $user['avatar'] = 'assets/images/' . $user['avatar'];

    echo json_encode([
        "success" => true,
        "message" => "Connexion réussie !",
        "user" => $user
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>