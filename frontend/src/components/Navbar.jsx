import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, MessageSquare, Users, LogOut, Search } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 h-16 z-50 shadow-xs">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
                
                {/* À GAUCHE : Logo & Recherche */}
                <div className="flex items-center space-x-3 flex-1">
                    <span className="text-xl font-black text-blue-600 tracking-wider cursor-pointer" onClick={() => navigate('/')}>
                        BANANA
                    </span>
                    <div className="hidden sm:block relative max-w-xs w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher sur le réseau..." 
                            className="w-full bg-gray-100 text-xs pl-9 pr-4 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* AU CENTRE : Navigation Onglets */}
                <div className="flex items-center space-x-2 md:space-x-6 h-full">
                    <NavLink 
                        to="/" 
                        className={({ isActive }) => `h-full px-6 flex items-center border-b-2 transition-colors ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-blue-600'}`}
                        title="Fil d'actualité"
                    >
                        <Home className="h-5 w-5" />
                    </NavLink>
                    <NavLink 
                        to="/chat" 
                        className={({ isActive }) => `h-full px-6 flex items-center border-b-2 transition-colors ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-blue-600'}`}
                        title="Discussions"
                    >
                        <MessageSquare className="h-5 w-5" />
                    </NavLink>
                    <NavLink 
                        to="/annuaire" 
                        className={({ isActive }) => `h-full px-6 flex items-center border-b-2 transition-colors ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-blue-600'}`}
                        title="Annuaire des étudiants"
                    >
                        <Users className="h-5 w-5" />
                    </NavLink>
                </div>

                {/* À DROITE : Profil & Déconnexion */}
                <div className="flex items-center space-x-4 flex-1 justify-end">
                    <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-full pr-3 border border-gray-100">
                        <img 
                            src={user?.avatar ? `http://localhost/${user.avatar}` : 'https://via.placeholder.com/150'} 
                            alt="Avatar" 
                            className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-gray-700 hidden md:inline">
                            {user?.firstname}
                        </span>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold p-2 rounded-xl transition"
                        title="Déconnexion"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>

            </div>
        </nav>
    );
}