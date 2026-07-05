import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ArrowLeft, FolderOpen, UserPlus, UserCheck, Clock, MessageSquare } from 'lucide-react';

export default function Profile() {
    const { id } = useParams(); // ID du profil visité
    const { user: currentUser } = useAuth(); // Utilisateur connecté
    const navigate = useNavigate();

    const [profileUser, setProfileUser] = useState(null);
    const [profilePosts, setProfilePosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [requestLoading, setRequestLoading] = useState(false);

    // 1. Charger les infos du profil et ses posts (GET)
    const loadProfileData = async () => {
        try {
            const response = await fetch(`http://localhost/api/users/profil.php?profile_id=${id}&current_user_id=${currentUser.id}`);
            const data = await response.json();
            
            if (data.success) {
                setProfileUser(data.user);
                setProfilePosts(data.posts || []);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Erreur de connexion avec le serveur.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfileData();
    }, [id]);

    // 2. Envoyer une demande d'ami (POST)
    const handleSendRequest = async () => {
        if (requestLoading) return;
        setRequestLoading(true);

        const formData = new FormData();
        formData.append('sender_id', currentUser.id);
        formData.append('receiver_id', profileUser.id);

        try {
            const response = await fetch('http://localhost/api/users/request.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                // On recharge pour mettre à jour le statut du bouton à "pending"
                loadProfileData();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Impossible d\'envoyer l\'invitation.');
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading) return <div className="text-center pt-24 font-semibold text-gray-500 text-xs">Chargement du profil...</div>;
    if (error) return <div className="text-center pt-24 text-red-500 font-semibold text-xs">{error}</div>;

    const isOwnProfile = currentUser.id === profileUser.id;

    return (
        <div className="min-h-screen bg-gray-100 pt-20 pb-8">
            <Navbar />
            
            <div className="max-w-2xl mx-auto px-4 space-y-6">
                
                {/* Bouton Retour */}
                <button onClick={() => navigate(-1)} className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour</span>
                </button>

                {/* En-tête de la carte Profil */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex flex-col items-center text-center relative">
                    <img 
                        src={profileUser?.avatar ? `http://localhost/${profileUser.avatar}` : 'https://via.placeholder.com/150'} 
                        alt="" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 shadow-md mb-4"
                    />
                    
                    <h2 className="text-base font-black text-gray-800">
                        {profileUser?.firstname} {profileUser?.lastname}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{profileUser?.email}</p>
                    
                

                    {/* Zone de Bouton de Relation Dynamique (uniquement si ce n'est pas notre propre profil) */}
                    {!isOwnProfile && (
                        <div className="mt-4 w-full max-w-xs">
                            {profileUser?.is_friend ? (
                                <div className="flex items-center justify-center space-x-1.5 bg-green-50 text-green-700 font-bold text-xs py-2 rounded-xl border border-green-100">
                                    <UserCheck className="h-4 w-4" />
                                    <span>Vous êtes amis</span>
                                </div>
                            ) : profileUser?.request_status === 'pending' ? (
                                <div className="flex items-center justify-center space-x-1.5 bg-yellow-50 text-yellow-700 font-bold text-xs py-2 rounded-xl border border-yellow-100">
                                    <Clock className="h-4 w-4" />
                                    <span>Invitation en attente</span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSendRequest}
                                    disabled={requestLoading}
                                    className="w-full flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition shadow-sm disabled:opacity-50"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span>{requestLoading ? 'Envoi...' : "Ajouter comme ami"}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Section Publications du Profil */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                        {isOwnProfile ? "Mes Publications" : `Publications de ${profileUser?.firstname}`} ({profilePosts.length})
                    </h3>

                    {profilePosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-200">
                            <FolderOpen className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-xs font-semibold">Aucun post publié pour le moment.</p>
                        </div>
                    ) : (
                        profilePosts.map((post) => (
                            <div 
                                key={post.id} 
                                onClick={() => navigate(`/post/${post.id}`)}
                                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3 cursor-pointer hover:border-gray-300 transition"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400 font-semibold">
                                        Publié le {new Date(post.created_at).toLocaleDateString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    <div className="text-gray-400 hover:text-blue-600 transition">
                                        <MessageSquare className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {post.contenu}
                                </p>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}