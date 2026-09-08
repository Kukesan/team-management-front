import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatPanel } from '@/features/chat/ChatPanel'
import { SummaryPanel } from '@/features/chat/SummaryPanel'

export function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">AI Assistant</h1>
        <p className="text-sm text-slate-500">Ask questions about your team's reports, or generate a weekly summary.</p>
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="summary">Weekly Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <ChatPanel />
        </TabsContent>
        <TabsContent value="summary">
          <SummaryPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
