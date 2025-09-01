// OAuth 1.0a implementation for Yahoo Fantasy Sports API
// Based on: https://developer.yahoo.com/fantasysports/guide/

import crypto from 'crypto';

export interface OAuthTokens {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_verifier?: string;
}

export interface OAuthConfig {
  consumer_key: string;
  consumer_secret: string;
  callback_url: string;
}

// Generate OAuth 1.0a signature
function generateSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumer_secret: string,
  token_secret: string = ''
): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  // Create signature base string
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams)
  ].join('&');

  // Create signing key
  const signingKey = `${encodeURIComponent(consumer_secret)}&${encodeURIComponent(token_secret)}`;

  // Generate HMAC-SHA1 signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  return signature;
}

// Generate OAuth parameters
function generateOAuthParams(
  consumer_key: string,
  callback_url?: string,
  oauth_token?: string,
  oauth_verifier?: string
): Record<string, string> {
  const params: Record<string, string> = {
    oauth_consumer_key: consumer_key,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0'
  };

  if (callback_url) {
    params.oauth_callback = callback_url;
  }

  if (oauth_token) {
    params.oauth_token = oauth_token;
  }

  if (oauth_verifier) {
    params.oauth_verifier = oauth_verifier;
  }

  return params;
}

// Get request token (Step 1 of OAuth flow)
export async function getRequestToken(config: OAuthConfig): Promise<OAuthTokens> {
  const url = 'https://api.login.yahoo.com/oauth/v2/get_request_token';
  const params = generateOAuthParams(config.consumer_key, config.callback_url);
  
  // Add signature
  params.oauth_signature = generateSignature('POST', url, params, config.consumer_secret);

  // Create Authorization header
  const authHeader = 'OAuth ' + Object.keys(params)
    .map(key => `${key}="${encodeURIComponent(params[key])}"`)
    .join(', ');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get request token: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const tokenData = new URLSearchParams(text);
  
  return {
    oauth_token: tokenData.get('oauth_token') || '',
    oauth_token_secret: tokenData.get('oauth_token_secret') || ''
  };
}

// Get access token (Step 3 of OAuth flow)
export async function getAccessToken(
  config: OAuthConfig,
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string
): Promise<OAuthTokens> {
  const url = 'https://api.login.yahoo.com/oauth/v2/get_token';
  const params = generateOAuthParams(config.consumer_key, undefined, oauth_token, oauth_verifier);
  
  // Add signature
  params.oauth_signature = generateSignature('POST', url, params, config.consumer_secret, oauth_token_secret);

  // Create Authorization header
  const authHeader = 'OAuth ' + Object.keys(params)
    .map(key => `${key}="${encodeURIComponent(params[key])}"`)
    .join(', ');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const tokenData = new URLSearchParams(text);
  
  return {
    oauth_token: tokenData.get('oauth_token') || '',
    oauth_token_secret: tokenData.get('oauth_token_secret') || ''
  };
}

// Make authenticated request to Yahoo API
export async function makeYahooRequest(
  url: string,
  consumer_key: string,
  consumer_secret: string,
  oauth_token: string,
  oauth_token_secret: string,
  method: string = 'GET'
): Promise<any> {
  const params = generateOAuthParams(consumer_key, undefined, oauth_token);
  
  // Add signature
  params.oauth_signature = generateSignature(method, url, params, consumer_secret, oauth_token_secret);

  // Create Authorization header
  const authHeader = 'OAuth ' + Object.keys(params)
    .map(key => `${key}="${encodeURIComponent(params[key])}"`)
    .join(', ');

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Yahoo API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Generate authorization URL (Step 2 of OAuth flow)
export function getAuthorizationUrl(oauth_token: string): string {
  return `https://api.login.yahoo.com/oauth/v2/request_auth?oauth_token=${encodeURIComponent(oauth_token)}`;
}
