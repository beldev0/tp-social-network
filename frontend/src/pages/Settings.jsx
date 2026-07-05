import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Lock, Camera, Save, CheckCircle } from 'lucide-react';

export default function Settings() {
    const { user, login } = useAuth(); // On récupère "login" ou la fonction qui rafraîchit l'user dans ton context
    
    // États pour les Informations Personnelles
    const [firstname, setFirstname] = useState(user?.firstname || '');
    const [lastname, setLastname] = useState(user?.lastname || '');
    const [email, setEmail] = useState(user?.email || '');
    
    // États pour le Mot de passe
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // États pour l'Avatar
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Messages de succès locaux
    const [infoMessage, setInfoMessage] = useState('');
    const [passMessage, setPassMessage] = useState('');
    const [avatarMessage, setAvatarMessage] = useState('');

    // 1. Soumettre les modifications de Profil (POST)
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setInfoMessage('');

        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('email', email);

        try {
            const response = await fetch('http://localhost/api/profil/update-profil.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                setInfoMessage(data.message);
                // On met à jour le localStorage/state global de l'auth avec le nouvel user reçu
                if (login) login(data.user); 
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Erreur lors de la mise à jour du profil.');
        }
    };

    // 2. Soumettre le changement d'Avatar (POST)
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file)); // Aperçu temporaire dans React
        }
    };

    const handleUpdateAvatar = async (e) => {
        e.preventDefault();
        if (!avatarFile) return;
        setAvatarMessage('');

        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('avatar', avatarFile);

        try {
            const response = await fetch('http://localhost/api/profil/update-avatar.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                setAvatarMessage(data.message);
                // On met à jour l'avatar dans le state global de l'utilisateur
                const updatedUser = { ...user, avatar: data.avatar };
                if (login) login(updatedUser);
                setAvatarPreview(null);
                setAvatarFile(null);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.log(err);
            
            alert('Erreur lors de l\'envoi de l\'avatar.');
        }
    };

    // 3. Soumettre le changement de Mot de passe (POST)
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setPassMessage('');

        if (newPassword !== confirmPassword) {
            alert('Les nouveaux mots de passe ne correspondent pas, my gee.');
            return;
        }

        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('old_password', oldPassword);
        formData.append('new_password', newPassword);

        try {
            const response = await fetch('http://localhost/api/profil/update-password.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                setPassMessage(data.message);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Erreur lors de la modification du mot de passe.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-20 pb-8">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* BLOC GAUCHE : Gestion de la photo de profil */}
                <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col items-center text-center h-fit">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                        <Camera className="h-4 w-4" />
                        <span>Photo de Profil</span>
                    </h3>

                    <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRef.current.click()}>
                        <img 
                            src={avatarPreview || (user?.avatar ? `http://localhost/${user.avatar}` : 'https://via.placeholder.com/150')} 
                            alt="Avatar" 
                            className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow-sm transition group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition">
                            <Camera className="text-white h-5 w-5" />
                        </div>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleAvatarChange} 
                        accept="image/*" 
                        className="hidden" 
                    />

                    <p className="text-[10px] text-gray-400 mb-4">Clique sur l'image pour charger un nouveau fichier (JPG, PNG, GIF).</p>

                    {avatarFile && (
                        <button 
                            onClick={handleUpdateAvatar}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1 shadow-sm"
                        >
                            <Save className="h-3.5 w-3.5" />
                            <span>Sauvegarder la photo</span>
                        </button>
                    )}

                    {avatarMessage && (
                        <div className="mt-3 flex items-center space-x-1 text-[11px] text-green-600 bg-green-50 p-2 rounded-lg w-full justify-center">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>{avatarMessage}</span>
                        </div>
                    )}
                </div>

                {/* BLOC DROITE : Formulaires de Modifications */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Formulaire 1 : Informations personnelles */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                            <User className="h-4 w-4 text-blue-500" />
                            <span>Informations Personnelles</span>
                        </h3>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500">Prénom</label>
                                    <input 
                                        type="text" 
                                        value={firstname}
                                        onChange={(e) => setFirstname(e.target.value)}
                                        className="w-full bg-gray-50 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500">Nom</label>
                                    <input 
                                        type="text" 
                                        value={lastname}
                                        onChange={(e) => setLastname(e.target.value)}
                                        className="w-full bg-gray-50 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500">Adresse Email</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                />
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-[11px] text-green-600 font-semibold">{infoMessage}</span>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm">
                                    <Save className="h-3.5 w-3.5" />
                                    <span>Enregistrer</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Formulaire 2 : Sécurité / Mot de passe */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                            <Lock className="h-4 w-4 text-red-500" />
                            <span>Sécurité du compte</span>
                        </h3>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-500">Mot de passe actuel</label>
                                <input 
                                    type="password" 
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500">Nouveau mot de passe</label>
                                    <input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500">Confirmer le mot de passe</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full bg-gray-50 text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-[11px] text-green-600 font-semibold">{passMessage}</span>
                                <button type="submit" className="bg-gray-800 hover:bg-gray-950 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>Modifier le mot de passe</span>
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
}