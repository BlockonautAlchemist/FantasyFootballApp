import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Read refresh token from cookie
  const refreshToken = req.cookies.yahoo_refresh;
  
  if (!refreshToken) {
    return res.status(401).json({
      error: 'no_refresh_token',
      error_description: 'No refresh token found in cookies'
    });
  }

  // Get environment variables
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
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(400).json({
        error: 'refresh_failed',
        error_description: errorText
      });
    }

    const tokenData = await response.json();
    
    // Set new access token cookie
    res.setHeader('Set-Cookie', [
      `yahoo_access=${tokenData.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${tokenData.expires_in}`,
      // Update refresh token if provided
      ...(tokenData.refresh_token ? [`yahoo_refresh=${tokenData.refresh_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`] : [])
    ]);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      expires_in: tokenData.expires_in
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      error: 'internal_error',
      error_description: 'Failed to refresh token'
    });
  }
}
