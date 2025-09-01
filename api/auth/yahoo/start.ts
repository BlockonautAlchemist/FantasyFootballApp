import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRequestToken, getAuthorizationUrl } from '../../../shared/oauth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    // Check if OAuth credentials are configured
    const consumer_key = process.env.YAHOO_CLIENT_ID;
    const consumer_secret = process.env.YAHOO_CLIENT_SECRET;
    const callback_url = process.env.YAHOO_REDIRECT_URI;

    if (!consumer_key || !consumer_secret || !callback_url) {
      return res.status(500).json({ 
        error: 'oauth_not_configured',
        message: 'Yahoo OAuth credentials not configured. Please set YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET, and YAHOO_REDIRECT_URI environment variables.'
      });
    }

    // Get request token from Yahoo
    const requestToken = await getRequestToken({
      consumer_key,
      consumer_secret,
      callback_url
    });

    // Store tokens in session or temporary storage
    // For now, we'll store them in cookies (in production, use a proper session store)
    res.setHeader('Set-Cookie', [
      `yahoo_oauth_token=${requestToken.oauth_token}; Path=/; HttpOnly; SameSite=Lax`,
      `yahoo_oauth_token_secret=${requestToken.oauth_token_secret}; Path=/; HttpOnly; SameSite=Lax`
    ]);

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(requestToken.oauth_token);

    // Redirect user to Yahoo authorization page
    res.redirect(authUrl);

  } catch (error) {
    console.error('Yahoo OAuth start error:', error);
    return res.status(500).json({ 
      error: 'oauth_start_failed',
      message: 'Failed to start Yahoo OAuth flow',
      detail: String(error)
    });
  }
}
