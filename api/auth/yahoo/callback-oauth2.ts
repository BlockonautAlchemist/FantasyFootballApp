import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state, error } = req.query;

    console.log('=== Yahoo OAuth 2.0 Callback ===');
    console.log('Callback parameters:', { code: code ? 'PRESENT' : 'MISSING', state, error });

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://fantasy-football-app-psi.vercel.app' 
      : 'http://localhost:5000';

    if (error) {
      console.error('OAuth error from Yahoo:', error);
      return res.redirect(`${baseUrl}?auth=error&error=${encodeURIComponent(error as string)}`);
    }

    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${baseUrl}?auth=error&error=no_code`);
    }

    // For now, just redirect with success to test the basic flow
    // We'll add token exchange back once we confirm the redirect works
    console.log('OAuth callback received code successfully:', code);
    console.log('State parameter:', state);
    
    const successUrl = `${baseUrl}?auth=success&code=${encodeURIComponent(code as string)}`;
    
    console.log('Redirecting to success URL:', successUrl);
    res.redirect(successUrl);

  } catch (error) {
    console.error('Yahoo OAuth 2.0 callback error:', error);
    const errorBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://fantasy-football-app-psi.vercel.app' 
      : 'http://localhost:5000';
    res.redirect(`${errorBaseUrl}?auth=error&error=callback_error`);
  }
}
