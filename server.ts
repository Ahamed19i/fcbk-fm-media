import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Check if we have a service account JSON string in env
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback to application default credentials or project ID
      admin.initializeApp({
        projectId: "gen-lang-client-0892197534"
      });
    }
  } catch (err) {
    console.error("Firebase Admin initialization error:", err);
  }
}

const db = admin.firestore();
// Set specific database ID if provided in config
const FIRESTORE_DATABASE_ID = "ai-studio-9660e84f-5cca-4695-9c34-462ec8e31f0e";
const firestordb = admin.firestore(admin.app()); // Default instance

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cache-Control middleware for API routes
  const publicCache = (req: any, res: any, next: any) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    next();
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Articles API with caching and optimization
  app.get("/api/articles", publicCache, async (req, res) => {
    try {
      const { limit = 50, category } = req.query;
      let query = firestordb.collection("articles")
        .where("status", "==", "published")
        .orderBy("publishedAt", "desc")
        .limit(Number(limit));

      if (category && category !== 'all') {
        query = query.where("category", "==", category);
      }

      const snapshot = await query.get();
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json(articles);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles", message: error.message });
    }
  });

  app.get("/api/articles/:slug", publicCache, async (req, res) => {
    try {
      const { slug } = req.params;
      const snapshot = await firestordb.collection("articles")
        .where("slug", "==", slug)
        .where("status", "==", "published")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ error: "Article not found" });
      }

      const doc = snapshot.docs[0];
      const articleData = doc.data();
      
      // OPTIMIZATION: Fetch author info in the same request to save client-side roundtrips
      let author = null;
      const authorId = articleData.authorId || articleData.authorid;
      if (authorId) {
        const authorSnap = await firestordb.collection("users").doc(authorId).get();
        if (authorSnap.exists) {
          const authData = authorSnap.data();
          author = {
            uid: authorSnap.id,
            displayName: authData?.displayName,
            photoURL: authData?.photoURL,
            role: authData?.role,
            bio: authData?.bio
          };
        }
      }

      // OPTIMIZATION: Fetch few related articles (same category)
      const relatedSnap = await firestordb.collection("articles")
        .where("category", "==", articleData.category)
        .where("status", "==", "published")
        .orderBy("publishedAt", "desc")
        .limit(5)
        .get();
      
      const related = relatedSnap.docs
        .filter(d => d.id !== doc.id)
        .slice(0, 4)
        .map(d => ({ id: d.id, ...d.data() }));

      res.json({
        ...articleData,
        id: doc.id,
        author,
        related
      });
    } catch (error: any) {
      console.error("Error fetching article:", error);
      res.status(500).json({ error: "Failed to fetch article", message: error.message });
    }
  });

  app.get("/api/categories", publicCache, async (req, res) => {
    try {
      const snapshot = await firestordb.collection("categories").orderBy("order", "asc").get();
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/authors", publicCache, async (req, res) => {
    try {
      const snapshot = await firestordb.collection("users")
        .where("role", "in", ["admin", "editor", "journalist"])
        .get();
      const authors = snapshot.docs.map(doc => ({
        uid: doc.id,
        displayName: doc.data().displayName,
        photoURL: doc.data().photoURL,
        role: doc.data().role,
        bio: doc.data().bio
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
