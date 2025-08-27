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

    // Get request token with callback URL properly registered
    const { requestToken, requestSecret } = await new Promise<{requestToken: string, requestSecret: string}>((resolve, reject) => {
      // Pass the callback URL as the first parameter to getOAuthRequestToken
      oauth.getOAuthRequestToken(process.env.YAHOO_REDIRECT_URI!, (error, requestToken, requestSecret) => {
        if (error) {
          console.error('OAuth request token error details:', error);
          reject(new Error(`Error getting request token: ${(error as any).data || (error as any).message || error}`));
          return;
        }
        resolve({ requestToken, requestSecret });
      });
    });

    // Store request secret in a way we can retrieve it later
    // For serverless, we'll encode it in the state parameter
    const state = Buffer.from(JSON.stringify({ requestSecret })).toString('base64');
    
    // Don't include oauth_callback in the auth URL since it's already registered with the request token
    const authUrl = `https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=${requestToken}&state=${state}`;
    
    res.json({ authUrl });
  } catch (error) {
    console.error('Yahoo OAuth start error:', error);
    res.status(500).json({ error: 'Failed to initiate Yahoo authentication' });
  }
}
