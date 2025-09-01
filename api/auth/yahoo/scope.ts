import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const defaultScopes = (process.env.YAHOO_REQUESTED_SCOPES || 'fspt-r fspt-w').trim();
  
  return res.status(200).json({ 
    defaultScopes: defaultScopes, 
    env: process.env.YAHOO_REQUESTED_SCOPES || null 
  });
}
