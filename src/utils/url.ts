export function normalizeExternalUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  let trimmed = url.trim();
  if (!trimmed) return null;

  // Preserve mailto and tel explicitly
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) return trimmed;

  // Add https:// if no protocol is specified (e.g., www.google.com)
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    // Only allow http and https for standard links
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}