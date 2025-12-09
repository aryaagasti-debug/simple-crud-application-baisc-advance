// src/common/utils/sanitize.ts
import sanitizeHtml from 'sanitize-html';

export function sanitizeText(value?: string) {
  if (!value) return value;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return sanitizeHtml(value, {
    allowedTags: [], // 🔒 No HTML
    allowedAttributes: {},
  });
}
