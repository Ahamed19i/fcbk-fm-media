import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, setDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile } from '../../types';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Mail, Calendar, ArrowLeft, Trash2, X } from 'lucide-react';
import { formatDate, cn } from '../../lib/utils';
import { toast } from 'sonner';

interface UsersPageProps {
  profile: UserProfile | null;
}

export default function AdminUsers({ profile }: UsersPageProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      // Fetch both active users and whitelisted emails
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const activeUsers = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      
      const whitelistSnapshot = await getDocs(collection(db, 'whitelist'));
      const whitelisted = whitelistSnapshot.docs.map(doc => ({ 
        uid: `whitelisted_${doc.id}`, 
        email: doc.id,
        displayName: 'En attente de connexion',
        role: doc.data().role,
        createdAt: doc.data().invitedAt,
        isInvited: true 
      } as UserProfile));

      // Combine and filter duplicates (if any)
      const combined = [...activeUsers];
      whitelisted.forEach(w => {
        if (!combined.some(u => u.email.toLowerCase() === w.email.toLowerCase())) {
          combined.push(w);
        }
      });

      setUsers(combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Check if user already exists in users collection
      const existingUser = users.find(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
      if (existingUser) {
        toast.error("Cet utilisateur est déjà dans la liste.");
        return;
      }

      // Create a whitelist entry with email as ID
      await setDoc(doc(db, 'whitelist', inviteEmail.toLowerCase()), {
        email: inviteEmail.toLowerCase(),
        role: 'journalist',
        invitedAt: new Date().toISOString(),
        invitedBy: profile?.email
      });

      toast.success("Collaborateur ajouté à la liste blanche !");
      setInviteEmail('');
      setShowInviteModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Erreur lors de l'invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteUser = async (userId: string, email?: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet accès ?")) return;
    
    try {
      if (userId.startsWith('whitelisted_')) {
        // Delete from whitelist
        await deleteDoc(doc(db, 'whitelist', email || ''));
      } else {
        // Delete from users
        await deleteDoc(doc(db, 'users', userId));
      }
      setUsers(users.filter(u => u.uid !== userId));
      toast.success("Accès supprimé.");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'editor' | 'journalist', email?: string) => {
    try {
      if (userId.startsWith('whitelisted_')) {
        // Update in whitelist
        await updateDoc(doc(db, 'whitelist', email || ''), { role: newRole });
      } else {
        // Update in users
        await updateDoc(doc(db, 'users', userId), { role: newRole });
      }
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast.success("Rôle mis à jour !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du rôle.");
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-12 transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-3xl font-black text-black dark:text-white">Gestion des Utilisateurs</h1>
            <p className="text-gray-500 dark:text-gray-400">Gérez les accès et les rôles de votre équipe éditoriale.</p>
          </div>
        </div>
        {profile?.role === 'admin' && (
          <button 
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <UserPlus size={20} />
            Ajouter un collaborateur
          </button>
        )}
      </header>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-white">Inviter un membre</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-black dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Adresse Email Google</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="exemple@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-2 italic">
                  Le membre devra utiliser cet email pour se connecter via Google.
                </p>
              </div>
              <button
                type="submit"
                disabled={isInviting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isInviting ? "Invitation..." : "Ajouter à la liste blanche"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">Utilisateur</th>
                <th className="px-8 py-4">Rôle</th>
                <th className="px-8 py-4">Date d'inscription</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {users.map(user => (
                <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                        user.isInvited ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      )}>
                        {user.displayName?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-black dark:text-white">
                          {user.displayName || 'Utilisateur'}
                          {user.isInvited && <span className="ml-2 text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">Invité</span>}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1"><Mail size={12} /> {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select
                      value={user.role}
                      disabled={profile?.role !== 'admin'}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as any, user.email)}
                      className="text-xs font-bold uppercase tracking-wider bg-gray-50 dark:bg-gray-800 border-none rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Éditeur</option>
                      <option value="journalist">Journaliste</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={14} /> {formatDate(user.createdAt)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      {profile?.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(user.uid, user.email)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Supprimer l'accès"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                      <button className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Shield size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
