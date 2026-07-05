import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { BookOpen, Settings, FolderOpen, Heart, MessageSquare, Send, UserPlus, Users, Check, X } from 'lucide-react';

export default function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // États pour le Fil d'actualité
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [postsError, setPostsError] = useState('');

    // États pour les widgets Amis & Invitations (Colonne de Droite)
    const [requests, setRequests] = useState([]);
    const [friends, setFriends] = useState([]);

    // 1. Récupérer les posts (GET)
    const fetchPosts = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`http://localhost/api/posts/index.php?current_user_id=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setPosts(data.posts);
            } else {
                setPostsError(data.message);
            }
        } catch (err) {
            setPostsError('Impossible de charger les publications.');
        } finally {
            setLoadingPosts(false);
        }
    };

    // 2. Récupérer les invitations reçues en attente (GET)
    const fetchFriendRequests = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`http://localhost/api/users/request.php?current_user_id=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des demandes d\'amis');
        }
    };

    // 3. Récupérer la liste des amis validés (GET)
    const fetchFriends = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`http://localhost/api/friends/index.php?user_id=${user.id}`);
            const data = await response.json();
            if (data.success) {
                setFriends(data.friends || []);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des amis');
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchFriendRequests();
        fetchFriends();
    }, [user]);

    // 4. Soumettre un nouveau post (POST)
    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('contenu', newPostContent);

        try {
            const response = await fetch('http://localhost/api/posts/index.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                setNewPostContent(''); 
                fetchPosts(); 
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Erreur lors de la publication.');
        }
    };

    // 5. Traitement des Likes (POST)
    const handleLike = async (postId) => {
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('article_id', postId);

        try {
            const response = await fetch('http://localhost/api/posts/like.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                fetchPosts(); 
            }
        } catch (err) {
            console.error("Erreur du traitement du like");
        }
    };

    // 6. Répondre à une invitation d'ami (POST - accept / reject)
    const handleRequestResponse = async (requestId, action) => {
        const formData = new FormData();
        formData.append('request_id', requestId);
        formData.append('action', action);

        try {
            const response = await fetch('http://localhost/api/users/respond.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                fetchFriendRequests(); // Rafraîchit le widget des requêtes
                fetchFriends();        // Met à jour la liste d'amis si accepté
                fetchPosts();          // Actualise le fil si nécessaire
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Erreur lors du traitement de la demande.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-20 pb-8">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-12 gap-6">
                
                {/* ================= COLONNE DE GAUCHE : Profil ================= */}
                <aside className="hidden lg:block lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col items-center text-center">
                        <img 
                            src={user?.avatar ? `http://localhost/${user.avatar}` : 'https://via.placeholder.com/150'} 
                            alt="Mon Avatar" 
                            className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 shadow-sm mb-3"
                        />
                        <h2 className="text-sm font-black text-gray-800">
                            {user?.firstname} {user?.lastname}
                        </h2>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Raccourcis</h3>
                        <ul className="text-xs font-semibold text-gray-700 space-y-1">
                            <li 
                                onClick={() => navigate(`/profile/${user?.id}`)}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                            >
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <span>Mon Journal</span>
                            </li>
                            <li 
                                onClick={() => navigate('/settings')}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition"
                            >
                                <Settings className="h-4 w-4 text-gray-500" />
                                <span>Paramètres du compte</span>
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* ================= COLONNE CENTRALE : Fil d'actualité ================= */}
                <main className="col-span-12 md:col-span-8 lg:col-span-6 space-y-4">
                    
                    {/* Zone de création de Post */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                        <form onSubmit={handleCreatePost} className="flex items-start space-x-3">
                            <img 
                                src={user?.avatar ? `http://localhost/${user.avatar}` : 'https://via.placeholder.com/150'} 
                                alt="" 
                                className="w-9 h-9 rounded-full object-cover mt-1"
                            />
                            <div className="flex-1 space-y-2">
                                <textarea 
                                    rows="2"
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder={`Quoi de neuf, ${user?.firstname}, my gee ?`} 
                                    className="w-full bg-gray-50 text-xs px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
                                />
                                <div className="flex justify-end">
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm">
                                        <Send className="h-3.5 w-3.5" />
                                        <span>Publier</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Zone Dynamique des Publications */}
                    {loadingPosts ? (
                        <div className="text-center py-6 text-xs font-semibold text-gray-500">Chargement du fil d'actualité...</div>
                    ) : postsError ? (
                        <div className="text-center py-6 text-xs text-red-500 bg-red-50 rounded-xl">{postsError}</div>
                    ) : posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-200">
                            <FolderOpen className="h-8 w-8 text-gray-300 mb-2" />
                            <p className="text-xs font-semibold">Aucune publication pour le moment.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
                                {/* Entête du Post */}
                                <div className="flex items-center space-x-2.5">
                                    <img 
                                        src={post.user_avatar ? `http://localhost/${post.user_avatar}` : 'https://via.placeholder.com/150'} 
                                        alt="" 
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                    <div>
                                        {/* Lien vers la page profil de l'auteur */}
                                        <button 
                                            onClick={() => navigate(`/profile/${post.user_id}`)}
                                            className="text-xs font-black text-gray-800 hover:text-blue-600 hover:underline text-left block"
                                        >
                                            {post.firstname} {post.lastname}
                                        </button>
                                        <span className="text-[10px] text-gray-400 font-medium block">
                                            {new Date(post.created_at).toLocaleDateString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>

                                {/* Contenu du Post */}
                                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {post.contenu}
                                </p>

                                {/* Zone d'actions */}
                                <div className="flex items-center space-x-4 pt-2 border-t border-gray-100 text-gray-500 text-xs font-semibold">
                                    <button 
                                        onClick={() => handleLike(post.id)} 
                                        className={`flex items-center space-x-1.5 hover:text-red-500 transition ${post.has_liked ? 'text-red-500' : ''}`}
                                    >
                                        <Heart className={`h-4 w-4 ${post.has_liked ? 'fill-current' : ''}`} />
                                        <span>{post.total_likes}</span>
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate(`/post/${post.id}`)} 
                                        className="flex items-center space-x-1.5 hover:text-blue-600 transition"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{post.total_comments}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                </main>

                {/* ================= COLONNE DE DROITE : Widgets Amis ================= */}
                <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-4">
                    
                    {/* Widget Demandes d'amis dynamique */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                        <h3 className="text-xs font-bold text-gray-800 mb-3 flex justify-between items-center">
                            <span className="flex items-center space-x-1.5">
                                <UserPlus className="h-4 w-4 text-gray-500" />
                                <span>Invitations</span>
                            </span>
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {requests.length}
                            </span>
                        </h3>
                        
                        {requests.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Aucune demande en attente.</p>
                        ) : (
                            <div className="space-y-3">
                                {requests.map((req) => (
                                    <div key={req.request_id} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
                                        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate(`/profile/${req.sender_id}`)}>
                                            <img src={`http://localhost/${req.avatar}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                                            <span className="text-[11px] font-bold text-gray-700 truncate max-w-[100px]">
                                                {req.firstname}
                                            </span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button 
                                                onClick={() => handleRequestResponse(req.request_id, 'accept')}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-md transition"
                                                title="Accepter"
                                            >
                                                <Check className="h-3 w-3" />
                                            </button>
                                            <button 
                                                onClick={() => handleRequestResponse(req.request_id, 'reject')}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-1 rounded-md transition"
                                                title="Refuser"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Widget Liste d'Amis dynamique */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                            <Users className="h-4 w-4" />
                            <span>Mes Amis</span>
                        </h3>
                        
                        {friends.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">Tes amis s'afficheront ici.</p>
                        ) : (
                            <div className="grid grid-cols-4 gap-2">
                                {friends.map((friend) => (
                                    <div 
                                        key={friend.id} 
                                        onClick={() => navigate(`/profile/${friend.id}`)}
                                        className="flex flex-col items-center cursor-pointer group"
                                        title={`${friend.firstname} ${friend.lastname}`}
                                    >
                                        <img 
                                            src={`http://localhost/${friend.avatar}`} 
                                            alt="" 
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:border-blue-500 transition"
                                        />
                                        <span className="text-[9px] font-medium text-gray-500 truncate w-full text-center mt-1">
                                            {friend.firstname}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

            </div>
        </div>
    );
}