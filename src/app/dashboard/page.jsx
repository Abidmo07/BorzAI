'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Loading from '../components/Loading';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Don't show UI until we know
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie');
        const res = await axios.get('http://localhost:8000/api/user');
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.replace('/auth/login'); // no flashback to dashboard
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout');
      router.push('/auth/login');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">AI Chatbot</h2>
        <nav className="flex flex-col gap-4 text-gray-700">
          <a href="#" className="hover:text-blue-600">Dashboard</a>
          <a href="#" className="hover:text-blue-600">Conversations</a>
          <a href="#" className="hover:text-blue-600">Bot Settings</a>
          <a href="#" className="hover:text-blue-600">Users</a>
          <a href="#" className="hover:text-blue-600">Logs</a>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome, {user?.name || 'User'}</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Sign Out
          </button>
        </header>

        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto bg-gray-50">
          <div className="max-w-xl self-start bg-white shadow p-4 rounded-md">
            <p className="text-gray-800">Hello! How can I help you today?</p>
          </div>

          <div className="max-w-xl self-end bg-blue-100 shadow p-4 rounded-md">
            <p className="text-gray-800">What’s the weather like in Algiers?</p>
          </div>

          <div className="max-w-xl self-start bg-white shadow p-4 rounded-md">
            <p className="text-gray-800">It’s sunny and 25°C in Algiers.</p>
          </div>
        </div>

        <div className="p-4 bg-white shadow">
          <form className="flex items-center gap-4">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
