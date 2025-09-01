import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccessToken } from '../../../shared/oauth';

function getCookie(req: VercelRequest, name: string) {
  const cookie = req.headers.cookie || '';
  const hit = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    // Get OAuth verifier from query parameters
    const oauth_verifier = req.query.oauth_verifier as string;
    const oauth_token = req.query.oauth_token as string;

    if (!oauth_verifier || !oauth_token) {
      return res.status(400).json({ 
        error: 'missing_parameters',
        message: 'Missing oauth_verifier or oauth_token in callback'
      });
    }

    // Get stored tokens from cookies
    const stored_oauth_token = getCookie(req, 'yahoo_oauth_token');
    const stored_oauth_token_secret = getCookie(req, 'yahoo_oauth_token_secret');

    if (!stored_oauth_token || !stored_oauth_token_secret) {
      return res.status(400).json({ 
        error: 'missing_stored_tokens',
        message: 'No stored OAuth tokens found. Please restart the OAuth flow.'
      });
    }

    // Verify the token matches
    if (stored_oauth_token !== oauth_token) {
      return res.status(400).json({ 
        error: 'token_mismatch',
        message: 'OAuth token mismatch'
      });
    }

    // Check if OAuth credentials are configured
    const consumer_key = process.env.YAHOO_CLIENT_ID;
    const consumer_secret = process.env.YAHOO_CLIENT_SECRET;

    if (!consumer_key || !consumer_secret) {
      return res.status(500).json({ 
        error: 'oauth_not_configured',
        message: 'Yahoo OAuth credentials not configured'
      });
    }

    // Exchange verifier for access token
    const accessToken = await getAccessToken(
      {
        consumer_key,
        consumer_secret,
        callback_url: process.env.YAHOO_REDIRECT_URI || ''
      },
      oauth_token,
      stored_oauth_token_secret,
      oauth_verifier
    );

    // Store access tokens in cookies (in production, use a secure session store)
    res.setHeader('Set-Cookie', [
      `yahoo_access_token=${accessToken.oauth_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      `yahoo_access_token_secret=${accessToken.oauth_token_secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    ]);

    // Clear temporary tokens
    res.setHeader('Set-Cookie', [
      'yahoo_oauth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      'yahoo_oauth_token_secret=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    ]);

    // Redirect to success page or dashboard
    res.redirect('/?oauth_success=true');

  } catch (error) {
    console.error('Yahoo OAuth callback error:', error);
    return res.status(500).json({ 
      error: 'oauth_callback_failed',
      message: 'Failed to complete Yahoo OAuth flow',
      detail: String(error)
    });
  }
}
