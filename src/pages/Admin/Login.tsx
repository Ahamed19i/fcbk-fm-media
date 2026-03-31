
import React, { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { toast } from 'sonner';
import { UserProfile } from '../../types';

interface LoginProps {
  profile: UserProfile | null;
  loading: boolean;
}

export default function AdminLogin({ profile, loading: profileLoading }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in and profile is ready
  useEffect(() => {
    if (profile && !profileLoading) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [profile, profileLoading, navigate, location]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Connexion réussie !");
      // App.tsx will handle the profile check and ProtectedRoute will handle the final redirection
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-10 border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-10">
          <span className="text-4xl font-black tracking-tighter text-black dark:text-white mb-4 block">
            FCBK<span className="text-blue-600">FM</span>
          </span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portail Staff</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Connectez-vous avec votre compte professionnel.</p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 dark:text-white shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
            {loading ? "Connexion en cours..." : "Continuer avec Google"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            L'accès est restreint aux membres autorisés de FCBK FM.
          </p>
        </div>
      </div>
    </div>
  );
}
