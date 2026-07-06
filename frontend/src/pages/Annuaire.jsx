import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Search, UserPlus, UserCheck, Clock, ArrowRight, Users } from 'lucide-react';

export default function Annuaire() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState({}); // Gère le chargement par utilisateur pour les requêtes

    // 1. Charger tous les utilisateurs de la plateforme (GET)
    const loadUsers = async () => {
        try {
            const response = await fetch(`http://localhost/api/users/index.php?current_user_id=${currentUser.id}`);
            const data = await response.json();
            if (data.success) {
                setUsers(data.users || []);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Erreur lors du chargement de l\'annuaire.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentUser]);

    // 2. Envoyer une invitation d'ami (POST)
    const handleAddFriend = async (targetUserId) => {
        setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
        const formData = new FormData();
        formData.append('sender_id', currentUser.id);
        formData.append('receiver_id', targetUserId);

        try {
            const response = await fetch('http://localhost/api/users/request.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                loadUsers(); // Recharge la liste pour passer le statut à 'pending'
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Impossible d\'envoyer la demande.');
        } finally {
            setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
        }
    };

    // Filtrer le tableau d'utilisateurs dynamiquement par rapport à la saisie
    const filteredUsers = users.filter(user => 
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center pt-24 font-semibold text-gray-500 text-xs">Chargement des étudiants...</div>;
    if (error) return <div className="text-center pt-24 text-red-500 font-semibold text-xs">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 pt-20 pb-8">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 space-y-6">
                
                {/* Entête de l'Annuaire */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                    <div>
                        <h2 className="text-base font-black text-gray-800 flex items-center space-x-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <span>Annuaire de l'École</span>
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">Retrouve et connecte-toi avec tous les membres enregistrés.</p>
                    </div>

                    {/* Barre de Recherche Graphique */}
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un étudiant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>
                </div>

                {/* Liste sous forme de Grille */}
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 text-xs font-semibold text-gray-400">
                        Aucun membre trouvé pour "{searchTerm}"
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredUsers.map((member) => (
                            <div 
                                key={member.id} 
                                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex items-center justify-between hover:border-gray-300 transition group"
                            >
                                {/* Zone d'infos cliquable pour voir le profil */}
                                <div 
                                    onClick={() => navigate(`/profile/${member.id}`)}
                                    className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                                >
                                    <img 
                                        src={member.avatar ? `http://localhost/${member.avatar}` : 'https://via.placeholder.com/150'} 
                                        alt="" 
                                        className="w-11 h-11 rounded-full object-cover border border-gray-100"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs font-black text-gray-800 group-hover:text-blue-600 transition truncate">
                                            {member.firstname} {member.lastname}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-medium truncate">{member.email}</p>
                                    </div>
                                </div>

                                {/* Actions dynamiques selon le lien de parenté (BDD) */}
                                <div className="ml-2 flex items-center">
                                    {member.is_friend ? (
                                        <span className="p-2 text-green-600 bg-green-50 rounded-xl" title="Vous êtes amis">
                                            <UserCheck className="h-4 w-4" />
                                        </span>
                                    ) : member.request_status === 'pending' ? (
                                        <span className="p-2 text-yellow-600 bg-yellow-50 rounded-xl" title="Invitation envoyée en attente">
                                            <Clock className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleAddFriend(member.id)}
                                            disabled={actionLoading[member.id]}
                                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition disabled:opacity-50"
                                            title="Ajouter comme ami"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                        </button>
                                    )}

                                    {/* Petit bouton pour forcer la redirection vers le profil */}
                                    <button 
                                        onClick={() => navigate(`/profile/${member.id}`)}
                                        className="p-2 text-gray-400 hover:text-gray-800 rounded-xl ml-1 transition"
                                        title="Voir le profil complet"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}