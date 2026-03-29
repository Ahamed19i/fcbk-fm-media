import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Globe, Bell, Shield, Database } from 'lucide-react';
import { UserProfile } from '../../types';

interface SettingsPageProps {
  profile: UserProfile | null;
}

export default function AdminSettings({ profile }: SettingsPageProps) {
  const navigate = useNavigate();

  if (!profile || profile.role !== 'admin') {
    navigate('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <header className="flex items-center gap-4 mb-12">
        <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-3xl font-black text-black">Paramètres de la Plateforme</h1>
          <p className="text-gray-500">Configurez les options générales de FCBK FM.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Globe size={24} className="text-blue-600" /> Général</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nom du Média</label>
              <input type="text" defaultValue="FCBK FM" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Slogan</label>
              <input type="text" defaultValue="Le Média de Référence des Comores" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-600 focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Bell size={24} className="text-orange-600" /> Notifications</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="font-bold">Alertes Breaking News</p>
              <p className="text-xs text-gray-400">Envoyer des notifications push pour les infos urgentes.</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Shield size={24} className="text-green-600" /> Sécurité</h2>
          <p className="text-sm text-gray-500">Gérez les politiques de sécurité et les sauvegardes de données.</p>
          <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm">Configurer l'authentification à deux facteurs</button>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><Database size={24} className="text-purple-600" /> Maintenance</h2>
          <p className="text-sm text-gray-500">Videz le cache ou exportez les données de la plateforme.</p>
          <div className="flex gap-4">
            <button className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm">Vider le cache</button>
            <button className="bg-purple-50 text-purple-600 px-6 py-3 rounded-xl font-bold text-sm">Exporter CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
