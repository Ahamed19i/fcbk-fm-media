
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const queryText = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // Simple client-side search for now as Firestore doesn't support full-text search
        const q = query(
          collection(db, 'articles'),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const allArticles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
        
        if (queryText) {
          const filtered = allArticles.filter(article => 
            article.title.toLowerCase().includes(queryText.toLowerCase()) ||
            article.content.toLowerCase().includes(queryText.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(queryText.toLowerCase())
          );
          setArticles(filtered);
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error("Error searching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [queryText]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter text-black mb-4 flex items-center gap-4">
          <SearchIcon size={36} className="text-blue-600" />
          Résultats pour : <span className="text-blue-600">"{queryText}"</span>
        </h1>
        <p className="text-gray-500">
          {articles.length} {articles.length > 1 ? 'articles trouvés' : 'article trouvé'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && queryText && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-xl text-gray-400">Aucun article ne correspond à votre recherche.</p>
          <p className="text-gray-500 mt-2">Essayez avec d'autres mots-clés.</p>
        </div>
      )}
    </div>
  );
}
