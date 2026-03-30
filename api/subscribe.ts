
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = request.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!email) {
    return response.status(400).json({ error: "Email requis" });
  }

  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY non configurée sur Vercel.");
    return response.status(500).json({ error: "Configuration Brevo manquante sur le serveur." });
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
    return response.json({ success: true });
  } catch (error: any) {
    const brevoError = error.response?.data;
    console.error("Erreur Brevo:", brevoError || error.message);

    if (brevoError?.code === "duplicate_parameter" || brevoError?.message?.includes("already exists")) {
      return response.json({ success: true, message: "Déjà inscrit" });
    }

    return response.status(500).json({ error: "Erreur lors de l'inscription" });
  }
}
