
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { ArrowLeft, Mail, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: string;
}

interface SubscribersPageProps {
  profile: UserProfile | null;
}

export default function AdminSubscribers({ profile }: SubscribersPageProps) {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSubscribers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Subscriber));
      setSubscribers(fetchedSubscribers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching subscribers:", error);
      toast.error("Erreur lors de la récupération des abonnés.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet abonné ?")) return;
    try {
      await deleteDoc(doc(db, 'subscribers', id));
      toast.success("Abonné supprimé.");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Email', 'Date d\'inscription', 'Statut'];
    const rows = subscribers.map(s => [s.id, s.email, s.subscribedAt, s.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-12 transition-colors duration-300">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-3xl font-black text-black dark:text-white">Abonnés Newsletter</h1>
            <p className="text-gray-500 dark:text-gray-400">Gérez les inscriptions à votre newsletter.</p>
          </div>
        </div>
        {profile?.role !== 'journalist' && (
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Download size={20} /> Exporter CSV
          </button>
        )}
      </header>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Email</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Date</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Statut</th>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Mail size={16} />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4">
                    <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-widest">
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    {profile?.role !== 'journalist' && (
                      <button 
                        onClick={() => handleDelete(subscriber.id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {subscribers.length === 0 && (
          <div className="p-20 text-center text-gray-400 dark:text-gray-600">
            Aucun abonné pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
