import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Récupération de l'ID et du mail transmis par la page ForgotPassword
    const userId = location.state?.userId || '';
    const email = location.state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Note : Si ton script PHP valide aussi le code à 6 chiffres dans ce même fichier,
        // pense à rajouter formData.append('code', code);
        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('new_password', newPassword);

        try {
            const response = await fetch('http://localhost/api/auth/reset-password.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setSuccess(data.message || 'Mot de passe modifié avec succès !');
                
                // Connexion automatique grâce à l'objet user retourné par ton PHP
                if (data.user) {
                    login(data.user);
                }

                // Redirection directe vers l'accueil connecté
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(data.message || 'Une erreur est survenue.');
            }
        } catch (err) {
            setError('Impossible de joindre le serveur.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-blue-600 tracking-wider">NOUVEAU PASSE</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Saisis le code reçu par mail et ton nouveau mot de passe pour ton compte <span className="font-semibold text-gray-700">{email}</span>.
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center border border-red-100">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-semibold text-center border border-green-100">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Champ Code de vérification */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Code de validation</label>
                        <input 
                            type="text" 
                            maxLength="6"
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            required 
                            placeholder="000000" 
                            className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
                        />
                    </div>

                    {/* Champ Nouveau Mot de Passe */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nouveau mot de passe</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            placeholder="••••••••" 
                            className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm disabled:opacity-50"
                    >
                        {loading ? 'Modification...' : 'Réinitialiser le mot de passe'}
                    </button>
                </form>

                <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">Retourner à la connexion</Link>
                </div>
            </div>
        </div>
    );
}