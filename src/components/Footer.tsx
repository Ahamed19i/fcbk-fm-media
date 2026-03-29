import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="text-3xl font-black tracking-tighter mb-6 block">
              FCBK<span className="text-blue-600">FM</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              FCBK FM est le média de référence aux Comores, offrant une couverture complète de l'actualité nationale et internationale, de la politique, du sport et de la culture.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-blue-500">Catégories</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/category/national" className="hover:text-white transition-colors">National</Link></li>
              <li><Link to="/category/international" className="hover:text-white transition-colors">International</Link></li>
              <li><Link to="/category/politique" className="hover:text-white transition-colors">Politique</Link></li>
              <li><Link to="/category/economie" className="hover:text-white transition-colors">Économie</Link></li>
              <li><Link to="/category/sport" className="hover:text-white transition-colors">Sport</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-blue-500">Liens Utiles</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mentions Légales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Publicité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Archives</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-blue-500">Contact</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0" />
                <span>Moroni, Grande Comore, Comores</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>+269 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span>contact@fcbkfm.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FCBK FM. Tous droits réservés. Développé pour l'excellence médiatique.</p>
        </div>
      </div>
    </footer>
  );
}
