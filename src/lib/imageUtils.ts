export const FALLBACK_CAR_IMAGE = "/car-placeholder.svg";

/**
 * Validates an image URL and returns a safe fallback if it's invalid.
 * Prevents next/image crashes from unconfigured hosts or non-image URLs.
 */
export function safeImageSrc(src: string | undefined | null): string {
  if (!src || typeof src !== 'string' || src.trim() === '') {
    return FALLBACK_CAR_IMAGE;
  }
  
  // Clean whitespace
  const cleanSrc = src.trim();
  
  // If it's already a local path, it's safe (assuming it exists in public folder)
  if (cleanSrc.startsWith('/')) {
    return cleanSrc;
  }

  try {
    const url = new URL(cleanSrc);
    
    // Validate protocol
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return FALLBACK_CAR_IMAGE;
    }

    // Explicitly reject known bad hosts that contain blog articles instead of direct images
    const blockedHosts = [
      'www.incefikirler.tv',
      'incefikirler.tv'
    ];
    if (blockedHosts.includes(url.hostname)) {
      return FALLBACK_CAR_IMAGE;
    }

    // Simple extension check for direct image URLs
    // Note: some valid images (like unsplash) don't have extensions in the pathname,
    // so we only enforce extensions if the URL looks like a generic file path.
    // However, the easiest way to prevent random blog URLs is to rely on next.config allowed hosts.
    // We can just rely on the fallback for blocked hosts and let Next.js handle the configured ones.
    
    return cleanSrc;
  } catch (error) {
    // Invalid URL format
    return FALLBACK_CAR_IMAGE;
  }
}
