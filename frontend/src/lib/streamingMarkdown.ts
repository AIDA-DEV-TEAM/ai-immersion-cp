/**
 * Make an in-flight markdown fragment renderable as *formatted* output by closing
 * syntax that streaming has left open (e.g. `**NOC` mid-token → `**NOC**`). Without
 * this, react-markdown shows the raw `**` until the closing delimiter arrives, which
 * flickers on screen.
 *
 * Used ONLY for the streaming frame. The completed message renders the raw content
 * unchanged, so any heuristic imperfection here can never affect the final output.
 */
export function completeMarkdown(input: string): string {
  // 1. Unclosed fenced code block — close it and stop (the fence owns the rest).
  if (countOccurrences(input, '```') % 2 === 1) {
    return `${input}\n\`\`\``
  }

  // Inspect inline markers outside of already-closed inline-code spans.
  const outsideCode = input.replace(/`[^`\n]*`/g, '')

  // 2. Unclosed inline code — close it and stop (it would swallow other markers).
  if (countChar(outsideCode, '`') % 2 === 1) {
    return `${input}\``
  }

  // 3. Unclosed emphasis. Close italic (inner) before bold (outer).
  let closers = ''
  const boldOpen = countOccurrences(outsideCode, '**') % 2 === 1
  // For italic, drop bold pairs and line-leading list markers (`* item`) so a bullet
  // list is never mistaken for an open emphasis run.
  const italicScan = outsideCode.replace(/\*\*/g, '').replace(/^[ \t]*[*+-][ \t]/gm, '')
  const italicOpen = countChar(italicScan, '*') % 2 === 1
  if (italicOpen) closers += '*'
  if (boldOpen) closers += '**'

  return `${input}${closers}`
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0
  let index = haystack.indexOf(needle)
  while (index !== -1) {
    count += 1
    index = haystack.indexOf(needle, index + needle.length)
  }
  return count
}

function countChar(haystack: string, char: string): number {
  let count = 0
  for (const current of haystack) if (current === char) count += 1
  return count
}
