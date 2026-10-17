export function validateImageUrl(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Image URL must be a string');
  const url = new URL(value.trim());
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an HTTP or HTTPS image URL');
  return url.toString();
}
