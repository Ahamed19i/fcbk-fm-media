
import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import { adminAuth, adminDb } from '../_lib/firebase-admin';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { targetUid, role } = request.body;
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the caller's token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const callerEmail = decodedToken.email;

    // Check if caller is admin
    // Super admin email or existing admin claim
    const isSuperAdmin = callerEmail === "ahassanimhoma20@gmail.com";
    const isAdmin = decodedToken.role === 'admin' || isSuperAdmin;

    if (!isAdmin) {
      return response.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    if (!['admin', 'editor', 'journalist'].includes(role)) {
      return response.status(400).json({ error: 'Invalid role' });
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(targetUid, { role });

    // Update Firestore document for consistency (and for UI to show role)
    await adminDb.collection('users').doc(targetUid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return response.json({ success: true, message: `Role ${role} assigned to user ${targetUid}` });
  } catch (error: any) {
    console.error("Error setting role:", error);
    return response.status(500).json({ error: error.message });
  }
}
