
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { Menu, X, Search, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
}

const categories = [
  { name: 'National', slug: 'national' },
  { name: 'International', slug: 'international' },
  { name: 'Politique', slug: 'politique' },
  { name: 'Économie', slug: 'economie' },
  { name: 'Sport', slug: 'sport' },
  { name: 'Culture', slug: 'culture' },
  { name: 'Diaspora', slug: 'diaspora' },
  { name: 'Société', slug: 'societe' },
];

export default function Navbar({ user, profile }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-black text-white py-2 px-4 text-xs font-medium flex justify-between items-center">
        <div className="flex space-x-4">
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="hidden sm:inline">FCBK FM - Le Média de Référence des Comores</span>
        </div>
        <div className="flex space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="opacity-70">{profile?.displayName || user.email}</span>
              {profile?.role && (
                <Link to="/admin" className="hover:text-blue-400 flex items-center gap-1">
                  <LayoutDashboard size={14} /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="hover:text-red-400 flex items-center gap-1">
                <LogOut size={14} /> Quitter
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="hover:text-blue-400 flex items-center gap-1">
              <UserIcon size={14} /> Connexion
            </Link>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-3xl font-black tracking-tighter text-black">
                FCBK<span className="text-blue-600">FM</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="text-sm font-bold uppercase tracking-wider text-gray-600 hover:text-blue-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("lg:hidden", isOpen ? "block" : "hidden")}>
        <div className="px-4 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-bold uppercase tracking-wider text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 p-4 shadow-lg animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex items-center">
            <input
              type="text"
              placeholder="Rechercher une actualité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 text-lg border-none focus:ring-0 outline-none"
              autoFocus
            />
            <button type="submit" className="hidden">Rechercher</button>
            <button type="button" onClick={() => setIsSearchOpen(false)} className="p-2 text-gray-400 hover:text-black">
              <X size={24} />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
