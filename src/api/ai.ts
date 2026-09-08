import { http } from '@/lib/http'
import type { ChatResponse, SummaryResponse } from '@/types'

export interface ChatHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export const aiApi = {
  // history excludes the current message — matches AiController.Chat/AiService.ChatAsync,
  // which forward `message` and `history` as separate fields to the FastAPI tool-use loop.
  chat: (message: string, history: ChatHistoryMessage[]) =>
    http.post<ChatResponse>('/ai/chat', { message, history }).then((r) => r.data),

  // week is a plain ISO date (yyyy-MM-dd); AiController binds it as [FromQuery] DateOnly week.
  summary: (week: string, projectId?: string) =>
    http.get<SummaryResponse>('/ai/summary', { params: { week, projectId } }).then((r) => r.data),
}
