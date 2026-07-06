import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch('http://localhost/api/auth/login.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                login(data.user);
                navigate('/'); 
            } else {
                setError(data.message || 'Identifiants incorrects.');
            }
        } catch (err) {
            setError('Impossible de joindre le serveur backend.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-blue-600 tracking-wider">BANANA CONNECT</h1>
                    <p className="text-gray-500 text-sm mt-2">Connecte-toi pour retrouver tes potes, my gee.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="exemple@mail.com" className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-gray-600 uppercase">Mot de passe</label>

                            <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                                Mot de passe oublié ?
                            </Link>
                        </div>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm">
                        Se connecter
                    </button>
                </form>

                <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Pas encore inscrit ? <Link to="/register" className="text-blue-600 font-bold hover:underline">Créer un compte</Link>
                </div>
            </div>
        </div>
    );
}