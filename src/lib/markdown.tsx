import type { ReactNode } from 'react'
import { Fragment } from 'react'

// Minimal markdown renderer for AI-generated text (chat answers, weekly summaries).
// Builds React elements directly instead of dangerouslySetInnerHTML, so there's no HTML
// injection surface — deliberately not a general-purpose parser, just headers/bold/italic/lists.
function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>)
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

const HEADER_CLASS: Record<number, string> = {
  1: 'text-base font-semibold text-slate-900',
  2: 'text-sm font-semibold text-slate-900',
  3: 'text-sm font-semibold text-slate-800',
}

export function renderMarkdown(markdown: string): ReactNode {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let listItems: string[] = []
  let listOrdered = false
  let key = 0

  const flushList = () => {
    if (listItems.length === 0) return
    const items = listItems.map((item, i) => <li key={i}>{parseInline(item)}</li>)
    blocks.push(
      listOrdered ? (
        <ol key={key++} className="list-decimal space-y-0.5 pl-5">
          {items}
        </ol>
      ) : (
        <ul key={key++} className="list-disc space-y-0.5 pl-5">
          {items}
        </ul>
      ),
    )
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const headerMatch = /^(#{1,6})\s+(.*)$/.exec(line)
    const ulMatch = /^[-*]\s+(.*)$/.exec(line)
    const olMatch = /^\d+\.\s+(.*)$/.exec(line)

    if (headerMatch) {
      flushList()
      const level = headerMatch[1].length
      blocks.push(
        <p key={key++} className={`mt-3 first:mt-0 ${HEADER_CLASS[level] ?? HEADER_CLASS[3]}`}>
          {parseInline(headerMatch[2])}
        </p>,
      )
    } else if (ulMatch) {
      if (listItems.length > 0 && listOrdered) flushList()
      listOrdered = false
      listItems.push(ulMatch[1])
    } else if (olMatch) {
      if (listItems.length > 0 && !listOrdered) flushList()
      listOrdered = true
      listItems.push(olMatch[1])
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      blocks.push(
        <p key={key++} className="mt-2 first:mt-0">
          {parseInline(line)}
        </p>,
      )
    }
  }
  flushList()

  return <Fragment>{blocks}</Fragment>
}
