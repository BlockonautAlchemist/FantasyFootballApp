import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Check environment variable configuration
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  const redirectUri = process.env.YAHOO_REDIRECT_URI;
  const requestedScopes = process.env.YAHOO_REQUESTED_SCOPES;

  // Return diagnostic information without exposing sensitive data
  res.status(200).json({
    envClientIdLast6: clientId ? clientId.slice(-6) : "",
    hasSecret: !!clientSecret,
    envRedirect: redirectUri || "",
    requestedScopes: requestedScopes || "fspt-r",
    hasOpenId: requestedScopes?.includes('openid') || false,
    allRequiredVarsPresent: !!(clientId && clientSecret && redirectUri)
  });
}
