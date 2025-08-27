import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Manual OAuth 1.0a implementation for Yahoo
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function generateSignature(
  method: string,
  url: string,
  parameters: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ''
): string {
  // Sort parameters
  const sortedParams = Object.keys(parameters)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(parameters[key])}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams)
  ].join('&');

  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  // Generate signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  return signature;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Manual Yahoo OAuth 1.0a Implementation ===');
    
    const consumerKey = process.env.YAHOO_CLIENT_ID!;
    const consumerSecret = process.env.YAHOO_CLIENT_SECRET!;
    const callbackUrl = process.env.YAHOO_REDIRECT_URI!;
    
    console.log('OAuth parameters:', {
      consumerKey: consumerKey ? `${consumerKey.substring(0, 10)}...` : 'MISSING',
      consumerSecret: consumerSecret ? 'SET' : 'MISSING',
      callbackUrl
    });

    // OAuth 1.0a parameters
    const oauthParams = {
      oauth_callback: callbackUrl,
      oauth_consumer_key: consumerKey,
      oauth_nonce: generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: generateTimestamp(),
      oauth_version: '1.0'
    };

    console.log('Generated OAuth params:', oauthParams);

    // Generate signature
    const requestTokenUrl = 'https://api.login.yahoo.com/oauth/v2/get_request_token';
    const signature = generateSignature('POST', requestTokenUrl, oauthParams, consumerSecret);
    
    oauthParams['oauth_signature'] = signature;

    // Build authorization header
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
      .join(', ');

    console.log('Authorization header:', authHeader);

    // Make request to Yahoo
    const response = await fetch(requestTokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Yahoo response status:', response.status);
    console.log('Yahoo response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Yahoo response body:', responseText);

    if (!response.ok) {
      throw new Error(`Yahoo OAuth request failed: ${response.status} - ${responseText}`);
    }

    // Parse response
    const params = new URLSearchParams(responseText);
    const requestToken = params.get('oauth_token');
    const requestSecret = params.get('oauth_token_secret');
    const callbackConfirmed = params.get('oauth_callback_confirmed');

    if (!requestToken || !requestSecret) {
      throw new Error(`Invalid response from Yahoo: ${responseText}`);
    }

    console.log('Successfully obtained tokens:', {
      requestToken,
      requestSecret,
      callbackConfirmed
    });

    // Store request secret for later use
    const state = Buffer.from(JSON.stringify({ requestSecret })).toString('base64');
    
    // Build authorization URL
    const authUrl = `https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=${requestToken}&state=${state}`;
    
    console.log('Generated auth URL:', authUrl);
    
    res.json({ authUrl });

  } catch (error) {
    console.error('Manual OAuth error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate Yahoo authentication',
      details: error.message
    });
  }
}
