import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Mail, Calendar, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

interface UsersPageProps {
  profile: UserProfile | null;
}

export default function AdminUsers({ profile }: UsersPageProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      navigate('/admin');
      return;
    }

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        setUsers(querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [profile, navigate]);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'journalist') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast.success("Rôle mis à jour !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rôle.");
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <header className="flex items-center gap-4 mb-12">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-3xl font-black text-black">Gestion des Utilisateurs</h1>
          <p className="text-gray-500">Gérez les accès et les rôles de votre équipe éditoriale.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Utilisateur</th>
              <th className="px-8 py-4">Rôle</th>
              <th className="px-8 py-4">Date d'inscription</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {user.displayName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-black">{user.displayName || 'Utilisateur'}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as any)}
                    className="text-xs font-bold uppercase tracking-wider bg-gray-50 border-none rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Éditeur</option>
                    <option value="journalist">Journaliste</option>
                  </select>
                </td>
                <td className="px-8 py-6 text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={14} /> {formatDate(user.createdAt)}
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="text-gray-400 hover:text-blue-600 transition-colors"><Shield size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
