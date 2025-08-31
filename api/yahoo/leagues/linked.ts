import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // For now, return null as we don't have persistent storage
  // In a real implementation, this would check a database for the linked league
  return res.status(200).json(null);
}
