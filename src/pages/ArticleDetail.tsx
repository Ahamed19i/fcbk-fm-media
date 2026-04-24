
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs, updateDoc, increment, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Article, UserProfile } from '../types';
import { formatDate, normalizeDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Clock, Eye, Share2, Facebook, Twitter, Link as LinkIcon, ChevronRight, User as UserIcon, Zap } from 'lucide-react';
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
      setAuthor(null);
      setRelated([]);
      try {
        const q = query(collection(db, 'articles'), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          const rawData = docData.data();
          const articleData = { 
            id: docData.id, 
            ...rawData,
            authorId: rawData.authorId || (rawData as any).authorid
          } as Article;
          
          setArticle(articleData);

          // Increment views
          try {
            await updateDoc(doc(db, 'articles', docData.id), {
              views: increment(1)
            });
          } catch (e) {
            console.warn("Failed to increment views:", e);
          }

          // Fetch author from users collection
          const defaultAuthor: UserProfile = {
            uid: 'default',
            displayName: 'Rédaction FCBK FM',
            role: 'journalist',
            bio: "Journaliste passionné couvrant l'actualité pour FCBK FM.",
            email: '',
            createdAt: ''
          };

          if (articleData.authorId) {
            try {
              const userSnap = await getDoc(doc(db, 'users', articleData.authorId));
              if (userSnap.exists()) {
                setAuthor({ uid: userSnap.id, ...userSnap.data() } as UserProfile);
              } else {
                setAuthor(defaultAuthor);
              }
            } catch (e) {
              console.warn("Failed to fetch author:", e);
              setAuthor(defaultAuthor);
            }
          } else {
            setAuthor(defaultAuthor);
          }

          // Fetch related articles (Strictly same category)
          let categoryRelated: Article[] = [];
          
          try {
            // Fetch from the same category
            const relatedQ = query(
              collection(db, 'articles'),
              where('category', '==', articleData.category),
              limit(10)
            );
            
            const relatedSnap = await getDocs(relatedQ);
            categoryRelated = relatedSnap.docs
              .map(d => {
                const data = d.data();
                return { 
                  id: d.id, 
                  ...data,
                  authorId: data.authorId || (data as any).authorid
                } as Article;
              })
              .filter(a => a.id !== articleData.id && (a.status === 'published' || !a.status))
              .sort((a, b) => normalizeDate(b.publishedAt || b.createdAt).getTime() - normalizeDate(a.publishedAt || a.createdAt).getTime())
              .slice(0, 4);
          } catch (e) {
            console.warn("Failed to fetch related by category:", e);
          }
          
          setRelated(categoryRelated);
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

            {/* Related Articles Section - Below Content */}
            {related.length > 0 && (
              <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3 dark:text-white">
                  <span className="w-12 h-1.5 bg-blue-600 block"></span> Sur le même sujet
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {related.map(item => (
                    <ArticleCard key={item.id} article={item} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              {/* Author Sidebar Card */}
              {author && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 mb-8 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      {author.photoURL ? (
                        <img src={author.photoURL} alt={author.displayName} className="w-24 h-24 rounded-full object-cover border-4 border-blue-50 dark:border-blue-900/30 p-1" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                          <UserIcon size={40} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white dark:border-gray-900">
                        <Zap size={14} fill="currentColor" />
                      </div>
                    </div>
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                      {author.role}
                    </span>
                    <h3 className="text-xl font-black text-black dark:text-white mb-3 tracking-tight">
                      {author.displayName}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed italic">
                      "{author.bio || "Journaliste passionné couvrant l'actualité pour FCBK FM."}"
                    </p>
                  </div>
                </div>
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
