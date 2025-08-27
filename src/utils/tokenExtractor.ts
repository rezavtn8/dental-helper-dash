/**
 * Utility to extract invitation tokens from various URL formats
 * Supports both query parameters and path parameters for backward compatibility
 */

export interface TokenExtractionResult {
  token: string | null;
  source: 'query' | 'path' | 'none';
}

/**
 * Extract token from URL search parameters or path parameters
 * Priority: query parameter > path parameter
 */
export const extractInvitationToken = (
  searchParams: URLSearchParams, 
  pathParams: Record<string, string | undefined>
): TokenExtractionResult => {
  // Primary: query parameter ?token=...
  const queryToken = searchParams.get('token');
  if (queryToken) {
    return { token: queryToken, source: 'query' };
  }
  
  // Fallback: path parameter /accept-invitation/:token
  const pathToken = pathParams.token;
  if (pathToken) {
    return { token: pathToken, source: 'path' };
  }
  
  return { token: null, source: 'none' };
};

/**
 * Normalize token from legacy URL formats if needed
 * This function can be extended to handle any legacy token formats
 */
export const normalizeToken = (token: string | null): string | null => {
  if (!token) return null;
  
  // Remove any whitespace or special characters that might be added by email clients
  const normalized = token.trim();
  
  // Basic validation - tokens should be base64-like strings
  if (normalized.length === 0) return null;
  
  return normalized;
};

/**
 * Complete token extraction and normalization pipeline
 */
export const getInvitationToken = (
  searchParams: URLSearchParams, 
  pathParams: Record<string, string | undefined>
): string | null => {
  const { token } = extractInvitationToken(searchParams, pathParams);
  return normalizeToken(token);
};