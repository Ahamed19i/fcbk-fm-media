import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface NewsletterFormProps {
  variant?: 'inline' | 'sidebar';
}

export default function NewsletterForm({ variant = 'inline' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const emailToSubscribe = email.trim().toLowerCase();

    if (honeypot) {
      toast.success('Merci pour votre inscription !');
      setEmail('');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailToSubscribe || !emailRegex.test(emailToSubscribe)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return;
    }

    setSubmitting(true);
    try {
      const subscriberDocRef = doc(db, 'subscribers', emailToSubscribe);
      const docSnap = await getDoc(subscriberDocRef);
      
      if (docSnap.exists()) {
        toast.info("Vous êtes déjà inscrit !");
        setEmail('');
        setSubmitting(false);
        return;
      }

      await setDoc(subscriberDocRef, {
        email: emailToSubscribe,
        subscribedAt: new Date().toISOString(),
        status: 'active'
      });

      // Attempt Brevo API call
      try {
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToSubscribe })
        });
      } catch (e) {
        console.warn("Brevo API error, but Firestore saved.");
      }

      toast.success('Inscription réussie ! Merci de nous suivre.');
      setEmail('');
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Une erreur est survenue. Réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  if (variant === 'sidebar') {
    return (
      <form onSubmit={handleSubscribe} className="space-y-3">
        <div className="hidden" aria-hidden="true">
          <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} />
        </div>
        <input 
          type="email" 
          placeholder="Votre email" 
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-black bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm" 
          required
        />
        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors text-sm flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "S'abonner"
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
      <div className="hidden" aria-hidden="true">
        <input type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)} tabIndex={-1} />
      </div>
      <input 
        type="email" 
        placeholder="Votre email" 
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="px-4 py-3 rounded-xl text-black dark:text-white bg-white dark:bg-gray-800 w-full md:w-64 focus:ring-2 focus:ring-blue-400 outline-none" 
        required
      />
      <button 
        type="submit" 
        disabled={submitting}
        className="bg-black dark:bg-gray-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-black transition-colors whitespace-nowrap disabled:opacity-50 flex items-center justify-center min-w-[120px]"
      >
        {submitting ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "S'abonner"
        )}
      </button>
    </form>
  );
}
