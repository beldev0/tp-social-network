import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('email', email);
        formData.append('password', password);
        if (avatar) {
            formData.append('avatar', avatar);
        }

        try {
            // URL corrigée sans le port 8000
            const response = await fetch('http://localhost/api/auth/register.php', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                setSuccess('Inscription réussie ! Un code vient de t\'être envoyé par e-mail.');
                setTimeout(() => {
                    navigate('/verify-code', {
                        state: {
                            email: email,
                            userId: data.id
                        }
                    });
                }, 2000);
            } else {
                setError(data.message || "Une erreur est survenue lors de l'inscription.");
            }
        } catch (err) {
            setError('Impossible de joindre le serveur.');
        }
    };

    return (
        <div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div class="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <div class="text-center">
                    <h1 class="text-3xl font-black text-blue-600 tracking-wider">REJOINDRE LA BANANE</h1>
                    <p class="text-gray-500 text-sm mt-2">Crée ton compte en 2 secondes chrono.</p>
                </div>

                {error && <div class="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center border border-red-100">{error}</div>}
                {success && <div class="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-semibold text-center border border-green-100">{success}</div>}

                <form onSubmit={handleSubmit} class="space-y-4">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Prénom</label>
                            <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required placeholder="John" class="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Nom</label>
                            <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required placeholder="Doe" class="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Adresse E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john.doe@mail.com" class="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Mot de passe</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" class="w-full bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition" />
                    </div>

                    <div>
                        <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Avatar (Optionnel)</label>
                        <input type="file" onChange={(e) => setAvatar(e.target.files[0])} accept="image/*" class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                    </div>

                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm mt-2">
                        Créer mon compte
                    </button>
                </form>

                <div class="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Déjà inscrit ? <Link to="/login" class="text-blue-600 font-bold hover:underline">Se connecter</Link>
                </div>
            </div>
        </div>
    );
}