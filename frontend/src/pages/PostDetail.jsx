import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Heart, MessageSquare, Trash2, Edit3, Send, ArrowLeft } from 'lucide-react';

export default function PostDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // États d'édition du Post
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');

    // État nouveau commentaire
    const [newComment, setNewComment] = useState('');

    // 1. Charger le post et ses commentaires (GET)
    const loadPostData = async () => {
        try {
            const response = await fetch(`http://localhost/api/posts/single.php?id=${id}`);
            const data = await response.json();
            if (data.success) {
                setPost(data.post);
                setComments(data.comments);
                setEditContent(data.post.contenu);
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
        loadPostData();
    }, [id]);

    // 2. Modifier le post (POST - via ton index.php qui gère l'update si post_id est fourni)
    const handleUpdatePost = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('post_id', post.id);
        formData.append('user_id', user.id);
        formData.append('contenu', editContent);

        try {
            const response = await fetch('http://localhost/api/posts/index.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                setIsEditing(false);
                loadPostData();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Erreur lors de la modification.');
        }
    };

    // 3. Supprimer le post (DELETE)
    const handleDeletePost = async () => {
        if (!window.confirm('Es-tu sûr de vouloir supprimer ce post, my gee ?')) return;

        try {
            const response = await fetch(`http://localhost/api/posts/single.php?id=${post.id}&user_id=${user.id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                navigate('/');
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Erreur de communication.');
        }
    };

    // 4. Ajouter un commentaire (POST)
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const formData = new FormData();
        formData.append('texte', newComment);
        formData.append('user_id', user.id);
        formData.append('post_id', post.id);

        try {
            const response = await fetch('http://localhost/api/posts/comment.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                setNewComment('');
                loadPostData();
            }
        } catch (err) {
            alert('Impossible d\'ajouter le commentaire.');
        }
    };

    // 5. Supprimer un commentaire (DELETE)
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Supprimer ce commentaire ?')) return;

        try {
            const response = await fetch(`http://localhost/api/posts/comment.php?comment_id=${commentId}&user_id=${user.id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                loadPostData();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Erreur réseau.');
        }
    };

    if (loading) return <div className="text-center pt-24 font-semibold text-gray-500 text-xs">Chargement...</div>;
    if (error) return <div className="text-center pt-24 text-red-500 font-semibold text-xs">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 pt-20 pb-8">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 space-y-4">
                
                <button onClick={() => navigate(-1)} className="flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 transition">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour</span>
                </button>

                {/* Bloc Principal du Post */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img src={`http://localhost/${post.user_avatar}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <h3 className="text-sm font-black text-gray-800">{post.firstname} {post.lastname}</h3>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {new Date(post.created_at).toLocaleDateString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>

                        {/* Options si c'est le post de l'utilisateur connecté */}
                        {user.id === post.user_id && (
                            <div className="flex space-x-2">
                                <button onClick={() => setIsEditing(!isEditing)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition">
                                    <Edit3 className="h-4 w-4" />
                                </button>
                                <button onClick={handleDeletePost} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-50 transition">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdatePost} className="space-y-2">
                            <textarea 
                                value={editContent} 
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full text-xs p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                                rows="3"
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs bg-gray-100 font-bold rounded-xl hover:bg-gray-200 transition">Annuler</button>
                                <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Enregistrer</button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{post.contenu}</p>
                    )}
                </div>

                {/* Section Commentaires */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commentaires ({comments.length})</h4>

                    {/* Écrire un commentaire */}
                    <form onSubmit={handleAddComment} className="flex space-x-3 items-center">
                        <img src={`http://localhost/${user.avatar}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ajouter un commentaire..."
                                className="w-full bg-gray-50 text-xs pl-4 pr-10 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            />
                            <button type="submit" className="absolute right-2 top-2 text-blue-600 hover:text-blue-700 transition">
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </form>

                    {/* Liste des commentaires */}
                    <div className="space-y-3 pt-2">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start space-x-3 text-xs group">
                                <img src={`http://localhost/${comment.user_avatar}`} alt="" className="w-8 h-8 rounded-full object-cover mt-0.5" />
                                <div className="flex-1 bg-gray-50 p-3 rounded-2xl relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-gray-800">{comment.firstname} {comment.lastname}</span>
                                        <span className="text-[9px] text-gray-400">
                                            {new Date(comment.created_at).toLocaleDateString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 leading-normal">{comment.texte}</p>

                                    {/* Pouvoir supprimer son commentaire */}
                                    {user.id === comment.user_id && (
                                        <button 
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="absolute right-3 bottom-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}