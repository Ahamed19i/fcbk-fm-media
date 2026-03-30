
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black text-white pt-16 pb-8 relative border-t border-gray-800 transition-colors duration-300">
      <button 
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg text-white"
        aria-label="Retour en haut"
      >
        <ArrowUp size={24} />
      </button>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="text-3xl font-black tracking-tighter mb-6 block text-white">
              FCBK<span className="text-blue-600">FM</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              FCBK FM est le média de référence aux Comores, offrant une couverture complète de l'actualité nationale et internationale, de la politique, du sport et de la culture.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-blue-600">Catégories</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/category/national" className="hover:text-blue-600 transition-colors">National</Link></li>
              <li><Link to="/category/international" className="hover:text-blue-600 transition-colors">International</Link></li>
              <li><Link to="/category/politique" className="hover:text-blue-600 transition-colors">Politique</Link></li>
              <li><Link to="/category/economie" className="hover:text-blue-600 transition-colors">Économie</Link></li>
              <li><Link to="/category/sport" className="hover:text-blue-600 transition-colors">Sport</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-blue-600">Liens Utiles</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-blue-600 transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
              <li><Link to="/legal" className="hover:text-blue-600 transition-colors">Mentions Légales</Link></li>
              <li><Link to="/advertising" className="hover:text-blue-600 transition-colors">Publicité</Link></li>
              <li><Link to="/archives" className="hover:text-blue-600 transition-colors">Archives</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-blue-600">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-600 shrink-0" />
                <span>Moroni, Grande Comore, Comores</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-600 shrink-0" />
                <span>+269 442 67 36</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-600 shrink-0" />
                <span>facbookfm0@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} FCBK FM. Tous droits réservés. Développé pour l'excellence médiatique.</p>
        </div>
      </div>
    </footer>
  );
}
