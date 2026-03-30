
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import { ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import SEO from '../components/SEO';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article | null>(null);
  const [trending, setTrending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      // 1. Save to Firestore (as backup)
      await addDoc(collection(db, 'subscribers'), {
        email,
        subscribedAt: new Date().toISOString(),
        status: 'active'
      });
      
      // 2. Call Brevo API via our server
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Failed to subscribe');
      
      toast.success('Merci pour votre inscription ! Vous recevrez bientôt nos alertes.');
      setEmail('');
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Une erreur est survenue lors de l'inscription.");
    }
  };

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const fetchedArticles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
        
        setArticles(fetchedArticles);
        setBreakingNews(fetchedArticles.find(a => a.isBreaking) || fetchedArticles[0]);
        setTrending(fetchedArticles.slice(1, 6));
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      <SEO />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {breakingNews && <ArticleCard article={breakingNews} variant="large" />}
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Recent News */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 dark:text-white">
                <Zap className="text-yellow-500" fill="currentColor" /> Dernières Actualités
              </h2>
              <Link to="/category/national" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.slice(1, 5).map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Middle Banner */}
            <div className="my-12 p-8 bg-blue-600 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
              <div className="max-w-md text-center md:text-left">
                <h3 className="text-2xl font-black mb-2">Restez informé en temps réel</h3>
                <p className="text-blue-100 text-sm">Abonnez-vous à notre newsletter pour recevoir les alertes info directement dans votre boîte mail.</p>
              </div>
              <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-xl text-black w-full md:w-64 focus:ring-2 focus:ring-blue-400 outline-none" 
                  required
                />
                <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors whitespace-nowrap">S'abonner</button>
              </form>
            </div>

            {/* More News */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.slice(5, 9).map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="mb-12">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4 dark:text-white">
                  <TrendingUp className="text-red-500" /> Tendances
                </h2>
                <div className="space-y-6">
                  {trending.map((article, idx) => (
                    <div key={article.id} className="flex gap-4">
                      <span className="text-3xl font-black text-gray-100 dark:text-gray-800 italic">{idx + 1}</span>
                      <ArticleCard article={article} variant="horizontal" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Box */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold mb-4 dark:text-white">Suivez-nous sur Facebook</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Rejoignez plus de 300 000 abonnés pour ne rien rater de l'actualité comorienne.</p>
                <a 
                  href="https://www.facebook.com/fcbkfmcomores" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full bg-[#1877F2] text-white text-center py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Voir notre page Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
