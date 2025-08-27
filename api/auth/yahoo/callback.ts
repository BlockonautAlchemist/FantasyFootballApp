import { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth } from 'oauth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { oauth_token, oauth_verifier, state } = req.query;

    if (!oauth_token || !oauth_verifier || !state) {
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error`);
    }

    // Decode the state to get request secret
    const { requestSecret } = JSON.parse(Buffer.from(state as string, 'base64').toString());

    const oauth = new OAuth(
      'https://api.login.yahoo.com/oauth/v2/get_request_token',
      'https://api.login.yahoo.com/oauth/v2/get_token',
      process.env.YAHOO_CLIENT_ID!,
      process.env.YAHOO_CLIENT_SECRET!,
      '1.0A',
      process.env.YAHOO_REDIRECT_URI!,
      'HMAC-SHA1'
    );

    // Exchange for access token
    const { accessToken, accessSecret, sessionHandle } = await new Promise<{
      accessToken: string;
      accessSecret: string;
      sessionHandle: string;
    }>((resolve, reject) => {
      oauth.getOAuthAccessToken(
        oauth_token as string,
        requestSecret,
        oauth_verifier as string,
        (error, accessToken, accessSecret, results) => {
          if (error) {
            reject(new Error(`Error getting access token: ${(error as any).data || (error as any).message || error}`));
            return;
          }

          const sessionHandle = results?.oauth_session_handle || '';
          resolve({ accessToken, accessSecret, sessionHandle });
        }
      );
    });

    // Get user profile from Yahoo
    const userProfile = await new Promise<any>((resolve, reject) => {
      oauth.get(
        'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1',
        accessToken,
        accessSecret,
        (error, data) => {
          if (error) {
            reject(new Error(`Failed to get user profile: ${(error as any).data || (error as any).message || error}`));
            return;
          }

          try {
            // Yahoo returns XML, but for simplicity we'll just store what we need
            resolve({ accessToken, accessSecret, sessionHandle });
          } catch (parseError) {
            reject(new Error(`Failed to parse user profile: ${parseError}`));
          }
        }
      );
    });

    // For now, just redirect with success
    // In a full implementation, you'd store the tokens securely
    res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=success&token=${encodeURIComponent(accessToken)}`);
  } catch (error) {
    console.error('Yahoo OAuth callback error:', error);
    res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error`);
  }
}
