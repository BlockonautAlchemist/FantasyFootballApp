import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Read query parameters
  const { code, state, error, error_description } = req.query;
  
  // Handle OAuth errors
  if (error) {
    return res.status(400).json({
      error: error,
      error_description: error_description || null
    });
  }

  // Verify state cookie matches
  const stateCookie = req.cookies.yahoo_state;
  if (!stateCookie || stateCookie !== state) {
    return res.status(400).json({
      error: 'invalid_state',
      error_description: 'State parameter does not match stored state'
    });
  }

  // Check if nonce cookie exists when openid scopes were used
  const nonceCookie = req.cookies.yahoo_nonce;
  // If nonce cookie exists, it means openid scope was used
  const usedOpenID = !!nonceCookie;

  // Exchange code for token
  const clientId = process.env.YAHOO_CLIENT_ID!;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET!;
  const redirectUri = process.env.YAHOO_REDIRECT_URI!.trim();

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(400).json({
        error: 'token_exchange_failed',
        error_description: errorText
      });
    }

    const tokenData = await response.json();
    
    // Set access token cookie
    res.setHeader('Set-Cookie', [
      `yahoo_access=${tokenData.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${tokenData.expires_in}`,
      ...(tokenData.refresh_token ? [`yahoo_refresh=${tokenData.refresh_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`] : []),
      // Clear state and nonce cookies
      'yahoo_state=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0',
      'yahoo_nonce=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0'
    ]);

    // Redirect to connect page with success indicator
    return res.redirect(302, '/connect?connected=1');

  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({
      error: 'internal_error',
      error_description: 'Failed to exchange authorization code for token'
    });
  }
}
