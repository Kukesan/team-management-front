import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { HelpCircle, Send, X } from 'lucide-react'
import { aiApi } from '@/api/ai'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { renderMarkdown } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import type { ApiError, ChatMessage } from '@/types'

/**
 * Floating "how do I..." help widget, mounted once in AppLayout so it's available on every
 * authenticated page for every role. Separate from the AI Assistant page's ChatPanel: this
 * hits /ai/help (open to all roles, static product docs, no DB access) rather than /ai/chat
 * (Manager/Admin only, live report data via tool calls).
 */
export function HelpWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [open])

  const helpMutation = useMutation({
    mutationFn: ({ message, history }: { message: string; history: ChatMessage[] }) =>
      aiApi.help(
        message,
        history.map((m) => ({ role: m.role, content: m.content })),
      ),
    onSuccess: (result) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: result.answer, createdAt: new Date().toISOString() },
      ])
    },
    onError: (err: ApiError) => toast({ title: 'Help assistant failed to respond', description: err.message, variant: 'destructive' }),
  })

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || helpMutation.isPending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    const history = messages
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    helpMutation.mutate({ message: trimmed, history })
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div
          ref={panelRef}
          className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Help</p>
              <p className="text-xs text-slate-500">Ask how to do something in the app</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close help"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-slate-500">
                Hi! Ask me how to do something in the app — e.g. "How do I submit a report?"
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user' ? 'ml-auto whitespace-pre-wrap bg-brand-600 text-white' : 'bg-slate-100 text-slate-800',
                  )}
                >
                  {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
                </div>
              ))
            )}

            {helpMutation.isPending && (
              <div className="flex w-fit items-center gap-1 rounded-lg bg-slate-100 px-3 py-2.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2 border-t border-slate-200 p-2.5"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Ask a how-to question..."
              rows={1}
              className="min-h-9 resize-none text-sm"
            />
            <Button type="submit" size="icon" disabled={!input.trim()} isLoading={helpMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label={open ? 'Close help' : 'Open help'}
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>
    </div>
  )
}
