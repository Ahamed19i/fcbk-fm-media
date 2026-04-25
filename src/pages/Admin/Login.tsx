
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
      // Small delay to ensure SDK is stable and has attempted to recover session
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const isReturnFromAuth = window.location.search.includes('apiKey=') || 
                               window.location.hash.includes('access_token=') ||
                               localStorage.getItem('fb-auth-pending') === 'true';

      if (isReturnFromAuth) {
        setIsRedirecting(true);
        console.log("AdminLogin: Detected return from OAuth redirect, waiting for result...");
      }

      try {
        const result = await getRedirectResult(auth);
        localStorage.removeItem('fb-auth-pending');
        
        if (result) {
          console.log("AdminLogin: Successfully recovered user from redirect:", result.user.email);
          toast.success("Connexion réussie !");
          setIsRedirecting(false);
        } else if (isReturnFromAuth) {
          console.log("AdminLogin: No redirect result, but check if user exists anyway...");
          if (auth.currentUser) {
            console.log("AdminLogin: User already authenticated:", auth.currentUser.email);
            setIsRedirecting(false);
          } else {
            // Give it one last chance
            setTimeout(() => {
              if (!auth.currentUser) {
                setIsRedirecting(false);
                console.log("AdminLogin: Giving up on redirect result.");
              }
            }, 2000);
          }
        }
      } catch (error: any) {
        console.error("AdminLogin: Redirect completion error:", error);
        localStorage.removeItem('fb-auth-pending');
        setIsRedirecting(false);
        
        if (error.code === 'auth/unauthorized-domain') {
          toast.error("ERREUR DOMAINE : L'URL " + window.location.hostname + " doit être ajoutée aux 'Domaines autorisés' dans Firebase.");
        } else if (error.code !== 'auth/popup-closed-by-user') {
          toast.error(`Erreur d'authentification : ${error.code}`);
        }
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
          {(loading || isRedirecting || profileLoading) ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>{isRedirecting ? "Finalisation..." : "Connexion en cours..."}</span>
              </div>
              {loading && !isRedirecting && (
                <button 
                  onClick={() => {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    setIsRedirecting(true);
                    localStorage.setItem('fb-auth-pending', 'true');
                    signInWithRedirect(auth, provider);
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Problème avec le popup ? Cliquez ici pour la redirection
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
              <span>Continuer avec Google</span>
            </button>
          )}
        </div>

        <div className="mt-8 text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1"> Diagnostic de Production </p>
          <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight space-y-1">
            <p>Domaine: <span className="font-mono font-bold text-gray-900 dark:text-white">{window.location.hostname}</span></p>
            <p>Projet IDs: <span className="font-mono">{import.meta.env.VITE_FIREBASE_PROJECT_ID || "non défini"}</span></p>
            <p>Base de données: <span className="font-mono">{import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)"}</span></p>
            <p>Config OK: {!import.meta.env.VITE_FIREBASE_API_KEY ? "❌" : "✅"}</p>
            <p>Status Auth: {auth.currentUser ? "Connecté" : "Déconnecté"}</p>
            {isRedirecting && <p className="text-blue-500 animate-pulse font-bold">🔄 Finalisation de la session...</p>}
            <p className="pt-3 text-gray-400">
              Si les IDs ne correspondent pas à votre console Firebase, modifiez vos variables VITE_FIREBASE_* sur Vercel et redeployez.
            </p>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => {
                  toast.info(`Email: ${auth.currentUser?.email || "N/A"} | UID: ${auth.currentUser?.uid || "N/A"}`);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 px-2 py-1.5 rounded hover:bg-gray-300 transition-colors"
              >
                Diagnostic
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Lien copié !");
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 px-2 py-1.5 rounded hover:bg-gray-300 transition-colors"
              >
                Copier lien
              </button>
            </div>
            <p className="pt-2 text-[8px] text-gray-400 leading-tight">
              ⚠️ Si vous venez de Facebook/WhatsApp, utilisez Safari ou Chrome pour une meilleure compatibilité des cookies Google.
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
