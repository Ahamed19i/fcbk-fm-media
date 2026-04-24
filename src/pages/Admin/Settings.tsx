import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Bell, Shield, Database } from 'lucide-react';
import { UserProfile } from '../../types';
import { toast } from 'sonner';

interface SettingsPageProps {
  profile: UserProfile | null;
}

export default function AdminSettings({ profile }: SettingsPageProps) {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    toast.success(`${action} effectué avec succès.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-12 transition-colors duration-300">
      <header className="flex items-center gap-4 mb-12">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors dark:text-white"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-3xl font-black text-black dark:text-white">Paramètres de la Plateforme</h1>
          <p className="text-gray-500 dark:text-gray-400">Configurez les options générales de FCBK FM.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Globe size={24} className="text-blue-600" /> Général</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Nom du Média</label>
              <input type="text" defaultValue="FCBK FM" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 font-bold text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Slogan</label>
              <input type="text" defaultValue="Le Média de Référence des Comores" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 font-bold text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Bell size={24} className="text-orange-600" /> Notifications</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div>
              <p className="font-bold dark:text-white">Alertes Breaking News</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Envoyer des notifications push pour les infos urgentes.</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Shield size={24} className="text-green-600" /> Sécurité</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez les politiques de sécurité et les sauvegardes de données.</p>
          <button 
            onClick={() => handleAction("Configuration 2FA")}
            className="bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black dark:hover:bg-gray-700 transition-colors"
          >
            Configurer l'authentification à deux facteurs
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 dark:text-white"><Database size={24} className="text-purple-600" /> Maintenance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Videz le cache ou exportez les données de la plateforme.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => handleAction("Vidage du cache")}
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              Vider le cache
            </button>
            <button 
              onClick={() => handleAction("Exportation CSV")}
              className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
            >
              Exporter CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
