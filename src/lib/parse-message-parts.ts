/**
 * parseMessageParts.ts
 *
 * Parses a raw AI message string into an ordered array of parts.
 * Each part is one of:
 *   { type: "text", content: string }
 *   { type: "html", content: string }  ← from ```html ... ``` blocks
 *   { type: "svg",  content: string }  ← from ```svg  ... ``` blocks
 *
 * Multiple visualizations in a single message are fully supported.
 * Non-visualization code blocks (```python, etc.) remain as "text" so
 * the downstream ReactMarkdown renderer can style them normally.
 */

export type MessagePart =
  | { type: "text"; content: string }
  | { type: "html"; content: string }
  | { type: "svg"; content: string }

/**
 * Regex that captures fenced code blocks whose language tag is exactly
 * "html" or "svg" (case-insensitive).  Content group is trimmed.
 *
 * Captures:
 *   [1] language tag  → "html" | "svg"
 *   [2] code content  → the raw block body
 */
const VISUAL_BLOCK_RE = /```(html|svg)\s*\n([\s\S]*?)```/gi

export function parseMessageParts(content: string): MessagePart[] {
  if (!content) return []

  const parts: MessagePart[] = []
  let cursor = 0

  // Reset lastIndex since we reuse the same regex object
  VISUAL_BLOCK_RE.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = VISUAL_BLOCK_RE.exec(content)) !== null) {
    const blockStart = match.index
    const blockEnd   = match.index + match[0].length
    const lang       = match[1].toLowerCase() as "html" | "svg"
    const code       = match[2].trim()

    // Text before this visual block
    if (blockStart > cursor) {
      const text = content.slice(cursor, blockStart).trim()
      if (text) parts.push({ type: "text", content: text })
    }

    parts.push({ type: lang, content: code })
    cursor = blockEnd
  }

  // Remaining text after the last visual block (or the whole message if no visuals)
  const tail = content.slice(cursor).trim()
  if (tail) parts.push({ type: "text", content: tail })

  return parts
}
