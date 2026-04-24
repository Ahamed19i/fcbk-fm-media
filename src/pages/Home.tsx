
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useArticles, fetcher } from '../lib/api';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import { ChevronRight, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NewsletterBox from '../components/NewsletterBox';

export default function Home() {
  const { data, error, isLoading } = useArticles({ limit: 50 });
  const articles = Array.isArray(data) ? data : [];

  const { breakingNews, trending } = useMemo(() => {
    if (articles.length === 0) return { breakingNews: null, trending: [] };
    return {
      breakingNews: articles.find((a: Article) => a.isBreaking) || articles[0],
      trending: articles.slice(1, 6)
    };
  }, [articles]);

  const { data: health } = useSWR('/health', fetcher);
  const [showDebug, setShowDebug] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-red-500">
        <AlertCircle className="mx-auto mb-4" size={48} />
        <p className="font-bold">Erreur lors de la récupération des actualités.</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 font-bold hover:underline">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      <SEO />
      
      {/* Diagnostic Debug Panel - Hidden by default, toggle with secret click or env */}
      <div className="bg-gray-100 border-b p-2 text-[10px] font-mono flex justify-between items-center">
        <span>API Status: {health ? "Connected" : "Loading..."}</span>
        <button onClick={() => setShowDebug(!showDebug)} className="underline">Debug</button>
      </div>
      
      {showDebug && (
        <div className="bg-black text-green-400 p-4 font-mono text-xs overflow-auto max-h-40">
          <pre>{JSON.stringify({ health, articlesCount: articles.length, error }, null, 2)}</pre>
        </div>
      )}

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
              <Link to="/category/all" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.slice(1, 5).map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Middle Banner */}
            <NewsletterBox />

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
