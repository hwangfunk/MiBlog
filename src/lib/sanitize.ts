import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "pre",
  "code",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "span",
  "div",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel", "class"];

const ALLOWED_CLASS_PATTERNS = [
  /^ql-align-(center|right|justify)$/,
  /^ql-direction-rtl$/,
  /^ql-indent-[1-8]$/,
  /^ql-size-(small|large|huge)$/,
];

let hooksConfigured = false;

function isAllowedClass(token: string) {
  return ALLOWED_CLASS_PATTERNS.some((pattern) => pattern.test(token));
}

function isAllowedHref(value: string) {
  return /^(https?:|mailto:|tel:|\/|#)/i.test(value);
}

function isAllowedSrc(value: string) {
  return /^(https?:|\/)/i.test(value);
}

function ensureHooksConfigured() {
  if (hooksConfigured) {
    return;
  }

  DOMPurify.addHook("uponSanitizeAttribute", (_, data) => {
    if (data.attrName === "class") {
      const safeClassName = data.attrValue
        .split(/\s+/)
        .filter(Boolean)
        .filter(isAllowedClass)
        .join(" ");

      data.attrValue = safeClassName;
      data.keepAttr = safeClassName.length > 0;
      return;
    }

    if (data.attrName === "href") {
      data.keepAttr = isAllowedHref(data.attrValue.trim());
      return;
    }

    if (data.attrName === "src") {
      data.keepAttr = isAllowedSrc(data.attrValue.trim());
      return;
    }

    if (data.attrName === "target") {
      data.keepAttr = ["_blank", "_self"].includes(data.attrValue);
      return;
    }

    if (data.attrName === "rel") {
      data.attrValue = data.attrValue.replace(/[^\w\s-]/g, " ").trim();
      data.keepAttr = data.attrValue.length > 0;
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if ("tagName" in node && node.tagName === "A") {
      const anchor = node as HTMLAnchorElement;
      if (anchor.getAttribute("target") === "_blank") {
        anchor.setAttribute("rel", "noopener noreferrer");
      }
    }
  });

  hooksConfigured = true;
}

function sanitizeToHtml(html: string) {
  ensureHooksConfigured();

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "option",
      "link",
      "meta",
      "base",
      "svg",
      "math",
    ],
    FORBID_ATTR: ["style"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });

  // Quill editor stores all spaces as &nbsp; entities. These are not valid word-break
  // opportunities, so text like "word1&nbsp;word2&nbsp;..." becomes a single unbreakable
  // string causing horizontal overflow or mid-word breaks. Replace both the HTML entity
  // and the U+00A0 character with regular spaces for proper word wrapping.
  return clean.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ");
}

export function sanitizeHtml(dirtyHtml: string) {
  return sanitizeToHtml(dirtyHtml);
}

export function htmlToPlainText(html: string, maxLength = 160) {
  ensureHooksConfigured();

  const fragment = DOMPurify.sanitize(sanitizeToHtml(html), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    RETURN_DOM_FRAGMENT: true,
  }) as DocumentFragment;

  const normalized = (fragment.textContent ?? "").replace(/\s+/g, " ").trim();

  return normalized.slice(0, maxLength);
}
