import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch('http://localhost/api/admin/login.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                login(data.user); // Renseigne le AuthContext
                navigate('/admin/dashboard'); // En route vers le BO
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Erreur réseau ou serveur inaccessible.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="max-w-sm w-full bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-red-950/50 border border-red-900 text-red-400 rounded-2xl mb-1">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <h1 className="text-sm font-black text-gray-100 uppercase tracking-widest">Connexion Back-Office</h1>
                    <p className="text-[11px] text-gray-500">Réservé exclusivement aux administrateurs et modérateurs.</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-400 font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">E-mail Professionnel</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-950 text-xs px-3 py-2.5 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-600 text-gray-200"
                            placeholder="nom.prenom@ecole.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mot de passe</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-950 text-xs px-3 py-2.5 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-600 text-gray-200"
                            placeholder="••••••••"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md mt-2"
                    >
                        {loading ? "Vérification..." : "S'authentifier"}
                    </button>
                </form>

            </div>
        </div>
    );
}