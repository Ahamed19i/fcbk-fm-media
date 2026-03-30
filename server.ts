
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Newsletter subscription (Brevo)
  app.post("/api/subscribe", async (req, res) => {
    const { email } = req.body;
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!email) {
      return res.status(400).json({ error: "Email requis" });
    }

    if (!BREVO_API_KEY) {
      // Fallback if no API key is provided yet
      console.warn("BREVO_API_KEY non configurée. Simulation de succès.");
      return res.json({ success: true, message: "Simulation réussie (clé manquante)" });
    }

    try {
      await axios.post(
        "https://api.brevo.com/v3/contacts",
        {
          email,
          updateEnabled: true,
          listIds: [2], // Remplacez par votre ID de liste Brevo
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
      console.error("Erreur Brevo:", error.response?.data || error.message);
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  // Dynamic Sitemap
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = "https://ais-pre-lg5bv55vxbrifnzov3d76z-718657164461.europe-west2.run.app";
    const pages = ["", "/about", "/contact", "/legal", "/advertising", "/archives"];
    
    // In a real app, you would fetch all article slugs from Firestore here
    // For now, we'll return a basic sitemap
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
