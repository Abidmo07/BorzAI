"use client"
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true
export default function EmailVerificationNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user_id = searchParams.get("user_id");
  const hash = searchParams.get("hash");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");

  useEffect(() => {

    const id = searchParams.get("id");
    const hash = searchParams.get("hash");
    const expires = searchParams.get("expires");
    const signature = searchParams.get("signature");
    const handleVerification = async () => {
      if (id && hash && expires && signature) {
        try {

          const response = await axios.get(`http://localhost:8000/api/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`);
          console.log(response);
          console.log("verified with success")
          router.push("/auth/login");
        }
        catch (error) {
          console.log(error)
        }

      }


    }

    handleVerification();
  }, [user_id, hash, expires, signature])




  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
          <span className="text-3xl text-blue-600">📩</span>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Verify your email
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          We've sent a verification link to your email address. Please check your inbox and click the link to continue.
        </p>

        <button
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          Resend Verification Email
        </button>
      </div>
    </div>
  );
}
