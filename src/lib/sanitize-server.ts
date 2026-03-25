import "server-only";

import { htmlToPlainText, sanitizeHtml } from "@/lib/sanitize";

export async function sanitizeHtmlForRender(html: string) {
  "use cache";

  return sanitizeHtml(html);
}

export async function htmlToPlainTextForMetadata(html: string, maxLength = 160) {
  "use cache";

  return htmlToPlainText(html, maxLength);
}
