
import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/verify-staff-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode })
      });

      if (response.ok) {
        setIsVerified(true);
        toast.success("Code d'accès valide. Veuillez vous identifier.");
      } else {
        toast.error("Code d'accès invalide.");
      }
    } catch (error) {
      toast.error("Erreur lors de la vérification.");
    } finally {
      setLoading(false);
    }
  };

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
          toast.success("Bienvenue, Administrateur !");
          navigate('/admin');
        } else {
          // For other users, they need to be added by an admin first
          await auth.signOut();
          toast.error("Accès refusé. Votre compte n'est pas encore activé par un administrateur.");
          setIsVerified(false);
          setAccessCode('');
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
          <p className="text-gray-500 dark:text-gray-400 mt-2">Espace réservé à l'équipe éditoriale.</p>
        </div>

        {!isVerified ? (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2 dark:text-white">Code d'accès Staff</label>
              <input 
                type="password" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Entrez votre code secret"
                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Vérifier l'accès
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl text-green-600 dark:text-green-400 text-sm text-center font-medium">
              Accès autorisé. Veuillez utiliser votre compte Google professionnel.
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 dark:text-white"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
              {loading ? "Connexion en cours..." : "Continuer avec Google"}
            </button>
            <button 
              onClick={() => setIsVerified(false)}
              className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Retour
            </button>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            En cas de perte de votre code, contactez l'administrateur technique.
          </p>
        </div>
      </div>
    </div>
  );
}
