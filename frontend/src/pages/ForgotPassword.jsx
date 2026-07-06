import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const formData = new FormData();
        formData.append('email', email);

        try {
            const response = await fetch('http://localhost/api/auth/forgot-password.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                // On redirige vers l'écran de réinitialisation en passant l'ID et le mail reçus
                setTimeout(() => {
                    navigate('/reset-password', { 
                        state: { 
                            userId: data.user_id,
                            email: email 
                        } 
                    });
                }, 2000);
            } else {
                setError(data.message || "Cette adresse e-mail n'existe pas.");
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
                    <h1 className="text-2xl font-black text-blue-600 tracking-wider">RÉCUPÉRATION</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Saisis ton e-mail pour recevoir un code de réinitialisation, my gee.
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center border border-red-100">{error}</div>}
                {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-semibold text-center border border-green-100">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse E-mail</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="ton-compte@mail.com" 
                            className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm disabled:opacity-50"
                    >
                        {loading ? 'Envoi en cours...' : 'Envoyer le code'}
                    </button>
                </form>

                <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <Link to="/login" className="text-blue-600 font-bold hover:underline">Retour à la connexion</Link>
                </div>
            </div>
        </div>
    );
}