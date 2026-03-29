
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
    if (!profile || profile.role !== 'admin') {
      navigate('/admin');
      return;
    }

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
  }, [profile, navigate]);

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
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-3xl font-black text-black">Abonnés Newsletter</h1>
            <p className="text-gray-500">Gérez les inscriptions à votre newsletter.</p>
          </div>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          <Download size={20} /> Exporter CSV
        </button>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Email</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Date</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Statut</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                      <Mail size={16} />
                    </div>
                    <span className="font-bold text-gray-900">{subscriber.email}</span>
                  </div>
                </td>
                <td className="px-8 py-4 text-sm text-gray-500">
                  {new Date(subscriber.subscribedAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-4">
                  <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    {subscriber.status}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(subscriber.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <div className="p-20 text-center text-gray-400">
            Aucun abonné pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
