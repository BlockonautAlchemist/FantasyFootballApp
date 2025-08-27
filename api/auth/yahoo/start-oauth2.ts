import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Yahoo OAuth 2.0 Implementation ===');
    
    const clientId = process.env.YAHOO_CLIENT_ID!;
    const redirectUri = process.env.YAHOO_REDIRECT_URI!;
    
    console.log('OAuth 2.0 parameters:', {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'MISSING',
      redirectUri
    });

    // Generate state parameter for security (CSRF protection)
    const state = crypto.randomBytes(32).toString('hex');
    
    // Yahoo OAuth 2.0 authorization URL
    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'fspt-r', // Fantasy Sports read permission
      state: state,
      language: 'en-us'
    });

    const authUrl = `https://api.login.yahoo.com/oauth2/request_auth?${authParams.toString()}`;
    
    console.log('Generated OAuth 2.0 auth URL:', authUrl);
    
    // In a real implementation, you'd store the state parameter in a database or session
    // For now, we'll include it in the response for the callback to verify
    res.json({ 
      authUrl,
      state // The callback will need to verify this matches
    });

  } catch (error) {
    console.error('Yahoo OAuth 2.0 error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate Yahoo authentication',
      details: error.message
    });
  }
}
