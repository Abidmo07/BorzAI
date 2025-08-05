"use client";
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
axios.defaults.withCredentials=true;
axios.defaults.withXSRFToken=true;
const ResetPassword = () => {
 const [password,setPassword]=useState('');
 const [password_confirmation,setPassword_Confirmation]=useState("");
  
  const router=useRouter();
  const searchParams=useSearchParams();
  const email=decodeURIComponent(searchParams.get("email"));
  const token=searchParams.get("token");

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
 const response =await axios.post("http://localhost:8000/api/reset-password",{token,password,password_confirmation,email})
    
     router.push("/auth/login")
    }
    catch(error){
        console.error(error)
    }
   
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
            
         

          <div>
            <label className="block text-sm font-medium text-gray-600">New Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type="password"
              name="password_confirmation"
              value={password_confirmation}
              onChange={(e)=>setPassword_Confirmation(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition duration-300"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
