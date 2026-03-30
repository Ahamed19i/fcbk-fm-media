
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const baseUrl = process.env.APP_URL || "https://ais-pre-lg5bv55vxbrifnzov3d76z-718657164461.europe-west2.run.app";
  const content = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml`;

  response.setHeader("Content-Type", "text/plain");
  return response.send(content);
}
