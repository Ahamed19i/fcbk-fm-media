
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { code } = request.body;
  
  if (!code) {
    return response.status(400).json({ error: "Code requis" });
  }

  try {
    // On utilise une variable d'environnement sur Vercel (invisible côté client)
    const requiredCode = process.env.ADMIN_ACCESS_CODE || "";
    
    if (code === requiredCode) {
      return response.json({ success: true });
    } else {
      return response.status(401).json({ error: "Code invalide" });
    }
  } catch (error) {
    console.error("Erreur de vérification:", error);
    return response.status(500).json({ error: "Erreur serveur" });
  }
}
