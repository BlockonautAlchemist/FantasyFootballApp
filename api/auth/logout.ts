import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Clear all Yahoo-related cookies
  res.setHeader('Set-Cookie', [
    'yahoo_access=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0',
    'yahoo_refresh=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0',
    'yahoo_state=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0',
    'yahoo_nonce=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0'
  ]);

  return res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
}
