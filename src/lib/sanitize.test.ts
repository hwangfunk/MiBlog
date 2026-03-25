import { describe, expect, it } from "vitest";
import { htmlToPlainText, sanitizeHtml } from "@/lib/sanitize";

describe("sanitizeHtml", () => {
  it("removes scripts and javascript URLs", () => {
    const dirty =
      '<p>Hello</p><script>alert(1)</script><a href="javascript:alert(1)">Click</a>';

    const clean = sanitizeHtml(dirty);

    expect(clean).toContain("<p>Hello</p>");
    expect(clean).not.toContain("<script>");
    expect(clean).not.toContain("javascript:");
  });

  it("removes disallowed classes but keeps allowed quill classes", () => {
    const dirty =
      '<p class="ql-align-center hacked"><span class="ql-size-large bad">Hello</span></p>';

    const clean = sanitizeHtml(dirty);

    expect(clean).toContain('class="ql-align-center"');
    expect(clean).toContain('class="ql-size-large"');
    expect(clean).not.toContain("hacked");
    expect(clean).not.toContain("bad");
  });
});

describe("htmlToPlainText", () => {
  it("derives plain text from sanitized HTML", () => {
    const text = htmlToPlainText("<p>Hello <strong>world</strong></p>");
    expect(text).toBe("Hello world");
  });
});
