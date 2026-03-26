import "server-only";

import { htmlToPlainText, sanitizeHtml } from "@/lib/sanitize";

export function sanitizeHtmlForRender(html: string) {
  return sanitizeHtml(html);
}

export function htmlToPlainTextForMetadata(html: string, maxLength = 160) {
  return htmlToPlainText(html, maxLength);
}
