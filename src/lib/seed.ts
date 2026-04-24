


import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db, auth } from './firebase';

const SAMPLE_ARTICLES = [
  {
    title: "Élections aux Comores : Les enjeux du scrutin présidentiel",
    slug: "elections-comores-enjeux-scrutin-presidentiel",
    content: "Le pays se prépare pour un moment historique. Les observateurs internationaux sont déjà sur place pour garantir la transparence du processus électoral...\n\n### Un climat politique tendu\n\nLes différents candidats ont multiplié les meetings à travers les îles de la Grande Comore, Anjouan et Mohéli. Les thèmes de l'économie et de la stabilité sociale sont au cœur des débats.",
    excerpt: "Analyse complète des forces en présence et des attentes de la population comorienne à l'approche du vote.",
    mainImage: "https://images.unsplash.com/photo-1541872703-74c5e44311fe?q=80&w=2000&auto=format&fit=crop",
    category: "politique",
    status: "published",
    isBreaking: true,
    views: 1250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tags: ["élections", "politique", "Comores"]
  },
  {
    title: "FCBK FM : 300 000 abonnés, un record pour le média comorien",
    slug: "fcbk-fm-record-abonnes-media-comorien",
    content: "La plateforme d'information continue de croître et s'impose comme le leader incontesté de l'actualité en temps réel aux Comores et dans la diaspora.",
    excerpt: "Une étape majeure franchie par l'équipe de FCBK FM qui remercie sa fidèle communauté.",
    mainImage: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2000&auto=format&fit=crop",
    category: "national",
    status: "published",
    isBreaking: false,
    views: 890,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tags: ["média", "FCBK FM", "record"]
  },
  {
    title: "Sport : Les Cœlacanthes se préparent pour la prochaine CAN",
    slug: "sport-coelacanthes-preparation-can",
    content: "L'équipe nationale de football intensifie ses entraînements. Le sélectionneur se dit confiant quant aux chances de l'équipe de briller lors de la compétition.",
    excerpt: "Tout le pays est derrière ses héros pour cette nouvelle aventure continentale.",
    mainImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop",
    category: "sport",
    status: "published",
    isBreaking: false,
    views: 2100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tags: ["sport", "football", "Cœlacanthes"]
  }
];

export const seedData = async (forceAdmin = false) => {
  // Only proceed if authenticated (or if we really want to try)
  const user = auth.currentUser;
  
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      if (!user && !forceAdmin) {
        console.log("Database is empty, but not seeding because user is not authenticated.");
        return;
      }

      console.log("Seeding sample data...");
      const authorId = user?.uid || 'system_seed';
      
      for (const article of SAMPLE_ARTICLES) {
        await addDoc(articlesRef, {
          ...article,
          authorId: authorId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString()
        });
      }
      console.log("Seeding complete.");
    }
  } catch (error) {
    // Fail silently in production to avoid bothering users with permission errors
    console.debug("Seed attempt skipped (likely permission denied or already seeded)");
  }
};
