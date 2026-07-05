import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, FileText, UserPlus, Trash2, ShieldAlert, LogOut } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // État de l'onglet actif : 'stats' | 'users' | 'posts' | 'add_staff'
    const [activeTab, setActiveTab] = useState('stats');

    // États des données du Back Office
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allPosts, setAllPosts] = useState([]);

    // Formulaire d'ajout de staff (Admin seulement)
    const [staffForm, setStaffForm] = useState({ firstname: '', lastname: '', email: '', password: '', role: 'moderator' });
    const [formMessage, setFormMessage] = useState('');

    // Sécurité : Redirection si l'utilisateur n'est pas du Staff
    useEffect(() => {
        if (!user || user.role === 'user') {
            navigate('/admin-login');
        } else {
            loadDashboardData();
            loadUsersData();
            loadPostsData();
        }
    }, [user]);

    // --- APPELS API BACK-OFFICE ---
    const loadDashboardData = async () => {
        try {
            const res = await fetch('http://localhost/api/admin/dashboard.php');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setRecentUsers(data.recent_users);
            }
        } catch (err) { console.error("Erreur stats", err); }
    };

    const loadUsersData = async () => {
        try {
            const res = await fetch('http://localhost/api/admin/users.php');
            const data = await res.json();
            if (data.success) setAllUsers(data.users);
        } catch (err) { console.error(err); }
    };

    const loadPostsData = async () => {
        try {
            const res = await fetch('http://localhost/api/admin/posts.php');
            const data = await res.json();
            if (data.success) setAllPosts(data.posts);
        } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return;
        try {
            const res = await fetch(`http://localhost/api/admin/users.php?user_id=${userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadUsersData();
                loadDashboardData();
            }
        } catch (err) { alert("Erreur suppression"); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Supprimer cette publication ?")) return;
        try {
            const res = await fetch(`http://localhost/api/admin/posts.php?post_id=${postId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                loadPostsData();
                loadDashboardData();
            }
        } catch (err) { alert("Erreur suppression"); }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(staffForm).forEach(key => formData.append(key, staffForm[key]));

        try {
            const res = await fetch('http://localhost/api/admin/users.php', { method: 'POST', body: formData });
            const data = await res.json();
            setFormMessage(data.message);
            if (data.success) {
                setStaffForm({ firstname: '', lastname: '', email: '', password: '', role: 'moderator' });
            }
        } catch (err) { setFormMessage("Erreur serveur."); }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex">
            {/* Sidebar de Gauche */}
            <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col justify-between p-4 fixed h-full">
                <div>
                    <div className="flex items-center space-x-2 px-2 py-4 border-b border-gray-800 mb-6">
                        <ShieldAlert className="h-6 w-6 text-red-500" />
                        <span className="font-black text-sm tracking-wider uppercase">BO PANEL</span>
                    </div>

                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
                            <BarChart3 className="h-4 w-4" /> <span>Vue d'ensemble</span>
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
                            <Users className="h-4 w-4" /> <span>Utilisateurs</span>
                        </button>
                        <button onClick={() => setActiveTab('posts')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'posts' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
                            <FileText className="h-4 w-4" /> <span>Publications</span>
                        </button>
                        {user?.role === 'admin' && (
                            <button onClick={() => setActiveTab('add_staff')} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${activeTab === 'add_staff' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-900'}`}>
                                <UserPlus className="h-4 w-4" /> <span>Ajouter Staff</span>
                            </button>
                        )}
                    </nav>
                </div>

                <div className="border-t border-gray-800 pt-4">
                    <div className="px-4 py-2 text-[11px] text-gray-500 font-medium">
                        Connecté : <span className="text-gray-300 font-bold capitalize">{user?.firstname} ({user?.role})</span>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs text-red-400 font-bold hover:bg-red-950/30 rounded-xl transition">
                        <LogOut className="h-4 w-4" /> <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Zone de Contenu Principal (Décalée à cause de la sidebar fixed) */}
            <main className="flex-1 ml-64 p-8">
                
                {/* 1. ONGLET STATS / DASHBOARD */}
                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <h1 className="text-lg font-black tracking-tight">Tableau de bord</h1>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Utilisateurs inscrits</p>
                                <p className="text-3xl font-black text-white mt-1">{stats?.total_users || 0}</p>
                            </div>
                            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Publications au total</p>
                                <p className="text-3xl font-black text-white mt-1">{stats?.total_posts || 0}</p>
                            </div>
                            <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Commentaires écrits</p>
                                <p className="text-3xl font-black text-white mt-1">{stats?.total_comments || 0}</p>
                            </div>
                        </div>

                        <div className="bg-gray-950 rounded-2xl border border-gray-800 p-6">
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-4">Dernières inscriptions</h3>
                            <div className="divide-y divide-gray-800">
                                {recentUsers.map(u => (
                                    <div key={u.id} className="py-3 flex justify-between items-center text-xs">
                                        <div><p className="font-bold text-gray-200">{u.firstname} {u.lastname}</p><p className="text-gray-500 text-[10px]">{u.email}</p></div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.is_active ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>{u.is_active ? 'Actif' : 'Banni'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ONGLET COMPTES UTILISATEURS */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <h1 className="text-lg font-black tracking-tight">Gestion des Étudiants</h1>
                        <div className="bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-900/50 border-b border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <tr><th className="p-4">Avatar</th><th className="p-4">Identité</th><th className="p-4">Email</th><th className="p-4">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {allUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-900/40">
                                            <td className="p-4"><img src={`http://localhost/${u.avatar}`} className="w-8 h-8 rounded-full object-cover border border-gray-800 bg-gray-900" alt="" /></td>
                                            <td className="p-4 font-bold text-gray-200">{u.firstname} {u.lastname}</td>
                                            <td className="p-4 text-gray-400">{u.email}</td>
                                            <td className="p-4">
                                                <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-500 p-1 bg-red-950/20 hover:bg-red-950/50 rounded-lg transition" title="Supprimer définitivement">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. ONGLET MODÉRATION POSTS */}
                {activeTab === 'posts' && (
                    <div className="space-y-6">
                        <h1 className="text-lg font-black tracking-tight">Flux des publications</h1>
                        <div className="space-y-4">
                            {allPosts.map(p => (
                                <div key={p.id} className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center space-x-2 text-[10px]">
                                            <span className="font-bold text-gray-300">{p.firstname} {p.lastname}</span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-gray-500">{new Date(p.created_at).toLocaleString('fr-FR')}</span>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/30 p-3 rounded-xl border border-gray-900">{p.contenu}</p>
                                    </div>
                                    <button onClick={() => handleDeletePost(p.id)} className="text-red-400 hover:text-red-500 p-2 bg-red-950/20 hover:bg-red-950/50 rounded-xl transition mt-5">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. ONGLET AJOUT COMPTE STAFF (RÉSERVÉ ADMIN) */}
                {activeTab === 'add_staff' && user?.role === 'admin' && (
                    <div className="max-w-xl space-y-6">
                        <h1 className="text-lg font-black tracking-tight">Créer un profil Staff</h1>
                        <form onSubmit={handleAddStaff} className="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
                            {formMessage && <div className="p-3 bg-blue-950/40 border border-blue-800 rounded-xl text-xs text-blue-400 font-bold">{formMessage}</div>}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Prénom</label><input type="text" required value={staffForm.firstname} onChange={e => setStaffForm({...staffForm, firstname: e.target.value})} className="w-full bg-gray-900 text-xs px-3 py-2 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-600" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Nom</label><input type="text" required value={staffForm.lastname} onChange={e => setStaffForm({...staffForm, lastname: e.target.value})} className="w-full bg-gray-900 text-xs px-3 py-2 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-600" /></div>
                            </div>
                            
                            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Adresse E-mail</label><input type="email" required value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="w-full bg-gray-900 text-xs px-3 py-2 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-600" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Mot de passe provisoire</label><input type="text" required value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="w-full bg-gray-900 text-xs px-3 py-2 border border-gray-800 rounded-xl focus:outline-none focus:border-blue-600" /></div>
                            
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Attribuer le rôle</label>
                                <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full bg-gray-900 text-xs px-3 py-2 border border-gray-800 rounded-xl focus:outline-none text-gray-200">
                                    <option value="moderator">Modérateur (Lecture, suppression)</option>
                                    <option value="admin">Administrateur (Contrôle total)</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md">Enregistrer le membre</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}