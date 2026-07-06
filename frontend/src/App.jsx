import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyCode from './pages/VerifyCode';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Annuaire from './pages/Annuaire';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';


const HomePlaceholder = () => {
  const { logout } = useAuth();
  return (
    <div class="p-8">
      <h1 class="text-2xl font-bold">Bienvenue sur Banana Connect, my gee ! 🍌</h1>
      <p class="text-gray-600 mt-2">Tu es connecté avec succès.</p>
      <button onClick={logout} class="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
        Se déconnecter
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. Formulaires accessibles publiquement */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* 2. Zone privée du réseau social (Verrouillée) */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/post/:id" element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          } />

          <Route path="/profile/:id" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/annuaire" element={
            <ProtectedRoute>
              <Annuaire />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />        
        </Routes>
      </Router>
    </AuthProvider>
  );
}