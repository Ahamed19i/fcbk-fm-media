

import React, { useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle redirect result on mount
  useEffect(() => {
    const handleRedirect = async () => {
      // Check if we are potentially returning from a redirect
      const isReturnFromAuth = window.location.search.includes('apiKey=') || 
                               window.location.hash.includes('access_token=') ||
                               localStorage.getItem('fb-auth-pending') === 'true';

      if (isReturnFromAuth) {
        setIsRedirecting(true);
      }

      try {
        const result = await getRedirectResult(auth);
        localStorage.removeItem('fb-auth-pending');
        
        if (result) {
          toast.success("Connexion réussie !");
          // The profile useEffect will take over to navigate
        }
      } catch (error: any) {
        console.error("Redirect login error:", error);
        localStorage.removeItem('fb-auth-pending');
        
        if (error.code === 'auth/unauthorized-domain') {
          toast.error("DOMAINE NON AUTORISÉ : Vérifiez que fcbk-fm-media.vercel.app est bien dans votre console Firebase.");
        } else if (error.code !== 'auth/popup-closed-by-user') {
          toast.error(`Erreur: ${error.message}`);
        }
      } finally {
        setIsRedirecting(false);
      }
    };
    handleRedirect();
  }, []);

  // Redirect if already logged in and profile is ready
  useEffect(() => {
    if (profile && !profileLoading && !isRedirecting) {
      const from = (location.state as any)?.from?.pathname || "/admin";
      navigate(from, { replace: true });
    }
  }, [profile, profileLoading, navigate, location, isRedirecting]);

  const handleGoogleLogin = async () => {
    if (loading || isRedirecting) return;
    setLoading(true);
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Always try popup first, it's easier
      await signInWithPopup(auth, provider);
      toast.success("Connexion réussie !");
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        toast.info("Tentative de connexion par redirection...");
        setIsRedirecting(true);
        localStorage.setItem('fb-auth-pending', 'true');
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirError: any) {
          setIsRedirecting(false);
          localStorage.removeItem('fb-auth-pending');
          toast.error("Échec de la redirection: " + redirError.message);
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error("ERREUR DE DOMAINE : fcbk-fm-media.vercel.app n'est pas autorisé dans Firebase.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setLoading(false);
      } else {
        toast.error(`Erreur: ${error.message}`);
      }
    } finally {
      if (!isRedirecting) {
        setLoading(false);
      }
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
            disabled={loading || isRedirecting || profileLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 dark:text-white shadow-sm"
          >
            {(loading || isRedirecting || profileLoading) ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>{isRedirecting ? "Finalisation..." : "Connexion..."}</span>
              </div>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                <span>Continuer avec Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1"> Diagnostic de Production </p>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight space-y-1">
            <p>Domaine: <span className="font-mono font-bold">{window.location.hostname}</span></p>
            <p>Config: {!import.meta.env.VITE_FIREBASE_API_KEY ? "❌ MANQUANTE SUR VERCEL" : "✅ PRÉSENTE"}</p>
            <p className="pt-2 text-gray-400">
              Vérifiez vos Variables d'Environnement sur le dashboard Vercel.
            </p>
          </div>
        </div>

        {profile && (
          <div className="mt-4">
            <button 
              onClick={() => auth.signOut()}
              className="text-xs text-red-500 hover:underline w-full text-center"
            >
              Se déconnecter ({profile.email})
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">
            Accès Réservé
          </p>
        </div>
      </div>
    </div>
  );
}
