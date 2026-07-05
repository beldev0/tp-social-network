<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["success" => false, "message" => "Méthode non autorisée."]);
    exit;
}

$senderId   = $_POST['sender_id'] ?? null;
$receiverId = $_POST['receiver_id'] ?? null;
$message    = $_POST['message'] ?? null;
$imageName  = null;

if (!$senderId || !$receiverId) {
    echo json_encode(["success" => false, "message" => "Les IDs émetteur et récepteur sont obligatoires."]);
    exit;
}

if (empty($message) && (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK)) {
    echo json_encode(["success" => false, "message" => "Impossible d'envoyer un message vide."]);
    exit;
}

try {
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath   = $_FILES['image']['tmp_name'];
        $fileName      = $_FILES['image']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        if (in_array($fileExtension, $allowedExtensions)) {
            $imageName = "chat_" . $senderId . "_" . $receiverId . "_" . time() . "." . $fileExtension;
            
            $uploadFileDir = __DIR__ . '/../../assets/images/chat/';
            if (!is_dir($uploadFileDir)) {
                mkdir($uploadFileDir, 0755, true);
            }

            if (!move_uploaded_file($fileTmpPath, $uploadFileDir . $imageName)) {
                echo json_encode(["success" => false, "message" => "Erreur lors du stockage de l'image."]);
                exit;
            }
        } else {
            echo json_encode(["success" => false, "message" => "Format d'image non valide dans le chat."]);
            exit;
        }
    }

    $stmt = $db->prepare("INSERT INTO messages (sender_id, receiver_id, message, image_url) VALUES (?, ?, ?, ?)");
    $stmt->execute([$senderId, $receiverId, $message, $imageName]);

    echo json_encode(["success" => true, "message" => "Message envoyé avec succès !"]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Une erreur est survenue : " . $e->getMessage()]);
}
