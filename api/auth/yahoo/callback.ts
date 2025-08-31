import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Step 1: Extract query parameters from the OAuth callback
  const { code, state, error, error_description } = req.query;
  
  // Step 2: Handle OAuth errors (user denied access, invalid request, etc.)
  if (error) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Yahoo OAuth Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 4px; }
            .info { color: #1976d2; background: #e3f2fd; padding: 20px; border-radius: 4px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Yahoo OAuth Error</h1>
          <div class="error">
            <h3>Error: ${error}</h3>
            ${error_description ? `<p><strong>Description:</strong> ${error_description}</p>` : ''}
          </div>
          <div class="info">
            <h3>Debug Information</h3>
            <p><strong>Error Code:</strong> ${error}</p>
            ${error_description ? `<p><strong>Error Description:</strong> ${error_description}</p>` : ''}
            <p><strong>State:</strong> ${state || 'Not provided'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
        </body>
      </html>
    `;
    
    return res.status(400).send(errorHtml);
  }

  // Step 3: Handle successful authorization code
  if (code) {
    // Step 4: Verify we have the required environment variables for token exchange
    const clientId = process.env.YAHOO_CLIENT_ID;
    const clientSecret = process.env.YAHOO_CLIENT_SECRET;
    const redirectUri = process.env.YAHOO_REDIRECT_URI;
    
    const missingVars = [];
    if (!clientId) missingVars.push('YAHOO_CLIENT_ID');
    if (!clientSecret) missingVars.push('YAHOO_CLIENT_SECRET');
    if (!redirectUri) missingVars.push('YAHOO_REDIRECT_URI');
    
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Yahoo OAuth Success</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .success { color: #2e7d32; background: #e8f5e8; padding: 20px; border-radius: 4px; }
            .warning { color: #f57c00; background: #fff3e0; padding: 20px; border-radius: 4px; margin-top: 20px; }
            .info { color: #1976d2; background: #e3f2fd; padding: 20px; border-radius: 4px; margin-top: 20px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>Yahoo OAuth Authorization Code Received</h1>
          <div class="success">
            <h3>✅ Authorization Successful</h3>
            <p>Yahoo has returned an authorization code. This verifies that:</p>
            <ul>
              <li>Your OAuth app is properly configured</li>
              <li>The redirect URI matches what's registered with Yahoo</li>
              <li>The user successfully authorized your application</li>
            </ul>
          </div>
          
          ${missingVars.length > 0 ? `
          <div class="warning">
            <h3>⚠️ Missing Environment Variables</h3>
            <p>The following environment variables are missing and will prevent token exchange:</p>
            <ul>
              ${missingVars.map(v => `<li><code>${v}</code></li>`).join('')}
            </ul>
          </div>
          ` : ''}
          
          <div class="info">
            <h3>Debug Information</h3>
            <p><strong>Code Length:</strong> ${(code as string).length} characters</p>
            <p><strong>State:</strong> ${state || 'Not provided'}</p>
            <p><strong>Redirect URI:</strong> ${redirectUri || 'Not configured'}</p>
            <p><strong>Client ID:</strong> ${clientId ? `${clientId.substring(0, 8)}...` : 'Not configured'}</p>
            <p><strong>Has Client Secret:</strong> ${clientSecret ? 'Yes' : 'No'}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          
          <div class="info">
            <h3>Next Steps</h3>
            <p>To complete the OAuth flow, you need to exchange this authorization code for an access token.</p>
            <p>Use the following endpoint to exchange the code:</p>
            <pre>POST /api/auth/yahoo/exchange-token
{
  "code": "${code}",
  "state": "${state || ''}"
}</pre>
          </div>
        </body>
      </html>
    `;
    
    return res.status(200).send(successHtml);
  }

  // Step 5: Handle case where neither code nor error is present
  const errorHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Yahoo OAuth Callback Error</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .error { color: #d32f2f; background: #ffebee; padding: 20px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Invalid OAuth Callback</h1>
        <div class="error">
          <h3>No authorization code or error received</h3>
          <p>This callback URL should only be accessed by Yahoo's OAuth service.</p>
          <p><strong>Query Parameters:</strong> ${JSON.stringify(req.query, null, 2)}</p>
        </div>
      </body>
    </html>
  `;
  
  return res.status(400).send(errorHtml);
}
