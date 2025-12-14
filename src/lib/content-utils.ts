/**
 * Utility functions for handling content format conversion and detection
 * Used for converting between plain text and HTML formats for Tiptap editor
 */

// Regex patterns defined at module scope for performance
const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;
const SCRIPT_TAG_PATTERN = /<script[\s\S]*?>[\s\S]*?<\/script>/i;
const EVENT_HANDLER_PATTERN = /on\w+\s*=\s*["'][\s\S]*?["']/i;
const IFRAME_NON_HTTP_PATTERN =
  /<iframe[\s\S]*?src\s*=\s*["'](?!https?:\/\/)[\s\S]*?["'][\s\S]*?>/i;
const HTML_STRIP_PATTERN = /<[^>]*>/g;
const LINE_BREAK_PATTERN = /\r?\n/;

/**
 * Detects if content is HTML format or plain text
 * @param content - The content string to check
 * @returns true if content appears to be HTML, false if plain text
 */
export const isHTML = (content: string): boolean => {
  if (!content || content.trim() === "") {
    return false;
  }

  // Check for common HTML tags
  return HTML_TAG_PATTERN.test(content);
};

/**
 * Converts plain text to HTML format with paragraph tags
 * Preserves line breaks by converting them to <br> tags
 * @param text - Plain text content
 * @returns HTML formatted string with paragraph tags
 */
export const convertPlainTextToHTML = (text: string): string => {
  if (!text || text.trim() === "") {
    return "<p></p>";
  }

  // If already HTML, return as is
  if (isHTML(text)) {
    return text;
  }

  // Split by line breaks and wrap each non-empty line in <p> tags
  const lines = text.split(LINE_BREAK_PATTERN);
  const paragraphs = lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => `<p>${escapeHTML(line)}</p>`)
    .join("");

  // If no paragraphs were created, return empty paragraph
  return paragraphs || "<p></p>";
};

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped HTML string
 */
const escapeHTML = (text: string): string => {
  if (typeof document === "undefined") {
    // Server-side: use simple string replacement
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Normalizes content for Tiptap editor
 * Ensures content is in HTML format that Tiptap can parse
 * @param content - Content string (may be plain text or HTML)
 * @returns HTML formatted string ready for Tiptap
 */
export const normalizeContentForTiptap = (content: string): string => {
  if (!content || content.trim() === "") {
    return "<p></p>";
  }

  // If already HTML, return as is
  if (isHTML(content)) {
    return content;
  }

  // Convert plain text to HTML
  return convertPlainTextToHTML(content);
};

/**
 * Truncates HTML content for preview display
 * Strips HTML tags and truncates to specified length
 * @param html - HTML content string
 * @param maxLength - Maximum length for preview (default: 100)
 * @returns Plain text preview string
 */
export const truncateHTMLPreview = (html: string, maxLength = 100): string => {
  if (!html) {
    return "";
  }

  // Handle browser environment
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    const text = div.textContent || div.innerText || "";

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength)}...`;
  }

  // Server-side: simple regex-based stripping
  const text = html.replace(HTML_STRIP_PATTERN, "").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

/**
 * Validates HTML content for safety
 * Checks for potentially dangerous content
 * @param html - HTML content string
 * @returns Object with isValid flag and error message if invalid
 */
export const validateHTMLContent = (
  html: string
): { isValid: boolean; error?: string } => {
  if (!html || html.trim() === "") {
    return { isValid: true };
  }

  // Check for script tags
  if (SCRIPT_TAG_PATTERN.test(html)) {
    return {
      isValid: false,
      error: "Script tags are not allowed in content",
    };
  }

  // Check for event handlers
  if (EVENT_HANDLER_PATTERN.test(html)) {
    return {
      isValid: false,
      error: "Event handlers are not allowed in content",
    };
  }

  // Check for iframe with suspicious src
  if (IFRAME_NON_HTTP_PATTERN.test(html)) {
    return {
      isValid: false,
      error: "Iframes with non-HTTP(S) sources are not allowed",
    };
  }

  return { isValid: true };
};

/**
 * Strips all HTML tags from content
 * Useful for generating plain text previews or metadata
 * @param html - HTML content string
 * @returns Plain text without HTML tags
 */
export const stripHTML = (html: string): string => {
  if (!html) {
    return "";
  }

  // Handle browser environment
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  // Server-side: simple regex-based stripping
  return html.replace(HTML_STRIP_PATTERN, "").trim();
};
