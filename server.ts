
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import admin from "firebase-admin";

import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseApp: admin.app.App;
if (!admin.apps.length) {
  try {
    // Check if we have a service account JSON string in env
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback to application default credentials or project ID
      firebaseApp = admin.initializeApp({
        projectId: "gen-lang-client-0892197534"
      });
    }
  } catch (err) {
    console.error("Firebase Admin initialization error:", err);
    firebaseApp = admin.app();
  }
} else {
  firebaseApp = admin.app();
}

// Set specific database ID if provided in config
const FIRESTORE_DATABASE_ID = "ai-studio-9660e84f-5cca-4695-9c34-462ec8e31f0e";
let firestordb: admin.firestore.Firestore;

try {
  firestordb = getFirestore(firebaseApp, FIRESTORE_DATABASE_ID);
} catch (err) {
  console.warn(`Failed to connect to ${FIRESTORE_DATABASE_ID}, falling back to default DB`, err);
  firestordb = getFirestore(firebaseApp);
}

// SERVER-SIDE SEEDING
async function seedIfEmpty() {
  try {
    const snapshot = await firestordb.collection("articles").limit(1).get();
    if (snapshot.empty) {
      console.log("Seeding articles from server...");
      const articles = [
        {
          title: "Élections aux Comores : Les enjeux du scrutin présidentiel",
          slug: "elections-comores-enjeux-scrutin-presidentiel",
          content: "Le pays se prépare pour un moment historique...",
          excerpt: "Analyse complète des forces en présence.",
          mainImage: "https://picsum.photos/seed/comores1/1200/800",
          category: "politique",
          status: "published",
          isBreaking: true,
          views: 1250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          tags: ["élections", "politique", "Comores"],
          authorId: "system"
        },
        {
          title: "FCBK FM : 300 000 abonnés, un record pour le média comorien",
          slug: "fcbk-fm-record-abonnes-media-comorien",
          content: "La plateforme d'information continue de croître...",
          excerpt: "Une étape majeure franchie par l'équipe de FCBK FM.",
          mainImage: "https://picsum.photos/seed/media/1200/800",
          category: "national",
          status: "published",
          isBreaking: false,
          views: 890,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          tags: ["média", "FCBK FM", "record"],
          authorId: "system"
        }
      ];
      
      for (const article of articles) {
        await firestordb.collection("articles").add(article);
      }
      console.log("Server-side seeding articles complete.");
    }

    const catSnap = await firestordb.collection("categories").limit(1).get();
    if (catSnap.empty) {
      console.log("Seeding categories...");
      const categories = [
        { name: "National", slug: "national", order: 1 },
        { name: "International", slug: "international", order: 2 },
        { name: "Politique", slug: "politique", order: 3 },
        { name: "Économie", slug: "economie", order: 4 },
        { name: "Sport", slug: "sport", order: 5 },
        { name: "Culture", slug: "culture", order: 6 },
        { name: "Diaspora", slug: "diaspora", order: 7 },
        { name: "Société", slug: "societe", order: 8 }
      ];
      for (const cat of categories) {
        await firestordb.collection("categories").doc(cat.slug).set(cat);
      }
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

seedIfEmpty();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cache-Control middleware for API routes
  const publicCache = (req: any, res: any, next: any) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    next();
  };

  // Simple health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Articles API - Simple and direct
  app.get("/api/articles", async (req, res) => {
    try {
      const { limit = 50, category } = req.query;
      let querySnapshot;
      
      if (category && category !== 'all') {
        querySnapshot = await firestordb.collection("articles")
          .where("category", "==", category)
          .limit(Number(limit))
          .get();
      } else {
        querySnapshot = await firestordb.collection("articles")
          .limit(Number(limit))
          .get();
      }

      if (querySnapshot.empty) {
        await seedIfEmpty();
        const retrySnap = await firestordb.collection("articles").limit(5).get();
        const articles = retrySnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        return res.json(articles);
      }

      const articles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as any
      }));

      // In-memory sort
      articles.sort((a, b) => {
        const da = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const db = new Date(b.publishedAt || b.createdAt || 0).getTime();
        return db - da;
      });

      res.json(articles);
    } catch (error: any) {
      console.error("API Error articles:", error);
      res.status(500).json({ error: "Fetch failed", details: error.message });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const snap = await firestordb.collection("articles").where("slug", "==", req.params.slug).limit(1).get();
      if (snap.empty) return res.status(404).json({ error: "Article non trouvé" });
      const doc = snap.docs[0];
      res.json({ id: doc.id, ...doc.data() as any });
    } catch (error: any) {
      res.status(500).json({ error: "Erreur serveur", message: error.message });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const snapshot = await firestordb.collection("categories").get();
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/authors", async (req, res) => {
    try {
      const snapshot = await firestordb.collection("users").get();
      const authors = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data() as any
      }));
      res.json(authors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch authors" });
    }
  });

  // Newsletter subscription (Brevo)
  app.post("/api/subscribe", async (req, res) => {
    const { email } = req.body;
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!email) {
      return res.status(400).json({ error: "Email requis" });
    }

    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY non configurée dans les variables d'environnement.");
      return res.status(500).json({ error: "Configuration Brevo manquante sur le serveur." });
    }

    try {
      await axios.post(
        "https://api.brevo.com/v3/contacts",
        {
          email,
          updateEnabled: true,
          listIds: [2], // ID de liste par défaut
        },
        {
          headers: {
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      res.json({ success: true });
    } catch (error: any) {
      const brevoError = error.response?.data;
      console.error("Erreur Brevo:", brevoError || error.message);

      // Si le contact existe déjà, on considère cela comme un succès pour l'utilisateur
      if (brevoError?.code === "duplicate_parameter" || brevoError?.message?.includes("already exists")) {
        return res.json({ success: true, message: "Déjà inscrit" });
      }

      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  // robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = process.env.APP_URL || "https://ais-pre-lg5bv55vxbrifnzov3d76z-718657164461.europe-west2.run.app";
    res.type("text/plain");
    res.send(`User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml`);
  });

  // Dynamic Sitemap
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = process.env.APP_URL || "https://ais-pre-lg5bv55vxbrifnzov3d76z-718657164461.europe-west2.run.app";
    const pages = ["", "/about", "/contact", "/legal", "/advertising", "/archives"];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`).join("")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
