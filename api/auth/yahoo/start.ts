import { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth } from 'oauth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const oauth = new OAuth(
      'https://api.login.yahoo.com/oauth/v2/get_request_token',
      'https://api.login.yahoo.com/oauth/v2/get_token',
      process.env.YAHOO_CLIENT_ID!,
      process.env.YAHOO_CLIENT_SECRET!,
      '1.0A',
      process.env.YAHOO_REDIRECT_URI!,
      'HMAC-SHA1'
    );

    // Get request token
    const { requestToken, requestSecret } = await new Promise<{requestToken: string, requestSecret: string}>((resolve, reject) => {
      oauth.getOAuthRequestToken((error, requestToken, requestSecret) => {
        if (error) {
          reject(new Error(`Error getting request token: ${(error as any).data || (error as any).message || error}`));
          return;
        }
        resolve({ requestToken, requestSecret });
      });
    });

    // Store request secret in a way we can retrieve it later
    // For serverless, we'll encode it in the state parameter
    const state = Buffer.from(JSON.stringify({ requestSecret })).toString('base64');
    
    const authUrl = `https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=${requestToken}&oauth_callback=${encodeURIComponent(process.env.YAHOO_REDIRECT_URI!)}&state=${state}`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Yahoo OAuth start error:', error);
    res.status(500).json({ error: 'Failed to initiate Yahoo authentication' });
  }
}
