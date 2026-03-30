
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { adminDb } from './_lib/firebase-admin';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = request.body;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;

  if (!email) {
    return response.status(400).json({ error: "Email requis" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return response.status(400).json({ error: "Format d'email invalide" });
  }

  if (!BREVO_API_KEY) {
    console.error("BREVO_API_KEY non configurée sur Vercel.");
    return response.status(500).json({ error: "Configuration Brevo manquante sur le serveur." });
  }

  try {
    // Rate limiting: check if this IP has made too many requests recently
    const ipKey = String(clientIp).replace(/[./]/g, '_');
    const rateLimitDoc = await adminDb.collection('rate_limits').doc(ipKey).get();
    const now = Date.now();

    if (rateLimitDoc.exists) {
      const data = rateLimitDoc.data();
      const lastRequest = data?.lastRequest || 0;
      const count = data?.count || 0;

      // Limit: max 5 requests per hour from the same IP
      if (now - lastRequest < 3600000 && count >= 5) {
        return response.status(429).json({ error: "Trop de tentatives. Veuillez réessayer plus tard." });
      }

      // Reset count if an hour has passed
      const newCount = now - lastRequest < 3600000 ? count + 1 : 1;
      await adminDb.collection('rate_limits').doc(ipKey).update({
        lastRequest: now,
        count: newCount
      });
    } else {
      await adminDb.collection('rate_limits').doc(ipKey).set({
        lastRequest: now,
        count: 1
      });
    }

    // Call Brevo API
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
