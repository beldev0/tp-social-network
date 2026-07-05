<?php
require_once __DIR__ . '/../config.php';

$userId = $_POST['user_id'] ?? null;

if (!$userId) {
    echo json_encode(["success" => false, "message" => "L'ID utilisateur est obligatoire."]);
    exit;
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Aucune image reçue "]);
    exit;
}

try {
    $fileTmpPath = $_FILES['avatar']['tmp_name'];
    $fileName = $_FILES['avatar']['name'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array($fileExtension, $allowedExtensions)) {
        echo json_encode(["success" => false, "message" => "Format non valide (JPG, PNG, GIF acceptés)."]);
        exit;
    }

    $avatarName = "avatar_" . $userId . "_" . time() . "." . $fileExtension;
    
    $uploadFileDir = __DIR__ . '/../../assets/images/';
    if (!is_dir($uploadFileDir)) {
        mkdir($uploadFileDir, 0755, true);
    }

    if (move_uploaded_file($fileTmpPath, $uploadFileDir . $avatarName)) {
        $stmt = $db->prepare("UPDATE users SET avatar = ? WHERE id = ?");
        $stmt->execute([$avatarName, $userId]);

        echo json_encode([
            "success" => true,
            "message" => "Photo de profil mise à jour !",
            "avatar" => 'assets/images/' . $avatarName
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Erreur lors du stockage de l'image."]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
?>