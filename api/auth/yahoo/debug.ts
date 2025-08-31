import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const id = !!process.env.YAHOO_CLIENT_ID;
  const secret = !!process.env.YAHOO_CLIENT_SECRET;
  const redirect = process.env.YAHOO_REDIRECT_URI || "";
  res.status(200).json({
    hasClientId: id,
    hasClientSecret: secret,
    redirectFromEnv: redirect,
    nodeEnv: process.env.NODE_ENV || "unknown"
  });
}
