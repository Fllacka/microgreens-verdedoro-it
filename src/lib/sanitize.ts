import DOMPurify from "dompurify";

/**
 * Sanitize rich text HTML content to prevent XSS attacks
 * while preserving allowed formatting tags from the rich text editor.
 */
export const sanitizeRichTextHtml = (html: string): string => {
  if (!html) return "";

  // First clean up non-breaking space artifacts
  const withoutLiteral = html.replace(/\\00a0/g, "");
  const cleaned = withoutLiteral.replace(/<p>\s*(?:&nbsp;|\u00a0)\s*<\/p>/g, "<p></p>");

  // Sanitize with DOMPurify allowing only safe rich text tags
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "del",
      "a", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "img", "blockquote", "code", "pre",
      "span", "div", "sub", "sup", "hr",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "title", "width", "height",
      "class", "style",
    ],
    ALLOW_DATA_ATTR: false,
  });
};
