
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserProfile } from './types';
import { Toaster } from 'sonner';
import { seedData } from './lib/seed';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import CategoryPage from './pages/CategoryPage';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminLogin from './pages/Admin/Login';
import AdminUsers from './pages/Admin/Users';
import AdminSettings from './pages/Admin/Settings';
import AdminSubscribers from './pages/Admin/Subscribers';
import ArticleEditor from './pages/Admin/ArticleEditor';
import SearchPage from './components/SearchPage';

// Static Pages
import StaticPage from './pages/StaticPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedData();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ ...docSnap.data(), uid: firebaseUser.uid } as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-4xl font-black tracking-tighter text-black mb-4 animate-pulse">
          FCBK<span className="text-blue-600">FM</span>
        </div>
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
            <Navbar user={user} profile={profile} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/article/:slug" element={<ArticleDetail />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard profile={profile} />} />
                <Route path="/admin/users" element={<AdminUsers profile={profile} />} />
                <Route path="/admin/settings" element={<AdminSettings profile={profile} />} />
                <Route path="/admin/subscribers" element={<AdminSubscribers profile={profile} />} />
                <Route path="/admin/editor" element={<ArticleEditor profile={profile} />} />
                <Route path="/admin/editor/:id" element={<ArticleEditor profile={profile} />} />
                
                {/* Static Routes */}
                <Route path="/about" element={<StaticPage title="À propos" content={
                  <div className="space-y-6">
                    <p>FCBK FM est le premier média numérique indépendant des Comores. Fondé avec la vision de fournir une information de qualité, impartiale et accessible à tous les Comoriens, qu'ils soient au pays ou dans la diaspora.</p>
                    <p>Notre équipe de journalistes passionnés travaille sans relâche pour couvrir l'actualité nationale, internationale, politique, économique, sportive et culturelle avec rigueur et professionnalisme.</p>
                    <h2 className="text-2xl font-black mt-12">Notre Mission</h2>
                    <p>Informer, éduquer et divertir tout en respectant les principes fondamentaux du journalisme : vérité, indépendance et responsabilité sociale.</p>
                  </div>
                } />} />
                <Route path="/contact" element={<StaticPage title="Contact" content={
                  <div className="space-y-8">
                    <p>Vous avez une information à nous partager, une question ou une proposition de partenariat ? N'hésitez pas à nous contacter.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                      <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-black mb-4">Rédaction</h3>
                        <p className="text-gray-500 dark:text-gray-400">Pour tout ce qui concerne l'actualité et les reportages.</p>
                        <p className="font-bold mt-4 text-blue-600">facbookfm0@gmail.com</p>
                      </div>
                      <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-black mb-4">Publicité</h3>
                        <p className="text-gray-500 dark:text-gray-400">Pour vos campagnes publicitaires et partenariats.</p>
                        <p className="font-bold mt-4 text-blue-600">facbookfm0@gmail.com</p>
                      </div>
                    </div>
                    <div className="mt-12">
                      <h3 className="text-xl font-black mb-4">Siège Social</h3>
                      <p>Moroni, Grande Comore, Comores</p>
                      <p>Téléphone : +269 442 67 36</p>
                    </div>
                  </div>
                } />} />
                <Route path="/legal" element={<StaticPage title="Mentions Légales" content={
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-2xl font-black mb-4">Éditeur du site</h2>
                      <p>Le site FCBK FM est édité par la société FCBK MEDIA SARL, au capital de 1 000 000 KMF, dont le siège social est situé à Moroni, Comores.</p>
                    </section>
                    <section>
                      <h2 className="text-2xl font-black mb-4">Hébergement</h2>
                      <p>Le site est hébergé par Vercel Inc., situé à 340 S Lemon Ave #1142, Walnut, CA 91789, USA.</p>
                    </section>
                    <section>
                      <h2 className="text-2xl font-black mb-4">Propriété Intellectuelle</h2>
                      <p>Tous les contenus présents sur le site (textes, images, vidéos, logos) sont la propriété exclusive de FCBK FM ou de leurs auteurs respectifs. Toute reproduction sans autorisation est strictement interdite.</p>
                    </section>
                  </div>
                } />} />
                <Route path="/advertising" element={<StaticPage title="Publicité" content={
                  <div className="space-y-6">
                    <p>Faites rayonner votre marque auprès de l'audience la plus engagée des Comores. Avec plus de 300 000 abonnés sur les réseaux sociaux et des milliers de visiteurs quotidiens, FCBK FM est le partenaire idéal pour votre communication.</p>
                    <h2 className="text-2xl font-black mt-12">Nos Solutions</h2>
                    <ul className="list-disc pl-6 space-y-3">
                      <li>Bannières publicitaires sur le site web</li>
                      <li>Articles sponsorisés et publireportages</li>
                      <li>Campagnes sur nos réseaux sociaux (Facebook, Instagram, Youtube)</li>
                      <li>Partenariats événementiels</li>
                    </ul>
                    <p className="mt-8">Contactez notre régie publicitaire pour recevoir notre kit média : <span className="font-bold text-blue-600">facbookfm0@gmail.com</span></p>
                  </div>
                } />} />
                <Route path="/archives" element={<StaticPage title="Archives" content={
                  <div className="space-y-6">
                    <p>Retrouvez tous nos articles publiés depuis le lancement de la plateforme. Nos archives sont classées par date et par catégorie pour vous aider à retrouver l'information que vous cherchez.</p>
                    <div className="p-12 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 text-center">
                      <p className="text-gray-500 dark:text-gray-400 italic">Le module de recherche avancée dans les archives est en cours de maintenance. Merci de votre patience.</p>
                    </div>
                  </div>
                } />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
