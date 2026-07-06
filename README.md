Voici le fichier `README.md` parfaitement nettoyé, restructuré avec la nouvelle section **Liens d'accès rapides** intégrée et prête à être enregistrée à la racine de ton projet.

```markdown
# Réseau Social Académique

Ce projet est un réseau social privé conçu pour les étudiants (partage de posts, messagerie, liste d'amis) avec un espace d'administration complet pour gérer et modérer la communauté.

---

## 📝 Description et Fonctionnement

L'application est coupée en deux espaces distincts :

### 1. L'Espace Étudiant
* **Fil d'actualité :** Permet de publier des messages, de liker les posts des autres et de cliquer dessus pour lire ou ajouter des commentaires.
* **Système d'amis :** Permet de chercher des camarades dans l'annuaire et de leur envoyer des invitations. Devenir amis débloque la messagerie.
* **Messagerie privée :** Permet de discuter en direct avec ses amis et de s'envoyer des textes ou des images sans rafraîchir la page.

### 2. Le Back-Office (Administration)
* **Modérateurs :** Accèdent à un tableau de bord avec les statistiques du site, peuvent supprimer les publications inappropriées et bannir les comptes problématiques.
* **Administrateurs :** Ont les mêmes droits que les modérateurs, mais peuvent en plus créer de nouveaux comptes pour le staff (Modos et Admins).

---

## 👥 Membres du Groupe et Tâches

* **ZANNOU Charbel** (Team Lead) : Développement de tout le frontend et du système de gestion des amis.
* **GANDAHO Immaculée** : Développement du Back-Office (Administration) et de la page de profil personnel.
* **MESSANVI Sarah** : Développement de la page d'accueil et de la gestion du flux d'articles.
* **DOHETO Christelle** : Développement du module de chat et du système d'authentification (connexion/inscription).
---

## 🛠️ Installation et Lancement

Après avoir cloné le projet, suivez ces étapes pour lancer l'application localement.

### 1. Configuration des Variables d'Environnement (SMTP Google)
Pour que l'envoi des codes de vérification par email fonctionne, vous devez configurer un mot de passe d'application Google.

1. Rendez-vous sur votre compte Google (**Mon Compte**).
2. Allez dans l'onglet **Sécurité**.
3. Activez la **Validation en deux étapes** si ce n'est pas déjà fait.
4. Dans la barre de recherche de votre compte Google, tapez **Mots de passe d'application** (*App passwords*).
5. Donnez un nom à l'application (ex: `Reseau Social`) et cliquez sur **Créer**.
6. Copiez le code à 16 caractères généré par Google.
7. Allez dans le dossier `backend`, créez ou ouvrez le fichier `.env` et remplissez-le ainsi :
   ```env
   SMTP_USER=votre_adresse_gmail@gmail.com
   SMTP_PASS=votre_code_a_16_caracteres_sans_espaces
```

### 2. Lancement du Backend (Docker)

1. Ouvrez votre terminal et accédez au dossier backend :
```bash
cd backend

```


2. Lancez les conteneurs Docker en arrière-plan :
```bash
docker compose up -d --build

```



### 3. Configuration de la Base de Données

Connectez-vous sur **PhpMyAdmin**, sélectionnez la base de données `social_network`, allez dans l'onglet **SQL** et exécutez le script suivant pour créer toutes les tables indispensables :

```sql
-- 1. TABLE DES UTILISATEURS
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `firstname` VARCHAR(50) NOT NULL,
  `lastname` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT 'none.png',
  `role` ENUM('user', 'moderator', 'admin') DEFAULT 'user',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABLE DES PUBLICATIONS
CREATE TABLE IF NOT EXISTS `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contenu` TEXT NOT NULL,
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABLE DES MENTIONS J'AIME
CREATE TABLE IF NOT EXISTS `likes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `article_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`article_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABLE DES COMMENTAIRES
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `texte` TEXT NOT NULL,
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABLE DES DEMANDES D'INVITATION
CREATE TABLE IF NOT EXISTS `friend_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `status` ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABLE DES AMIS OFFICIELS
CREATE TABLE IF NOT EXISTS `friends` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `friend_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TABLE DES MESSAGES
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `message` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. TABLE DES CODES DE VÉRIFICATION
CREATE TABLE IF NOT EXISTS `verification_codes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `code` VARCHAR(6) NOT NULL,
  `status` ENUM('not_used', 'used') DEFAULT 'not_used',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

```

### 4. Lancement du Frontend (React)

1. Ouvrez un nouveau terminal et accédez au dossier frontend :
```bash
cd frontend

```


2. Installez les packages Node :
```bash
npm install

```


3. Démarrez l'application en mode développement :
```bash
npm run dev

```



---

## 🔗 Liens d'accès Rapides

### 👥 Espace Étudiant & Staff

* **Réseau Social (Espace Client) :** [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
* **Portail d'Administration (Back-Office) :** [http://localhost:5173/admin-login/](https://www.google.com/search?q=http://localhost:5173/admin-login/)

### ⚙️ Serveur & Données

* **API Backend (PHP) :** [http://localhost](https://www.google.com/search?q=http://localhost)
* **Gestionnaire de BDD (PhpMyAdmin) :** [http://localhost:8080](https://www.google.com/search?q=http://localhost:8080)
* *Hôte :* `db`
* *Utilisateur :* `beldev`
* *Mot de passe :* `dev`
```