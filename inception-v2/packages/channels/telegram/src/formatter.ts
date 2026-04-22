// Characters that must be escaped in Telegram MarkdownV2
const ESCAPE_CHARS = /([_*[\]()~`>#+\-=|{}.!\\])/g;

export function escapeMarkdownV2(text: string): string {
  return text.replace(ESCAPE_CHARS, '\\$1');
}

/**
 * Convert a plain/markdown message body to Telegram MarkdownV2.
 * Handles code blocks, bold, italic conservatively.
 */
export function formatForTelegram(text: string): string {
  // Code blocks (``` ```) — preserve as-is with escaping inside
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;

  // Replace code blocks first (don't escape their content, just wrap)
  let result = text.replace(codeBlockRegex, (_match, _lang, code) => {
    return `\`\`\`\n${code.replace(/`/g, "'")}\n\`\`\``;
  });

  // Replace inline code
  result = result.replace(inlineCodeRegex, (_match, code) => {
    return `\`${code.replace(/`/g, "'")}\``;
  });

  // Escape remaining special chars (outside code blocks)
  // Split by code blocks and escape non-code segments
  const segments = result.split(/(```[\s\S]*?```|`[^`]+`)/g);
  return segments
    .map((seg, i) => {
      // Odd indices are code segments (matched by the regex) — leave as-is
      if (i % 2 === 1) return seg;
      return escapeMarkdownV2(seg);
    })
    .join('');
}
