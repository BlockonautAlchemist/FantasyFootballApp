import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Read access token from cookie
  const accessToken = req.cookies.yahoo_access;
  
  if (!accessToken) {
    return res.status(401).json({
      error: 'no_access_token',
      error_description: 'No access token found in cookies. Please authenticate first.'
    });
  }

  try {
    // Make request to Yahoo Fantasy API to get user info
    const response = await fetch('https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'FantasyFootballApp/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({
          error: 'invalid_token',
          error_description: 'Access token is invalid or expired. Please re-authenticate.'
        });
      }
      
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'yahoo_api_error',
        error_description: errorText
      });
    }

    const userData = await response.json();
    
    return res.status(200).json({
      success: true,
      message: 'Successfully connected to Yahoo Fantasy API',
      user: userData
    });

  } catch (error) {
    console.error('Yahoo API error:', error);
    return res.status(500).json({
      error: 'internal_error',
      error_description: 'Failed to connect to Yahoo API'
    });
  }
}
