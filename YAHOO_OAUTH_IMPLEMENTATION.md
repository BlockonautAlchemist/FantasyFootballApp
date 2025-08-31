# Yahoo OAuth Implementation - Complete

This document outlines the complete Yahoo OAuth 2.0 implementation with OpenID Connect support.

## Environment Variables Required

Create a `.env` file with the following variables:

```env
YAHOO_CLIENT_ID=your_yahoo_client_id_here
YAHOO_CLIENT_SECRET=your_yahoo_client_secret_here
YAHOO_REDIRECT_URI=https://fantasy-football-app-psi.vercel.app/api/auth/yahoo/callback
YAHOO_REQUESTED_SCOPES=fspt-r fspt-w openid email profile
```

## API Endpoints

### 1. `/api/auth/yahoo/authorize` - OAuth Authorization

**Purpose**: Initiates the OAuth flow by generating authorization URL with proper state and nonce handling.

**Features**:
- Generates 16-hex state parameter for CSRF protection
- Generates 16-hex nonce when OpenID Connect scopes are requested
- Sets secure HTTP-only cookies for state and nonce
- Uses URLSearchParams for proper URL encoding
- Supports custom scope via query parameter

**Response**:
```json
{
  "authorizeUrl": "https://api.login.yahoo.com/oauth2/request_auth?...",
  "echo": {
    "clientIdLast6": "abc123",
    "redirectUri": "https://fantasy-football-app-psi.vercel.app/api/auth/yahoo/callback",
    "scope": "fspt-r fspt-w openid email profile",
    "hasNonce": true
  }
}
```

### 2. `/api/auth/yahoo/callback` - OAuth Callback

**Purpose**: Handles the OAuth callback, verifies state, and exchanges authorization code for tokens.

**Features**:
- Validates state parameter against stored cookie
- Checks for nonce cookie when OpenID Connect is used
- Exchanges authorization code for access/refresh tokens
- Sets secure HTTP-only cookies for tokens
- Clears temporary state and nonce cookies
- Redirects to `/connect?connected=1` on success

**Security**:
- State verification prevents CSRF attacks
- Nonce validation for OpenID Connect compliance
- Secure cookie settings (HttpOnly, Secure, SameSite=Lax)

### 3. `/api/auth/yahoo/refresh` - Token Refresh

**Purpose**: Refreshes expired access tokens using the refresh token.

**Features**:
- Reads refresh token from secure cookie
- Exchanges refresh token for new access token
- Updates access token cookie
- Handles refresh token rotation if provided

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "expires_in": 3600
}
```

### 4. `/api/yahoo/me` - Test Endpoint

**Purpose**: Tests the Yahoo Fantasy API connection using the stored access token.

**Features**:
- Reads access token from secure cookie
- Makes authenticated request to Yahoo Fantasy API
- Returns user information or appropriate error

**Response**:
```json
{
  "success": true,
  "message": "Successfully connected to Yahoo Fantasy API",
  "user": {
    // Yahoo Fantasy API user data
  }
}
```

### 5. `/api/auth/yahoo/params` - Environment Verification

**Purpose**: Verifies environment variable configuration without exposing sensitive data.

**Response**:
```json
{
  "envClientIdLast6": "abc123",
  "hasSecret": true,
  "envRedirect": "https://fantasy-football-app-psi.vercel.app/api/auth/yahoo/callback",
  "requestedScopes": "fspt-r fspt-w openid email profile",
  "hasOpenId": true,
  "allRequiredVarsPresent": true
}
```

## Frontend Integration

### Connect with Yahoo Button

```javascript
// 1. Call authorize endpoint
const response = await fetch('/api/auth/yahoo/authorize');
const { authorizeUrl } = await response.json();

// 2. Open authorization URL
window.location.href = authorizeUrl;

// 3. After redirect back, test connection
const testResponse = await fetch('/api/yahoo/me');
const userData = await testResponse.json();
console.log('Connected user:', userData);
```

## Security Features

1. **State Parameter**: 16-hex random string prevents CSRF attacks
2. **Nonce Parameter**: 16-hex random string for OpenID Connect compliance
3. **Secure Cookies**: HttpOnly, Secure, SameSite=Lax settings
4. **Basic Authentication**: Uses client_id:client_secret for token exchange
5. **Exact Redirect URI**: Must match exactly in all requests
6. **Token Expiration**: Access tokens expire, refresh tokens rotate

## Cookie Management

- `yahoo_state`: Temporary state for CSRF protection (5 minutes)
- `yahoo_nonce`: Temporary nonce for OpenID Connect (5 minutes)
- `yahoo_access`: Access token (expires based on Yahoo response)
- `yahoo_refresh`: Refresh token (30 days)

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- `400`: Bad Request (invalid parameters, OAuth errors)
- `401`: Unauthorized (missing/invalid tokens)
- `500`: Internal Server Error (API failures)

## Testing the Implementation

1. **Verify Environment**: `GET /api/auth/yahoo/params`
2. **Start OAuth Flow**: `GET /api/auth/yahoo/authorize`
3. **Complete OAuth**: User authorizes and gets redirected to callback
4. **Test Connection**: `GET /api/yahoo/me`
5. **Refresh Token**: `GET /api/auth/yahoo/refresh` (when needed)

## Yahoo App Configuration

Ensure your Yahoo app is configured with:
- **Redirect URI**: `https://fantasy-football-app-psi.vercel.app/api/auth/yahoo/callback`
- **Scopes**: `fspt-r fspt-w openid email profile`
- **OAuth 2.0**: Enabled

## Notes

- The `redirect_uri` must be EXACTLY identical in Yahoo app settings, authorize URL, and token/refresh calls
- Basic authentication is used for token and refresh requests
- Nonce is included when requesting any OpenID Connect scopes
- All sensitive data is stored in secure HTTP-only cookies
- Environment variables should be stored in `.env` file (not in code) [[memory:7023297]]
