import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Step 1: Extract query parameters from the OAuth callback
  // This verifies that Yahoo is properly redirecting to our callback URL
  const { code, state, error, error_description } = req.query;
  
  // Step 2: Handle OAuth errors (user denied access, invalid request, etc.)
  // This proves we can handle OAuth error responses from Yahoo
  if (error) {
    return res.status(400).json({
      receivedCode: false,
      error: error,
      error_description: error_description || null
    });
  }

  // Step 3: Handle successful authorization code
  // This proves the OAuth flow completed successfully and we received a valid code
  if (code) {
    // Step 4: Return diagnostic information without logging the actual code
    // This verifies code reception while maintaining security
    return res.status(200).json({
      receivedCode: true,
      codeLen: (code as string).length,
      state: state || null
    });
  }

  // Step 5: Handle case where neither code nor error is present
  // This indicates an invalid callback request
  return res.status(400).json({
    receivedCode: false,
    error: 'invalid_callback',
    error_description: 'No authorization code or error received'
  });
}
