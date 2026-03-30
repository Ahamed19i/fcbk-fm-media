
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
