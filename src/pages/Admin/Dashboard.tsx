
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Article, UserProfile } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, FileText, LayoutDashboard, LogOut, Users, Settings, Mail } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

interface DashboardProps {
  profile: UserProfile | null;
}

export default function AdminDashboard({ profile }: DashboardProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) {
      navigate('/admin/login');
      return;
    }

    const fetchArticles = async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        setArticles(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)));
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [profile, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      try {
        await deleteDoc(doc(db, 'articles', id));
        setArticles(articles.filter(a => a.id !== id));
        toast.success("Article supprimé !");
      } catch (error) {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white hidden lg:flex flex-col p-6">
        <div className="text-2xl font-black tracking-tighter mb-12">
          FCBK<span className="text-blue-600">FM</span>
        </div>
        <nav className="space-y-4 flex-grow">
          <Link to="/admin" className="flex items-center gap-3 p-3 bg-blue-600 rounded-xl font-bold"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/admin/editor" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl font-bold"><Plus size={20} /> Nouvel Article</Link>
          <Link to="/admin/subscribers" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl font-bold"><Mail size={20} /> Abonnés</Link>
          <Link to="/admin/users" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl font-bold"><Users size={20} /> Utilisateurs</Link>
          <Link to="/admin/settings" className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded-xl font-bold"><Settings size={20} /> Paramètres</Link>
        </nav>
        <button onClick={() => auth.signOut()} className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-xl font-bold"><LogOut size={20} /> Déconnexion</button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-black mb-2">Tableau de Bord</h1>
            <p className="text-gray-500">Bienvenue, {profile?.displayName}. Gérez vos publications.</p>
          </div>
          <Link to="/admin/editor" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Plus size={20} /> Nouvel Article
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Articles</h3>
            <p className="text-3xl font-black text-black">{articles.length}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Eye size={24} /></div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+24%</span>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Vues Totales</h3>
            <p className="text-3xl font-black text-black">{articles.reduce((acc, a) => acc + (a.views || 0), 0)}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><Mail size={24} /></div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">Nouveau</span>
            </div>
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Abonnés Newsletter</h3>
            <p className="text-3xl font-black text-black">Gérer</p>
            <Link to="/admin/subscribers" className="text-xs text-blue-600 font-bold hover:underline mt-2 inline-block">Voir la liste</Link>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Articles Récents</h2>
            <div className="flex gap-2">
              <button className="text-xs font-bold text-gray-500 hover:text-black transition-colors px-3 py-1 bg-gray-50 rounded-lg">Tous</button>
              <button className="text-xs font-bold text-gray-500 hover:text-black transition-colors px-3 py-1">Publiés</button>
              <button className="text-xs font-bold text-gray-500 hover:text-black transition-colors px-3 py-1">Brouillons</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Titre</th>
                  <th className="px-8 py-4">Catégorie</th>
                  <th className="px-8 py-4">Statut</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={article.mainImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-black line-clamp-1">{article.title}</p>
                          <p className="text-xs text-gray-400">{article.views} vues</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{article.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${article.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {article.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">{formatDate(article.createdAt)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/editor/${article.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18} /></Link>
                        <button onClick={() => handleDelete(article.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
