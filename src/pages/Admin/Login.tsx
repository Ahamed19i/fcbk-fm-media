
import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in our users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // If it's the first admin (the one provided in context)
        if (user.email === "ahassanimhoma20@gmail.com") {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: user.displayName,
            role: 'admin',
            createdAt: new Date().toISOString()
          });
          
          // Note: Custom claims will need to be set via the backend
          // For the very first login, the user might need to refresh to get the claim
          // or we can trigger a role assignment API call here.
          
          toast.success("Bienvenue, Administrateur ! (Initialisation...)");
          navigate('/admin');
        } else {
          // For other users, they need to be added by an admin first
          await auth.signOut();
          toast.error("Accès refusé. Votre compte n'est pas encore activé par un administrateur.");
        }
      } else {
        toast.success("Connexion réussie !");
        navigate('/admin');
      }
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
