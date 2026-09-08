import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, Send, User as UserIcon } from 'lucide-react'
import { aiApi } from '@/api/ai'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/utils'
import { renderMarkdown } from '@/lib/markdown'
import type { ApiError, ChatMessage } from '@/types'

const SUGGESTIONS = [
  'Who hasn’t submitted a report this week?',
  'What blockers came up across the team recently?',
  'How are hours split between development and meetings?',
]

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const chatMutation = useMutation({
    mutationFn: ({ message, history }: { message: string; history: ChatMessage[] }) =>
      aiApi.chat(
        message,
        history.map((m) => ({ role: m.role, content: m.content })),
      ),
    onSuccess: (result) => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.answer,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    },
    onError: (err: ApiError) => toast({ title: 'AI assistant failed to respond', description: err.message, variant: 'destructive' }),
  })

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || chatMutation.isPending) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    const history = messages
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    chatMutation.mutate({ message: trimmed, history })
  }

  return (
    <div className="flex h-[65vh] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="Ask about your team's reports"
            description="The assistant can look up projects, members, weekly reports, submission status, and workload — try one of the questions below."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            }
          />
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600',
                )}
              >
                {m.role === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div className={cn('max-w-[80%] space-y-1.5', m.role === 'user' && 'items-end text-right')}>
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm',
                    m.role === 'user' ? 'whitespace-pre-wrap bg-brand-600 text-white' : 'bg-slate-100 text-slate-800',
                  )}
                >
                  {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
                </div>
              </div>
            </div>
          ))
        )}

        {chatMutation.isPending && (
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Bot className="h-4 w-4" />
            </span>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-end gap-2 border-t border-slate-200 p-3"
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
          placeholder="Ask about reports, blockers, workload..."
          rows={1}
          className="min-h-9 resize-none"
        />
        <Button type="submit" size="icon" disabled={!input.trim()} isLoading={chatMutation.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
