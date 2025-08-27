import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, error } = req.query;

    console.log('=== Yahoo OAuth 2.0 Callback ===');
    console.log('Callback parameters:', { code: code ? 'PRESENT' : 'MISSING', state, error });

    if (error) {
      console.error('OAuth error from Yahoo:', error);
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&error=${encodeURIComponent(error as string)}`);
    }

    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&error=no_code`);
    }

    // Exchange authorization code for access token
    const tokenParams = new URLSearchParams({
      client_id: process.env.YAHOO_CLIENT_ID!,
      client_secret: process.env.YAHOO_CLIENT_SECRET!,
      redirect_uri: process.env.YAHOO_REDIRECT_URI!,
      code: code as string,
      grant_type: 'authorization_code'
    });

    console.log('Requesting access token from Yahoo...');
    
    const tokenResponse = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.YAHOO_CLIENT_ID}:${process.env.YAHOO_CLIENT_SECRET}`).toString('base64')}`
      },
      body: tokenParams.toString()
    });

    console.log('Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', {
      access_token: tokenData.access_token ? 'PRESENT' : 'MISSING',
      refresh_token: tokenData.refresh_token ? 'PRESENT' : 'MISSING',
      expires_in: tokenData.expires_in
    });

    // Get user profile to verify the token works
    const profileResponse = await fetch('https://api.login.yahoo.com/openid/v1/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('User profile retrieved:', {
        sub: profileData.sub,
        name: profileData.name,
        email: profileData.email
      });
    }

    // Store tokens securely (in a real app, you'd save to database)
    // For now, redirect with success and include token info
    const successUrl = `${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=success&access_token=${encodeURIComponent(tokenData.access_token)}`;
    
    console.log('Redirecting to success URL');
    res.redirect(successUrl);

  } catch (error) {
    console.error('Yahoo OAuth 2.0 callback error:', error);
    res.redirect(`${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}?auth=error&error=callback_error`);
  }
}
