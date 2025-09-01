// Cookie utilities for secure league key storage

/**
 * Set a secure HTTP-only cookie
 * Note: This is a client-side utility for reference.
 * In practice, cookies should be set server-side for security.
 */
export function setSecureCookie(
  name: string, 
  value: string, 
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
    maxAge?: number;
  } = {}
): void {
  const {
    httpOnly = true,
    secure = true,
    sameSite = 'lax',
    path = '/',
    maxAge = 60 * 60 * 24 * 365 // 1 year default
  } = options;

  // Note: In a real implementation, this would be done server-side
  // This is just for reference/documentation
  const cookieString = [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    `Path=${path}`,
    `SameSite=${sameSite}`,
    ...(secure ? ['Secure'] : []),
    ...(httpOnly ? ['HttpOnly'] : [])
  ].join('; ');

  // This won't work for HttpOnly cookies from client-side
  // but shows the format for server-side implementation
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Delete a cookie by setting it to expire
 */
export function deleteCookie(name: string, path: string = '/'): void {
  document.cookie = `${name}=; Max-Age=0; Path=${path}`;
}

/**
 * Cookie configuration for Yahoo league key
 */
export const YAHOO_LEAGUE_COOKIE_CONFIG = {
  name: 'yahoo_league_key',
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  }
} as const;
