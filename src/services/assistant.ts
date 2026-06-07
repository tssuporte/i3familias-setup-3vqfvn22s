import { streamAgentChat } from '@/lib/skipAi'
import pb from '@/lib/pocketbase/client'

export async function sendAssistantMessage(
  message: string,
  mode: string,
  conversationId: string | null,
  signal: AbortSignal,
  onChunk?: (delta: string, full: string) => void,
) {
  const res = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
    body: JSON.stringify({ message, mode, conversation_id: conversationId }),
    signal,
  })

  const result = await streamAgentChat(res, {
    onChunk: (delta, full) => onChunk?.(delta, full),
    signal,
  })

  return {
    conversationId: res.headers.get('X-Conversation-Id') ?? result.conversation_id,
    messageId: result.message_id,
    content: result.content,
  }
}
