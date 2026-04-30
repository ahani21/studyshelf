export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
}

/**
 * Fetches and parses OpenGraph metadata from a given URL.
 * Implements a strict 4-second timeout to prevent blocking the UI.
 */
export async function fetchMetadata(url: string): Promise<OpenGraphData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'StudyShelfBot/1.0',
        'Accept': 'text/html'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) return {};

    const html = await response.text();
    
    // Fast regex extraction to avoid loading a heavy DOM parser in the edge/serverless runtime
    const getMeta = (property: string) => {
      const match = html.match(new RegExp(`<meta(?:\\s+[^>]*?)?(?:property|name)=['"]${property}['"](?:\\s+[^>]*?)?content=['"]([^'"]*?)['"]`, 'i')) ||
                    html.match(new RegExp(`<meta(?:\\s+[^>]*?)?content=['"]([^'"]*?)['"](?:\\s+[^>]*?)?(?:property|name)=['"]${property}['"]`, 'i'));
      return match ? match[1] : undefined;
    };

    const ogTitle = getMeta('og:title') || getMeta('twitter:title');
    const ogDescription = getMeta('og:description') || getMeta('twitter:description') || getMeta('description');
    const ogImage = getMeta('og:image') || getMeta('twitter:image');

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = ogTitle || (titleMatch ? titleMatch[1].trim() : undefined);

    return {
      title: title ? unescapeHtml(title) : undefined,
      description: ogDescription ? unescapeHtml(ogDescription) : undefined,
      image: ogImage
    };
  } catch (e) {
    console.error(`Failed to fetch metadata for ${url}`, e);
    return {};
  }
}

// Simple unescape for common HTML entities found in titles
function unescapeHtml(safe: string) {
    return safe
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
}
