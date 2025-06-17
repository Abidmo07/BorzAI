'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { useParams } from 'next/navigation';
import { Send, Bot, User } from 'lucide-react';

if (typeof window !== 'undefined' && !window.Echo) {
  window.Pusher = Pusher;
  window.Echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
  });
}

export default function Chat() {
  const {chatId}=useParams();
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    axios.get(`http://localhost:8000/api/chats/${chatId}/messages`)
      .then(res => setMessages(res.data.messages))
      .catch(console.error);
  }, [chatId]);

  useEffect(() => {
    if (!window.Echo) return;
    const channel = window.Echo.channel('chat');
    channel.listen('AiReplied', ({ bot_response, botResponse, ...e }) => {
      setIsTyping(false);
      const text = bot_response || botResponse || e.message || '';
      setMessages(prev => [...prev, { sender: 'ai', content: text }]);
    });
    return () => {
      channel.stopListening('AiReplied');
      window.Echo.leaveChannel('chat');
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async e => {
    e.preventDefault();
    if (!content.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', content }]);
    setIsTyping(true);
    try {
      const res = await axios.post(`http://localhost:8000/api/chats/${chatId}/send`, {
        content,
        chat_id: chatId,
      });
      
      const { user_message, ai_message } = res.data;
      setMessages(prev => [
        ...prev.slice(0, -1),
        user_message,
        ai_message,
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'error', content: 'Send failed.' }]);
    } finally {
      setIsTyping(false);
      setContent('');
    }
  };

  const renderMessage = (msg, idx) => {
    const text = msg.content;
    const sender = msg.sender;
    const isUser = sender === 'user';
    const isError = sender === 'error';
    const isAi = sender === 'ai';

    return (
      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        <div className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg
            ${isUser 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
              : isError 
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            }
          `}>
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Message bubble */}
          <div className={`
            relative px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl
            ${isUser 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
              : isError 
                ? 'bg-red-500/20 border border-red-500/30 text-red-200'
                : 'bg-white/10 border border-white/20 text-white backdrop-blur-xl'
            }
          `}>
            {/* Message tail */}
            <div className={`
              absolute top-4 w-3 h-3 transform rotate-45
              ${isUser 
                ? 'right-[-6px] bg-gradient-to-r from-purple-600 to-pink-600' 
                : isError 
                  ? 'left-[-6px] bg-red-500/20 border-l border-b border-red-500/30'
                  : 'left-[-6px] bg-white/10 border-l border-b border-white/20'
              }
            `} />

            {/* Message content */}
            <div className="relative z-10">
              {isAi ? (
                <ReactMarkdown components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="my-4">
                        <SyntaxHighlighter 
                          style={vscDarkPlus} 
                          language={match[1]} 
                          PreTag="div" 
                          className="rounded-lg !bg-slate-900/50 backdrop-blur-sm border border-white/10"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-white/20 text-purple-200 rounded px-2 py-1 text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}>{text}</ReactMarkdown>
              ) : <span className="prose prose-sm max-w-none">{text}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full overflow-hidden bg-white/5 backdrop-blur-sm border-l border-white/10">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(renderMessage)}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 
                            flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t border-white/10 p-6 bg-white/5 backdrop-blur-xl">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl 
                     px-6 py-4 text-white placeholder-gray-400 shadow-lg transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
          />
          <button
            type="submit"
            disabled={!content.trim() || isTyping}
            className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2
              shadow-lg transform hover:scale-105 active:scale-95 ${
              !content.trim() || isTyping 
                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/20' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>{isTyping ? 'Sending...' : 'Send'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}