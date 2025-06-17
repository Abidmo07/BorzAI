'use client';

import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Get CSRF cookie first
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");
      // Then post to your login API
      const response = await axios.post("http://localhost:8000/api/login", formData);
      console.log(response);
      
      router.push("/dashboard/chat/1");
    } catch (error) {
      console.error(error);
    }
  };

  const handleOAuth = (provider) => {
    // Redirect to Laravel Socialite endpoint for Google or GitHub
    router.push(`http://localhost:8000/oauth/${provider}/redirect`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header / Title */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                {/* Google “G” logo */}
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.5 0 6.7 1.2 9.2 3.2l6.9-6.9C36.1 2.9 30.5 0 24 0 14 0 5.2 5.8 1.7 14.2l8 6.2C11.1 14.1 17.1 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.5 24.1c0-1.6-.1-3.1-.4-4.6H24v8.7h12.6c-.5 2.8-2.1 5.1-4.5 6.7l6.9 5.3c4-3.7 6.4-9.2 6.4-15.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.3 28.6c-1-2.9-1-6.1 0-9l-8-6.2c-3.3 6.9-3.3 14.9 0 21.8l8-6.2z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.5 0 12-2.1 16-5.7l-6.9-5.3c-1.9 1.3-4.3 2.1-9.1 2.1-6.9 0-12.9-4.6-15-10.8l-8 6.2C5.2 42.2 14 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuth('github')}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                {/* GitHub “cat” logo */}
                <path
                  fillRule="evenodd"
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.042C6.728 20.26 6.14 18.69 6.14 18.69c-.546-1.39-1.334-1.76-1.334-1.76-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.236 1.84 1.236 1.07 1.836 2.807 1.305 3.492.998.108-.776.42-1.305.763-1.605-2.665-.303-5.466-1.333-5.466-5.93 0-1.31.468-2.382 1.236-3.22-.124-.303-.536-1.523.116-3.176 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.288-1.23 3.288-1.23.656 1.653.244 2.873.12 3.176.77.838 1.236 1.91 1.236 3.22 0 4.61-2.802 5.625-5.475 5.92.432.37.816 1.102.816 2.222v3.293c0 .32.216.694.825.576C20.565 21.796 24 17.296 24 12c0-6.63-5.37-12-12-12z"
                  clipRule="evenodd"
                />
              </svg>
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
