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

// Initialize Firebase Admin with current project ID
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gen-lang-client-0892197534"
  });
}

// Set specific database ID if needed
const FIRESTORE_DATABASE_ID = "ai-studio-9660e84f-5cca-4695-9c34-462ec8e31f0e";
const db = getFirestore(admin.app(), FIRESTORE_DATABASE_ID);

async function seedIfEmpty() {
  try {
    const snap = await db.collection("articles").limit(1).get();
    if (snap.empty) {
      console.log("Seeding articles...");
      await db.collection("articles").add({
        title: "Bienvenue sur FCBK FM",
        slug: "bienvenue-fcbk-fm",
        content: "Le média de référence des Comores.",
        excerpt: "FCBK FM vous souhaite la bienvenue.",
        category: "national",
        status: "published",
        isBreaking: true,
        mainImage: "https://picsum.photos/seed/welcome/1200/800",
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("Seed error:", e);
  }
}

seedIfEmpty();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/articles", async (req, res) => {
    try {
      const { category, limit = 50 } = req.query;
      let query = db.collection("articles");

      if (category && category !== 'all') {
        query = query.where("category", "==", category) as any;
      }

      const snapshot = await query.limit(Number(limit)).get();
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(articles);
    } catch (error: any) {
      console.error("Error articles:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const snapshot = await db.collection("articles").where("slug", "==", slug).limit(1).get();
      
      if (snapshot.empty) {
        return res.status(404).json({ error: "Not found" });
      }

      const doc = snapshot.docs[0];
      res.json({ id: doc.id, ...doc.data() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const snapshot = await db.collection("categories").get();
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      const BREVO_API_KEY = process.env.BREVO_API_KEY;
      if (!BREVO_API_KEY) throw new Error("Missing configuration");

      await axios.post("https://api.brevo.com/v3/contacts", 
        { email, listIds: [2], updateEnabled: true },
        { headers: { "api-key": BREVO_API_KEY } }
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite setup
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
