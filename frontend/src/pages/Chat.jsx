import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Send, Image, X, MessageSquare, Loader2, Plus, Users } from 'lucide-react';

export default function Chat() {
    const { user } = useAuth();
    
    // États Volet Gauche (4/12)
    const [conversations, setConversations] = useState([]);
    const [friends, setFriends] = useState([]); 
    const [loadingLeft, setLoadingLeft] = useState(true);
    const [showFriendSelector, setShowFriendSelector] = useState(false);
    
    // États Volet Droit (9/12)
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Input & Images
    const [textMessage, setTextMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const loadLeftPanelData = async () => {
        if (!user?.id) return;
        setLoadingLeft(true);
        try {
            const resConv = await fetch(`http://localhost/api/chat/conversation.php?current_user_id=${user.id}`);
            const dataConv = await resConv.json();
            if (dataConv.success) setConversations(dataConv.conversations || []);

            const resUsers = await fetch(`http://localhost/api/users/index.php?current_user_id=${user.id}`);
            const dataUsers = await resUsers.json();
            if (dataUsers.success) {
                const onlyFriends = (dataUsers.users || []).filter(u => u.is_friend);
                setFriends(onlyFriends);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLeft(false);
        }
    };

    const loadMessages = async (contactId, silent = false) => {
        if (!user?.id || !contactId) return;
        if (!silent) setLoadingMessages(true);
        try {
            const response = await fetch(`http://localhost/api/chat/message.php?current_user_id=${user.id}&contact_id=${contactId}`);
            const data = await response.json();
            if (data.success) setMessages(data.messages || []);
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    };

    useEffect(() => { loadLeftPanelData(); }, [user]);

    useEffect(() => {
        if (!selectedContact) return;
        loadMessages(selectedContact.id);
        const interval = setInterval(() => { loadMessages(selectedContact.id, true); }, 3000);
        return () => clearInterval(interval);
    }, [selectedContact]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!textMessage.trim() && !imageFile) return;

        const formData = new FormData();
        formData.append('sender_id', user.id);
        formData.append('receiver_id', selectedContact.id);
        formData.append('message', textMessage);
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch('http://localhost/api/chat/send.php', { method: 'POST', body: formData });
            const data = await response.json();
            if (data.success) {
                setTextMessage('');
                setImageFile(null);
                setImagePreview(null);
                loadMessages(selectedContact.id, true);
                loadLeftPanelData();
            }
        } catch (err) {
            alert("Erreur d'envoi");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-24 pb-6 px-4">
            <Navbar />

            {/* Grille 3/9 pour donner plus de place à la conversation */}
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 h-[75vh]">
                
                {/* Liste des conversations (3 colonnes) */}
                <div className="col-span-4 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden h-full shadow-sm">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                            {showFriendSelector ? "Mes Amis" : "Conversations"}
                        </span>
                        <button 
                            onClick={() => setShowFriendSelector(!showFriendSelector)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                        >
                            {showFriendSelector ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {loadingLeft ? (
                            <div className="text-center py-4 text-xs text-gray-400">Chargement...</div>
                        ) : showFriendSelector ? (
                            friends.map((friend) => (
                                <button
                                    key={friend.id}
                                    onClick={() => { setSelectedContact(friend); setShowFriendSelector(false); }}
                                    className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-50 text-left"
                                >
                                    <img src={`http://localhost/${friend.avatar}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                                    <span className="text-xs font-bold text-gray-700 truncate">{friend.firstname} {friend.lastname}</span>
                                </button>
                            ))
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedContact(conv)}
                                    className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition ${selectedContact?.id === conv.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                                >
                                    <img src={`http://localhost/${conv.avatar}`} className="w-9 h-9 rounded-full object-cover" alt="" />
                                    <span className="text-xs font-bold truncate">{conv.firstname} {conv.lastname}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Conversation ouverte (9 colonnes) */}
                <div className="col-span-8 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden h-full shadow-sm">
                    {selectedContact ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center space-x-3 bg-gray-50">
                                <img src={`http://localhost/${selectedContact.avatar}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                                <span className="text-xs font-bold text-gray-800">{selectedContact.firstname} {selectedContact.lastname}</span>
                            </div>

                            {/* Zone messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                                {loadingMessages ? (
                                    <div className="h-full flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-500" /></div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.sender_id === user.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] rounded-2xl p-3 text-xs ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                                                    {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                                                    {msg.image_url && <img src={`http://localhost/${msg.image_url}`} className="rounded-lg max-h-40 mt-1 object-cover" alt="" />}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input form */}
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex items-center space-x-2 bg-white">
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => {
                                    if(e.target.files[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }
                                }} />
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-blue-600"><Image className="h-4 w-4" /></button>
                                
                                <div className="flex-1 flex flex-col">
                                    {imagePreview && (
                                        <div className="relative w-12 h-12 mb-1 border rounded-lg overflow-hidden">
                                            <img src={imagePreview} className="w-full h-full object-cover" alt="" />
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center"><X className="h-3 w-3" /></button>
                                        </div>
                                    )}
                                    <input type="text" value={textMessage} onChange={(e) => setTextMessage(e.target.value)} placeholder="Votre message..." className="w-full bg-gray-50 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                                </div>

                                <button type="submit" disabled={!textMessage.trim() && !imageFile} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl disabled:opacity-40 transition"><Send className="h-4 w-4" /></button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare className="h-8 w-8 text-gray-200 mb-1" />
                            <p className="text-xs">Sélectionnez un contact pour démarrer la discussion.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}