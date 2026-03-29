import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from './firebase';

const SAMPLE_ARTICLES = [
  {
    title: "Élections aux Comores : Les enjeux du scrutin présidentiel",
    slug: "elections-comores-enjeux-scrutin-presidentiel",
    content: "Le pays se prépare pour un moment historique. Les observateurs internationaux sont déjà sur place pour garantir la transparence du processus électoral...\n\n### Un climat politique tendu\n\nLes différents candidats ont multiplié les meetings à travers les îles de la Grande Comore, Anjouan et Mohéli. Les thèmes de l'économie et de la stabilité sociale sont au cœur des débats.",
    excerpt: "Analyse complète des forces en présence et des attentes de la population comorienne à l'approche du vote.",
    mainImage: "https://picsum.photos/seed/comores1/1200/800",
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
    mainImage: "https://picsum.photos/seed/media/1200/800",
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
    title: "Économie : Le prix de la vanille en hausse sur le marché mondial",
    slug: "economie-prix-vanille-hausse-marche-mondial",
    content: "Une excellente nouvelle pour les producteurs locaux. La demande mondiale pour la vanille de qualité supérieure des Comores ne cesse de croître.",
    excerpt: "Les exportations de vanille pourraient atteindre des sommets cette année, boostant l'économie nationale.",
    mainImage: "https://picsum.photos/seed/vanilla/1200/800",
    category: "economie",
    status: "published",
    isBreaking: false,
    views: 450,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    tags: ["économie", "vanille", "exportation"]
  },
  {
    title: "Sport : Les Cœlacanthes se préparent pour la prochaine CAN",
    slug: "sport-coelacanthes-preparation-can",
    content: "L'équipe nationale de football intensifie ses entraînements. Le sélectionneur se dit confiant quant aux chances de l'équipe de briller lors de la compétition.",
    excerpt: "Tout le pays est derrière ses héros pour cette nouvelle aventure continentale.",
    mainImage: "https://picsum.photos/seed/football/1200/800",
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

export const seedData = async () => {
  const articlesRef = collection(db, 'articles');
  const q = query(articlesRef, limit(1));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log("Seeding sample data...");
    for (const article of SAMPLE_ARTICLES) {
      await addDoc(articlesRef, article);
    }
    console.log("Seeding complete.");
  }
};
