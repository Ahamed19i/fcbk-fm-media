import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, UserProfile } from '../types';
import { formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Clock, Eye, Share2, Facebook, Twitter, Link as LinkIcon, ChevronRight, User as UserIcon } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';
import NewsletterBox from '../components/NewsletterBox';
import { toast } from 'sonner';
import SEO from '../components/SEO';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<UserProfile | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          const articleData = { id: docData.id, ...docData.data() } as Article;
          setArticle(articleData);

          // Increment views
          await updateDoc(doc(db, 'articles', docData.id), {
            views: increment(1)
          });

          // Fetch author from users collection
          if (articleData.authorId) {
            const userSnap = await getDoc(doc(db, 'users', articleData.authorId));
            if (userSnap.exists()) {
              setAuthor({ uid: userSnap.id, ...userSnap.data() } as UserProfile);
            }
          }

          // Fetch related
          const relatedQ = query(
            collection(db, 'articles'),
            where('category', '==', articleData.category),
            where('status', '==', 'published'),
            limit(10) // Fetch more to filter current and ensure enough
          );
          const relatedSnap = await getDocs(relatedQ);
          const filteredRelated = relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Article))
            .filter(a => a.id !== articleData.id);
          
          // If only 1 article in category (the current one), filteredRelated will be empty
          // If 2 or more, show up to 4
          if (filteredRelated.length >= 1) {
            setRelated(filteredRelated.slice(0, 4));
          } else {
            setRelated([]);
          }
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticle();
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier !");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Article non trouvé</h2>
        <Link to="/" className="text-blue-600 hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <article className="bg-white dark:bg-gray-950 transition-colors duration-300 min-h-screen">
      <SEO 
        title={article.title} 
        description={article.excerpt} 
        ogImage={article.mainImage} 
        ogType="article" 
      />
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6">
          <Link to={`/category/${article.category}`} className="hover:underline">{article.category}</Link>
          <ChevronRight size={12} />
          <span className="text-gray-400 dark:text-gray-500">Article</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-black dark:text-white leading-tight mb-8">
          {article.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8 italic">
          {article.excerpt}
        </p>
        
        <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {author?.photoURL ? (
              <img src={author.photoURL} alt={author.displayName} className="w-12 h-12 rounded-full object-cover border-2 border-blue-600" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                <UserIcon size={20} className="text-gray-400" />
              </div>
            )}
            <div>
              <span className="block text-sm font-bold text-black dark:text-white">{author?.displayName || 'Rédaction FCBK FM'}</span>
              <span className="block text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider">{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={copyLink} className="p-2 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><LinkIcon size={18} /></button>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-[#1877F2] text-white hover:bg-blue-700 transition-colors"><Facebook size={18} /></a>
            <a href={`https://twitter.com/intent/tweet?url=${window.location.href}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-black dark:bg-white dark:text-black text-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"><Twitter size={18} /></a>
          </div>
        </div>
      </header>

      {/* Main Image */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-900 shadow-2xl shadow-black/5">
          <img src={article.mainImage} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
        </div>
      </div>

      {/* Content & Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="prose prose-lg prose-blue dark:prose-invert max-w-none mb-16 prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            {/* Author Bio */}
            {author && (
              <div className="mb-16">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-8 border border-gray-100 dark:border-gray-800">
                  {author.photoURL ? (
                    <img src={author.photoURL} alt={author.displayName} className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <UserIcon size={40} className="text-gray-400" />
                    </div>
                  )}
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold mb-2 dark:text-white">À propos de {author.displayName}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">{author.bio || "Journaliste passionné couvrant l'actualité pour FCBK FM."}</p>
                    <div className="flex items-center gap-4 justify-center sm:justify-start">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{author.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Related Articles */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              {related.length > 0 && (
                <>
                  <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 dark:text-white">
                    <span className="w-8 h-1 bg-blue-600 block"></span> Sur le même sujet
                  </h2>
                  <div className="space-y-8 mb-12">
                    {related.map(item => (
                      <ArticleCard key={item.id} article={item} variant="horizontal" />
                    ))}
                  </div>
                </>
              )}

              {/* Newsletter Promo */}
              <NewsletterBox variant="vertical" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
