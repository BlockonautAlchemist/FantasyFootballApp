import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Step 1: Verify this is a POST request with proper content type
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Step 2: Extract authorization code from request body
  const { code, state } = req.body;
  
  if (!code) {
    return res.status(400).json({ 
      error: 'Authorization code is required',
      receivedCode: false
    });
  }

  // Step 3: Verify all required environment variables are present
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  const redirectUri = process.env.YAHOO_REDIRECT_URI;
  
  const missingVars = [];
  if (!clientId) missingVars.push('YAHOO_CLIENT_ID');
  if (!clientSecret) missingVars.push('YAHOO_CLIENT_SECRET');
  if (!redirectUri) missingVars.push('YAHOO_REDIRECT_URI');
  
  if (missingVars.length > 0) {
    return res.status(500).json({
      error: 'Missing required environment variables',
      missingVariables: missingVars,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasRedirectUri: !!redirectUri
    });
  }

  try {
    // Step 4: Exchange authorization code for access token using HTTP Basic auth
    // This verifies that the OAuth flow can complete successfully
    const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
    
    // Create HTTP Basic auth header with client_id:client_secret
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    console.log('Exchanging code for token:', {
      codeLength: code.length,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri: redirectUri
    });
    
    const response = await fetch(YAHOO_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${credentials}`,
        'User-Agent': 'FantasyFootballApp/1.0'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    console.log('Token exchange response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', response.status, errorText);
      
      return res.status(400).json({
        error: 'Token exchange failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        receivedCode: true,
        codeLength: code.length
      });
    }

    const tokenData = await response.json();
    
    // Step 5: Return success response with token information (without exposing sensitive data)
    res.status(200).json({
      success: true,
      receivedCode: true,
      codeLength: code.length,
      state: state || null,
      tokenInfo: {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        scope: tokenData.scope
      },
      message: 'OAuth flow completed successfully. Access token obtained.'
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    
    return res.status(500).json({
      error: 'Internal server error during token exchange',
      details: error instanceof Error ? error.message : 'Unknown error',
      receivedCode: true,
      codeLength: code.length
    });
  }
}
