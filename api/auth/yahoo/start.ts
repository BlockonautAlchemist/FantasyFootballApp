import { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth } from 'oauth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting Yahoo OAuth process...');
    console.log('Environment check:', {
      clientId: process.env.YAHOO_CLIENT_ID ? 'SET' : 'MISSING',
      clientSecret: process.env.YAHOO_CLIENT_SECRET ? 'SET' : 'MISSING',
      redirectUri: process.env.YAHOO_REDIRECT_URI ? 'SET' : 'MISSING'
    });

    const oauth = new OAuth(
      'https://api.login.yahoo.com/oauth/v2/get_request_token',
      'https://api.login.yahoo.com/oauth/v2/get_token',
      process.env.YAHOO_CLIENT_ID!,
      process.env.YAHOO_CLIENT_SECRET!,
      '1.0A',
      process.env.YAHOO_REDIRECT_URI!,
      'HMAC-SHA1'
    );

    // Get request token - try with both standard callback and OOB fallback
    const { requestToken, requestSecret } = await new Promise<{requestToken: string, requestSecret: string}>((resolve, reject) => {
      // First try with the standard callback URL
      oauth.getOAuthRequestToken(
        process.env.YAHOO_REDIRECT_URI!,
        (error, requestToken, requestSecret) => {
          if (error) {
            console.error('Standard callback failed, trying OOB method...', error);
            
            // Fallback to out-of-band (OOB) method for serverless environments
            oauth.getOAuthRequestToken(
              'oob',
              (oobError, oobRequestToken, oobRequestSecret) => {
                if (oobError) {
                  console.error('OOB OAuth request token error:', oobError);
                  console.error('Error data:', (oobError as any).data);
                  console.error('Error statusCode:', (oobError as any).statusCode);
                  reject(new Error(`Both callback methods failed. Last error: ${(oobError as any).data || (oobError as any).message || oobError}`));
                  return;
                }
                console.log('Successfully obtained OOB request token:', oobRequestToken);
                resolve({ requestToken: oobRequestToken, requestSecret: oobRequestSecret });
              }
            );
            return;
          }
          console.log('Successfully obtained standard request token:', requestToken);
          resolve({ requestToken, requestSecret });
        }
      );
    });

    // Store request secret in a way we can retrieve it later
    // For serverless, we'll encode it in the state parameter
    const state = Buffer.from(JSON.stringify({ requestSecret })).toString('base64');
    
    // Build the authorization URL - include callback for standard flow
    const authUrl = `https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=${requestToken}&oauth_callback=${encodeURIComponent(process.env.YAHOO_REDIRECT_URI!)}&state=${state}`;
    
    console.log('Generated auth URL:', authUrl);
    res.json({ authUrl });
  } catch (error) {
    console.error('Yahoo OAuth start error:', error);
    res.status(500).json({ error: 'Failed to initiate Yahoo authentication' });
  }
}
