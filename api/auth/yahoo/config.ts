import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isConfigured = !!(
    process.env.YAHOO_CLIENT_ID && 
    process.env.YAHOO_CLIENT_SECRET && 
    process.env.YAHOO_REDIRECT_URI
  );
  
  res.json({ 
    configured: isConfigured,
    clientId: process.env.YAHOO_CLIENT_ID ? `${process.env.YAHOO_CLIENT_ID.substring(0, 8)}...` : null
  });
}
