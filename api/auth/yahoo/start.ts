import { VercelRequest, VercelResponse } from '@vercel/node';
import { yahooApi } from '../../../server/yahoo-api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { authUrl, requestToken, requestSecret } = await yahooApi.getAuthUrl();
    
    // For serverless, we can't use sessions easily, so we'll use a different approach
    // Store tokens in a way that can be retrieved in the callback
    res.json({ authUrl });
  } catch (error) {
    console.error('Yahoo OAuth start error:', error);
    res.status(500).json({ error: 'Failed to initiate Yahoo authentication' });
  }
}
