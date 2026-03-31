
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import { ChevronRight, Zap } from 'lucide-react';
import SEO from '../components/SEO';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        let q;
        if (slug === 'all') {
          q = query(
            collection(db, 'articles'),
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc'),
            limit(40)
          );
        } else {
          q = query(
            collection(db, 'articles'),
            where('category', '==', slug),
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc'),
            limit(40)
          );
        }
        const querySnapshot = await getDocs(q);
        setArticles(querySnapshot.docs.map(d => {
          const data = d.data() as any;
          return { 
            id: d.id, 
            ...data,
            authorId: data.authorId || data.authorid
          } as Article;
        }));
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticles();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pageTitle = slug === 'all' ? 'Toutes les actualités' : slug?.toUpperCase();
  const pageDescription = slug === 'all' 
    ? "Retrouvez toute l'actualité des Comores sur FCBK FM."
    : `Retrouvez toute l'actualité de la catégorie ${slug} sur FCBK FM.`;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <SEO 
        title={pageTitle} 
        description={pageDescription} 
      />
      <div className="bg-gray-50 dark:bg-gray-900 py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
            <Link to="/" className="hover:underline">Accueil</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400 dark:text-gray-500">{slug === 'all' ? 'Actualités' : slug}</span>
          </div>
          <h1 className="text-4xl font-black text-black dark:text-white uppercase tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Zap className="mx-auto text-gray-200 dark:text-gray-800 mb-6" size={64} />
            <h2 className="text-2xl font-bold text-gray-400 dark:text-gray-600">Aucun article dans cette catégorie pour le moment.</h2>
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">Retour à l'accueil</Link>
          </div>
        )}
      </section>
    </div>
  );
}
