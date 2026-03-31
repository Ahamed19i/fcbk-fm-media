
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Menu, X, Search as SearchIcon, User as UserIcon, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { name: 'National', slug: 'national' },
  { name: 'Politique', slug: 'politique' },
  { name: 'Économie', slug: 'economie' },
  { name: 'Sport', slug: 'sport' },
  { name: 'Culture', slug: 'culture' },
  { name: 'Diaspora', slug: 'diaspora' },
  { name: 'Société', slug: 'societe' },
  { name: 'International', slug: 'international' },
];

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Connecté avec succès !");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erreur lors de la connexion.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Déconnecté.");
      navigate('/');
    } catch (error) {
      toast.error("Erreur lors de la déconnexion.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.role === 'editor' || profile?.role === 'journalist';

  return (
    <nav className="bg-white dark:bg-gray-950 transition-colors duration-300 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-black text-white py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">{currentDate}</span>
            <span className="text-gray-400 hidden md:inline">FCBK FM - Le Média de Référence des Comores</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-gray-300">{user.displayName}</span>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                    <LayoutDashboard size={14} /> Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="hover:text-red-400 transition-colors">
                  Déconnexion
                </button>
              </div>
            ) : (
              <button onClick={handleGoogleSignIn} className="hover:text-blue-400 transition-colors">
                Connexion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-black tracking-tighter text-black dark:text-white">
              FCBK<span className="text-blue-600">FM</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="text-xs xl:text-sm font-black text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest"
              >
                {cat.name}
              </Link>
            ))}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <SearchIcon size={20} />
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-900 dark:text-gray-100"
            >
              <SearchIcon size={20} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-900 dark:text-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-6 px-4 space-y-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              onClick={() => setIsOpen(false)}
              className="block text-sm font-black text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-white dark:bg-gray-950 z-50 flex items-center px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto flex items-center gap-4">
            <SearchIcon className="text-gray-400" size={24} />
            <input
              autoFocus
              type="text"
              placeholder="Rechercher un article..."
              className="flex-grow bg-transparent border-none outline-none text-xl font-bold dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-gray-400 hover:text-black dark:hover:text-white"
            >
              <X size={24} />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
