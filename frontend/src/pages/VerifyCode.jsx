import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function VerifyCode() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // Récupération des infos envoyées par Register.jsx
    const email = location.state?.email || '';
    const userId = location.state?.userId || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Préparation du FormData pour ton fichier de vérification
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('code', code);

        try {
            const response = await fetch('http://localhost/api/auth/verify-account.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setSuccess('Compte activé avec succès, my gee ! Redirection vers la connexion...');
                setTimeout(() => navigate('/login'), 2500);
            } else {
                setError(data.message || 'Code invalide ou déjà utilisé.');
            }
        } catch (err) {
            setError('Impossible de joindre le serveur de validation.');
        }
    };

    return (
        <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <div class="text-center">
                    <h1 class="text-2xl font-black text-blue-600 tracking-wider">VÉRIFICATION</h1>
                    <p class="text-gray-500 text-sm mt-2">
                        Saisis le code reçu à l'adresse :<br />
                        <span class="font-bold text-gray-700">{email || "ton e-mail"}</span>
                    </p>
                </div>

                {error && <div class="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center border border-red-100">{error}</div>}
                {success && <div class="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-semibold text-center border border-green-100">{success}</div>}

                <form onSubmit={handleSubmit} class="space-y-4">
                    <div>
                        <input 
                            type="text" 
                            maxLength="6"
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            required 
                            placeholder="000000" 
                            class="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
                        />
                    </div>

                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm">
                        Activer mon compte
                    </button>
                </form>
            </div>
        </div>
    );
}