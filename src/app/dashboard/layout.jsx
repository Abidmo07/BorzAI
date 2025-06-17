'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { MessageCircle, Plus, LogOut, User, Menu, X } from 'lucide-react';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie');
        const userRes = await axios.get('http://localhost:8000/api/user');
        const chatRes = await axios.get('http://localhost:8000/api/chats');
        setUser(userRes.data);
        setChats(chatRes.data.chats);
      } catch (err) {
        console.error(err);
        router.replace('/auth/login');
      }
    };
    init();
  }, [router]);

  const handleNewChat = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/newChat');
      const newChat = res.data.chat;
      setChats(prev => [newChat, ...prev]);
      router.push(`/dashboard/chat/${newChat.id}`);
      setSelectedChatId(newChat.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatClick = (id) => {
    setSelectedChatId(id);
    router.push(`/dashboard/chat/${id}`);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout');
      router.push('/auth/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative lg:translate-x-0 z-50 
        w-80 h-full bg-white/10 backdrop-blur-xl border-r border-white/20 
        flex flex-col transition-transform duration-300 ease-out text-white
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ChatHub
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                     text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 
                     flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/25 
                     transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Your Chats
          </h2>
          <nav className="space-y-2">
            {chats.map((c, index) => (
              <button
                key={c.id}
                onClick={() => handleChatClick(c.id)}
                className={`
                  group w-full text-left px-4 py-3 rounded-xl transition-all duration-200
                  hover:bg-white/10 hover:shadow-lg hover:scale-102 transform
                  ${selectedChatId === c.id 
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50 shadow-lg' 
                    : 'hover:border border-transparent hover:border-white/20'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                    ${selectedChatId === c.id 
                      ? 'bg-purple-500' 
                      : 'bg-white/10 group-hover:bg-white/20'
                    }
                  `}>
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`
                      font-medium truncate transition-colors
                      ${selectedChatId === c.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}
                    `}>
                      {c.title || `Chat #${c.id}`}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* User profile and logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {user && (
            <div className="flex items-center space-x-3 px-2 py-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50
                     text-red-200 hover:text-white px-4 py-3 rounded-xl font-medium transition-all duration-200
                     flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-red-500/25
                     transform hover:scale-105 active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden text-white">
        {/* Header */}
        <header className="px-6 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {user?.name ? `Welcome, ${user.name}` : 'Dashboard'}
                </h1>
                <p className="text-gray-400 text-sm">
                  Ready to continue your conversation
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Online</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden bg-white/5 backdrop-blur-sm text-gray-900">
          {children}
        </div>
      </main>
    </div>
  );
}