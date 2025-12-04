/**
 * Utility functions for handling content format conversion and detection
 * Used for converting between plain text and HTML formats for Tiptap editor
 */

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
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlTagPattern.test(content);
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
  const lines = text.split(/\r?\n/);
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

  // Create temporary element to extract text content
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

