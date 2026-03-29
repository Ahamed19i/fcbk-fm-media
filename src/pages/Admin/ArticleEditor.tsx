import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Article, UserProfile } from '../../types';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Save, Eye, Image as ImageIcon, ArrowLeft, Send, AlertCircle } from 'lucide-react';

interface EditorProps {
  profile: UserProfile | null;
}

export default function ArticleEditor({ profile }: EditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    mainImage: '',
    category: 'national',
    status: 'draft',
    isBreaking: false,
    tags: []
  });

  useEffect(() => {
    if (!profile) {
      navigate('/admin/login');
      return;
    }

    if (id) {
      const fetchArticle = async () => {
        const docSnap = await getDoc(doc(db, 'articles', id));
        if (docSnap.exists()) {
          setFormData(docSnap.data() as Article);
        }
      };
      fetchArticle();
    }
  }, [id, profile, navigate]);

  const handleSave = async (status: 'draft' | 'published' = 'draft') => {
    if (!formData.title || !formData.content) {
      toast.error("Veuillez remplir le titre et le contenu.");
      return;
    }

    if (formData.mainImage && formData.mainImage.startsWith('data:') && formData.mainImage.length > 500000) {
      toast.error("L'image est trop volumineuse. Veuillez utiliser une URL d'image ou une image plus petite.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const data = {
        ...formData,
        status,
        updatedAt: new Date().toISOString(),
        slug: formData.slug || formData.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
        authorId: profile?.uid || auth.currentUser?.uid || '',
        publishedAt: status === 'published' ? new Date().toISOString() : null,
        views: formData.views || 0,
        createdAt: formData.createdAt || new Date().toISOString()
      };

      if (id) {
        try {
          await updateDoc(doc(db, 'articles', id), data);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `articles/${id}`);
        }
        toast.success("Article mis à jour !");
      } else {
        try {
          await addDoc(collection(db, 'articles'), data);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'articles');
        }
        toast.success("Article créé !");
      }
      navigate('/admin');
    } catch (error: any) {
      console.error("Save error:", error);
      let displayError = "Erreur lors de l'enregistrement.";
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error.includes('insufficient permissions')) {
          displayError = "Permissions insuffisantes. Vérifiez que vous êtes bien Administrateur ou Journaliste.";
        } else if (parsed.error.includes('too large')) {
          displayError = "L'article est trop volumineux.";
        } else {
          displayError = `Erreur Firestore (${parsed.operationType}): ${parsed.error}`;
        }
      } catch (e) {
        // If not a JSON error from handleFirestoreError, show the raw message
        displayError = `Erreur: ${error.message || "Inconnue"}`;
      }
      setErrorMsg(displayError);
      toast.error(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-bold text-black">{id ? "Modifier l'article" : "Nouvel Article"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPreview(!preview)} 
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${preview ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
          >
            <Eye size={18} /> {preview ? "Éditer" : "Aperçu"}
          </button>
          <button 
            onClick={() => handleSave('draft')} 
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <Save size={18} className="inline mr-2" /> Brouillon
          </button>
          <button 
            onClick={() => handleSave('published')} 
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            <Send size={18} /> Publier
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-12">
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{errorMsg}</p>
          </div>
        )}
        {preview ? (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 prose prose-lg prose-blue max-w-none">
            <h1>{formData.title}</h1>
            <img src={formData.mainImage} alt="" className="w-full h-96 object-cover rounded-2xl mb-8" />
            <ReactMarkdown>{formData.content || ''}</ReactMarkdown>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Editor Side */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Titre de l'article</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Entrez un titre accrocheur..."
                    className="w-full text-3xl font-black border-none focus:ring-0 outline-none p-0 placeholder:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Contenu (Markdown)</label>
                  <textarea
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Racontez votre histoire ici..."
                    className="w-full min-h-[500px] text-lg border-none focus:ring-0 outline-none p-0 placeholder:text-gray-200 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Settings Side */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-bold text-lg border-b border-gray-100 pb-4">Paramètres</h3>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="national">National</option>
                    <option value="international">International</option>
                    <option value="politique">Politique</option>
                    <option value="economie">Économie</option>
                    <option value="sport">Sport</option>
                    <option value="culture">Culture</option>
                    <option value="diaspora">Diaspora</option>
                    <option value="societe">Société</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Image Principale (URL)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.mainImage}
                      onChange={e => setFormData({ ...formData, mainImage: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-medium text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                    <div className="absolute right-3 top-3 text-gray-300"><ImageIcon size={20} /></div>
                  </div>
                  {formData.mainImage && (
                    <img src={formData.mainImage} alt="" className="mt-4 w-full h-40 object-cover rounded-xl" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Extrait / Résumé</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Un court résumé pour l'accueil..."
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-medium text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none h-32 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <input
                    type="checkbox"
                    checked={formData.isBreaking}
                    onChange={e => setFormData({ ...formData, isBreaking: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-bold text-yellow-800">Breaking News / À la une</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
