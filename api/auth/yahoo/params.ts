import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Step 1: Check environment variable configuration
  // This verifies that all required OAuth environment variables are properly set
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  const redirectUri = process.env.YAHOO_REDIRECT_URI;

  // Step 2: Return diagnostic information without exposing sensitive data
  // This allows verification of environment setup without security risks
  res.status(200).json({
    envClientIdLast6: clientId ? clientId.slice(-6) : "", // Last 6 chars for verification without exposing full ID
    hasSecret: !!clientSecret, // Boolean check without exposing the actual secret
    envRedirect: redirectUri || "" // Full redirect URI is safe to show as it's not secret
  });
}
