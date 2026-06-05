import { describe, expect, it } from 'vitest'

import { completeMarkdown } from '@/lib/streamingMarkdown'

describe('completeMarkdown', () => {
  it('closes a dangling bold run', () => {
    expect(completeMarkdown('**NOC')).toBe('**NOC**')
  })

  it('closes a dangling italic run', () => {
    expect(completeMarkdown('*emphasis')).toBe('*emphasis*')
  })

  it('closes an unterminated inline code span', () => {
    expect(completeMarkdown('`code')).toBe('`code`')
  })

  it('closes an unterminated fenced code block', () => {
    expect(completeMarkdown('```\nconst x = 1')).toBe('```\nconst x = 1\n```')
  })

  it('leaves already-balanced markdown untouched', () => {
    expect(completeMarkdown('**done** and `ok`')).toBe('**done** and `ok`')
  })

  it('does not mistake a bullet list for an open emphasis run', () => {
    const list = '* alpha\n* beta\n* gamma'
    expect(completeMarkdown(list)).toBe(list)
  })
})
