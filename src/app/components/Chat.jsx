'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

    console.log('Pusher initialized on window.');

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });

    console.log('Laravel Echo initialized on window:', window.Echo);
} else {
    console.warn('Window is undefined, Echo/Pusher initialization skipped.');
}

export default function Chat() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        console.log('Chat component mounted. Starting Echo setup...');

        if (!window.Echo) {
            console.error('Laravel Echo not initialized on window.Echo. Cannot subscribe to channels.');
            return;
        }

        console.log('Attempting to connect to Echo and subscribe to "chat" channel...');

        const connection = window.Echo.connector.pusher.connection;
        connection.bind('state_change', (states) => {
            console.log("Reverb connection state changed from", states.previous, "to", states.current);
            if (states.current === 'connected') {
                console.log('Reverb connection established successfully!');
            } else if (states.current === 'disconnected' || states.current === 'failed') {
                console.error('Reverb connection failed or disconnected:', states.current);
            }
        });

        const channel = window.Echo.channel('chat');
        console.log('Subscribed to "chat" channel object:', channel);

        channel.listen('AiReplied', (e) => {
            setIsTyping(false);
            console.log('----------------------------------------------------');
            console.log('!!! RECEIVED AiReplied EVENT !!!');
            console.log('Full event object (e):', e);
            console.log('Type of e:', typeof e);
            console.log('Value of e.bot_response:', e.bot_response);
            console.log('Value of e.botResponse (camelCase):', e.botResponse);
            console.log('----------------------------------------------------');

            let botText = 'Error: Bot response not found.';
            if (e && typeof e === 'object') {
                if (e.bot_response) {
                    botText = e.bot_response;
                } else if (e.botResponse) {
                    botText = e.botResponse;
                } else if (e.message) {
                    botText = e.message;
                }
            } else if (typeof e === 'string') {
                botText = e;
            }

            console.log('Bot text to be added:', botText);
            console.log('Current chat state before update:', chat);

            setChat(prevChat => {
                const updatedChat = [...prevChat, { type: 'ai', text: botText }];
                console.log('Chat state updated with AI response. New chat state:', updatedChat);
                return updatedChat;
            });
        });

        console.log('Echo subscription complete. Listening for AiReplied events...');

        return () => {
            console.log('Cleaning up Echo subscription. Leaving "chat" channel.');
            if (window.Echo) {
                channel.stopListening('AiReplied');
                window.Echo.leaveChannel('chat');
            }
        };
    }, []);

    useEffect(() => {
        console.log('Chat state changed:', chat);
    }, [chat]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            console.log('Scrolled to end of chat.');
        }
    }, [chat, isTyping]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            console.warn('Attempted to send empty message.');
            return;
        }

        const userMessage = message;
        setChat(prevChat => [...prevChat, { type: 'user', text: userMessage }]);
        setMessage('');
        setIsTyping(true);
        console.log('User message added to chat state. Sending to API:', userMessage);

        try {
            console.log('Sending message to Laravel API via POST:', userMessage);
            const response = await axios.post('http://localhost:8000/api/send', { message: userMessage });
            console.log('Message sent successfully. API response data:', response.data);
            
            // Add the bot response to the chat if it exists in the API response
            if (response.data && response.data.bot_response) {
                setIsTyping(false);
                setChat(prevChat => [...prevChat, { type: 'ai', text: response.data.bot_response }]);
            }
        } catch (error) {
            console.error('Error sending message to API:', error.response?.data || error.message || error);
            setIsTyping(false);
            setChat(prevChat => [...prevChat, { type: 'error', text: 'Message failed to send. Please try again.' }]);
        }
    };

    const renderMessage = (msg) => {
        if (msg.type === 'user' || msg.type === 'error') {
            return <div className="prose prose-sm max-w-none">{msg.text}</div>;
        }

        return (
            <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-200  rounded px-1" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => <p className="mb-4">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
          
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100 rounded-lg shadow-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chat.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2 ${
                            msg.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : msg.type === 'error'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-300 text-gray-800'
                        }`}>
                            {renderMessage(msg)}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-300 rounded-2xl px-4 py-2">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white">
                <div className="flex space-x-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || isTyping}
                        className={`px-6 py-2 rounded-full font-medium text-white ${
                            !message.trim() || isTyping
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } transition-colors duration-200`}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
