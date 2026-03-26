const ALLOWED_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "blockquote", "pre", "code",
  "ul", "ol", "li",
  "a", "img", "span", "div",
]);

const ALLOWED_ATTR = new Set(["href", "src", "alt", "title", "class", "target", "rel"]);
const VOID_TAGS = new Set(["br", "img"]);
const BLOCKED_TAG_BLOCKS =
  /<(script|style|iframe|object|embed|form|textarea|select|svg|math)\b[^>]*>[\s\S]*?<\/\1>/gi;
const BLOCKED_TAGS =
  /<\/?(?:script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|svg|math)\b[^>]*>/gi;
const COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const TAG_PATTERN = /<(\/?)([a-z0-9-]+)([^>]*)>/gi;
const ATTR_PATTERN = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gi;

const ALLOWED_CLASS_PATTERNS = [
  /^ql-align-(center|right|justify)$/,
  /^ql-direction-rtl$/,
  /^ql-indent-[1-8]$/,
  /^ql-size-(small|large|huge)$/,
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeClassName(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => ALLOWED_CLASS_PATTERNS.some((p) => p.test(token)))
    .join(" ");
}

function sanitizeTarget(value: string) {
  return ["_blank", "_self"].includes(value) ? value : null;
}

function sanitizeUrl(value: string, attrName: "href" | "src") {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = trimmed.replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
  if (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("data:text/html") ||
    normalized.startsWith("data:application")
  ) {
    return null;
  }

  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("mailto:") ||
    normalized.startsWith("tel:") ||
    normalized.startsWith("/") ||
    normalized.startsWith("#")
  ) {
    return trimmed;
  }

  if (attrName === "src" && normalized.startsWith("data:image/")) {
    return trimmed;
  }

  return null;
}

function sanitizeAttribute(tagName: string, attrName: string, attrValue: string) {
  if (!ALLOWED_ATTR.has(attrName)) return null;

  if (attrName === "href" || attrName === "src") {
    return sanitizeUrl(attrValue, attrName);
  }

  if (attrName === "class") {
    const className = sanitizeClassName(attrValue);
    return className || null;
  }

  if (attrName === "target") {
    return tagName === "a" ? sanitizeTarget(attrValue) : null;
  }

  if (attrName === "rel") {
    return tagName === "a" ? attrValue.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim() || null : null;
  }

  return attrValue.trim() || null;
}

function rebuildTag(_match: string, slash: string, rawTagName: string, rawAttrs: string) {
  const tagName = rawTagName.toLowerCase();
  if (!ALLOWED_TAGS.has(tagName)) {
    return "";
  }

  if (slash) {
    return VOID_TAGS.has(tagName) ? "" : `</${tagName}>`;
  }

  const attrs = new Map<string, string>();
  let attrMatch: RegExpExecArray | null;

  while ((attrMatch = ATTR_PATTERN.exec(rawAttrs)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    if (attrName.startsWith("on") || attrName === "style" || attrName === "srcdoc") {
      continue;
    }

    const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";
    const sanitizedValue = sanitizeAttribute(tagName, attrName, attrValue);
    if (sanitizedValue !== null) {
      attrs.set(attrName, sanitizedValue);
    }
  }

  if (tagName === "a") {
    const target = attrs.get("target");
    if (target === "_blank") {
      attrs.set("rel", "noopener noreferrer");
    } else if (!attrs.has("href")) {
      attrs.delete("target");
      attrs.delete("rel");
    }
  }

  if (tagName === "img" && !attrs.has("src")) {
    return "";
  }

  const serializedAttrs = [...attrs.entries()]
    .map(([name, value]) => `${name}="${escapeHtml(value)}"`)
    .join(" ");

  return `<${tagName}${serializedAttrs ? ` ${serializedAttrs}` : ""}>`;
}

export function sanitizeHtml(dirty: string): string {
  // Quill stores spaces as &nbsp; which prevents word wrapping
  return dirty
    .replace(COMMENT_PATTERN, "")
    .replace(BLOCKED_TAG_BLOCKS, "")
    .replace(BLOCKED_TAGS, "")
    .replace(TAG_PATTERN, rebuildTag)
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ");
}

export function htmlToPlainText(html: string, maxLength = 160): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
