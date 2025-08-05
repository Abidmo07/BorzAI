'use client'
import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export default function EmailVerifyPage() {
  const router = useRouter();
  const { id, hash } = useParams();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const expires = searchParams.get('expires');
    const signature = searchParams.get('signature');

    if (!expires || !signature) {
      setStatus('Invalid verification link.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`
        );

        setStatus('Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } catch (error) {
        console.error(error);
        setStatus('Verification failed. The link may be expired or invalid.');
      }
    };

    verifyEmail();
  }, [id, hash, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">{status}</h1>
      </div>
    </div>
  );
}
