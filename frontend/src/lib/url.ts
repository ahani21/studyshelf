import normalizeUrl from 'normalize-url';

/**
 * Normalizes a URL by stripping tracking parameters, trailing slashes,
 * and authentication credentials. Used to enforce uniqueness constraints.
 */
export function cleanUrl(url: string): string {
  try {
    return normalizeUrl(url, {
      stripAuthentication: true,
      removeTrailingSlash: true,
      removeQueryParameters: [
        'utm_source', 
        'utm_medium', 
        'utm_campaign', 
        'utm_term', 
        'utm_content', 
        'fbclid', 
        'gclid', 
        'ref'
      ]
    });
  } catch (e) {
    // If it's a completely invalid URL structure, just return the raw string
    return url;
  }
}
