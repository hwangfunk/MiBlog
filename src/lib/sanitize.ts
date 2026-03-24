import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'strong', 'em', 'u', 's',
  'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'a', 'img', 'span', 'div',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'class', 'target', 'rel'];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS, ALLOWED_ATTR });
}

/** Strip HTML tags and return plain text, truncated to maxLength. Shared helper for metadata, excerpts, listings. */
export function htmlToPlainText(html: string, maxLength = 160): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}
