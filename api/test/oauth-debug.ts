import { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth } from 'oauth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== OAuth Debug Test ===');
    
    // Check environment variables
    const envCheck = {
      YAHOO_CLIENT_ID: process.env.YAHOO_CLIENT_ID ? `${process.env.YAHOO_CLIENT_ID.substring(0, 10)}...` : 'MISSING',
      YAHOO_CLIENT_SECRET: process.env.YAHOO_CLIENT_SECRET ? 'SET' : 'MISSING',
      YAHOO_REDIRECT_URI: process.env.YAHOO_REDIRECT_URI || 'MISSING'
    };
    
    console.log('Environment variables:', envCheck);
    
    // Test OAuth library initialization
    const oauth = new OAuth(
      'https://api.login.yahoo.com/oauth/v2/get_request_token',
      'https://api.login.yahoo.com/oauth/v2/get_token',
      process.env.YAHOO_CLIENT_ID!,
      process.env.YAHOO_CLIENT_SECRET!,
      '1.0A',
      process.env.YAHOO_REDIRECT_URI!,
      'HMAC-SHA1'
    );
    
    console.log('OAuth library initialized successfully');
    
    // Test the simplest possible request token call
    const result = await new Promise((resolve, reject) => {
      // Try without any callback first
      oauth.getOAuthRequestToken((error, requestToken, requestSecret) => {
        if (error) {
          console.error('Basic OAuth request failed:', error);
          console.error('Error details:', {
            data: (error as any).data,
            statusCode: (error as any).statusCode,
            message: (error as any).message
          });
          reject(error);
          return;
        }
        console.log('Basic OAuth request succeeded:', { requestToken, requestSecret });
        resolve({ requestToken, requestSecret });
      });
    });
    
    res.json({
      success: true,
      environment: envCheck,
      oauth: result
    });
    
  } catch (error) {
    console.error('OAuth debug test failed:', error);
    res.status(500).json({
      error: 'OAuth debug test failed',
      details: {
        message: (error as any).message,
        data: (error as any).data,
        statusCode: (error as any).statusCode
      }
    });
  }
}
