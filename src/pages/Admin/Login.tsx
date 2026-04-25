

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

      if (!isReturnFromAuth) return;

      setIsRedirecting(true);
      console.log("AdminLogin: Handling return from auth...");

      try {
        const result = await getRedirectResult(auth);
        localStorage.removeItem('fb-auth-pending');
        
        if (result) {
          console.log("AdminLogin: Redirect success for", result.user.email);
          toast.success("Authentification réussie !");
          // Stay in isRedirecting(true) until profile useEffect redirects us
        } else {
          // If result is null, user might already be authed via persistence
          console.log("AdminLogin: Redirect result was null, checking auth current state...");
          if (auth.currentUser) {
            console.log("AdminLogin: User already present via persistence");
          } else {
            // Wait a bit more for auth state to stabilize
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (!auth.currentUser) {
              console.warn("AdminLogin: No user found after waiting.");
              setIsRedirecting(false);
            }
          }
        }
      } catch (error: any) {
        console.error("AdminLogin: Redirect error", error);
        localStorage.removeItem('fb-auth-pending');
        setIsRedirecting(false);
        if (error.code !== 'auth/popup-closed-by-user') {
          toast.error(`Erreur: ${error.code}`);
        }
      }
    };
    handleRedirect();
  }, []);

  // Redirect if already logged in and profile is ready
  useEffect(() => {
    if (profile && !profileLoading) {
      console.log("AdminLogin: Profile ready, navigating to dashboard...");
      navigate('/admin/dashboard', { replace: true });
    }
  }, [profile, profileLoading, navigate]);

  const handleGoogleLogin = async () => {
    if (loading || isRedirecting) return;
    setLoading(true);
    
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      console.log("AdminLogin: Trying signInWithPopup...");
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        toast.success("Connecté !");
      }
    } catch (error: any) {
      console.warn("AdminLogin: Popup error", error.code);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        toast.info("Redirection vers Google...");
        setIsRedirecting(true);
        localStorage.setItem('fb-auth-pending', 'true');
        await signInWithRedirect(auth, provider);
      } else {
        toast.error(`Erreur: ${error.message}`);
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
            <p>Status Auth: {auth.currentUser ? "✅ Connecté" : "❌ Déconnecté"}</p>
            <p>Email Firebase: <span className="font-mono text-blue-600 dark:text-blue-400">{auth.currentUser?.email || "Aucun"}</span></p>
            <p>UID: <span className="font-mono text-[8px]">{auth.currentUser?.uid || "N/A"}</span></p>
            <p>Profil Chargé: {profile ? "✅ OUI" : "❌ NON"}</p>
            <p>Rôle: <span className="font-bold">{profile?.role || "Aucun"}</span></p>
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
              <p className="text-[8px] uppercase font-bold text-gray-400">Conseils :</p>
              <ul className="list-disc pl-3 mt-1 space-y-1">
                <li>Vérifiez que votre email est exactement celui autorisé.</li>
                <li>Assurez-vous que la base de données Firestore correspond à votre config Vercel.</li>
              </ul>
            </div>
            <p className="pt-3 text-gray-400">
              Note importante : Si vous tournez en boucle, assurez-vous d'avoir ajouté <span className="font-bold underline">{window.location.hostname}</span> dans la section "Domaines autorisés" de l'Authentication Firebase.
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
