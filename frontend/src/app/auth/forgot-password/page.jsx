'use client'
import axios from 'axios';
import React, { useState } from 'react';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/forgot-password',{email} );
            console.log(response);
            setMessage('If the email exists, a password reset link has been sent.');
            console.log('Forgot password for:', email);
        }
        catch (error) {
            console.error(error);
        }



    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Forgot Password</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="example@domain.com"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition duration-300"
                    >
                        Send Reset Link
                    </button>

                    {message && (
                        <p className="text-sm text-green-600 text-center mt-4">{message}</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
