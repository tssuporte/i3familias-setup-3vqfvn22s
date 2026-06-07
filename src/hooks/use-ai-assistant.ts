import { useState, useEffect, useCallback, useRef } from 'react'
import { sendAssistantMessage } from '@/services/assistant'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import React from 'react'

export type Mode = 'Estudos' | 'Cardápio' | 'Semana Quebrada'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface StoredHistory {
  conversationId: string | null
  messages: ChatMessage[]
}

export function useAIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [mode, setMode] = useState<Mode>('Estudos')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const { toast } = useToast()

  const abortControllerRef = useRef<AbortController | null>(null)
  const requestTimestamps = useRef<number[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai-assistant-chat-history')
      if (stored) {
        const parsed = JSON.parse(stored) as StoredHistory
        if (parsed.messages) setMessages(parsed.messages)
        if (parsed.conversationId) setConversationId(parsed.conversationId)
      }
    } catch (err) {
      console.error('Failed to load chat history', err)
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        'ai-assistant-chat-history',
        JSON.stringify({ conversationId, messages }),
      )
    }
  }, [messages, conversationId])

  const checkRateLimit = () => {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    requestTimestamps.current = requestTimestamps.current.filter((ts) => ts > oneMinuteAgo)
    if (requestTimestamps.current.length >= 10) {
      return false
    }
    requestTimestamps.current.push(now)
    return true
  }

  const sendMessage = useCallback(
    async (content: string, retryMode?: Mode) => {
      if (!checkRateLimit()) {
        toast({
          variant: 'destructive',
          title: 'Limite atingido',
          description: 'Você atingiu o limite de 10 mensagens por minuto. Aguarde um momento.',
        })
        return false
      }

      const currentMode = retryMode || mode
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg])
      setLoading(true)

      abortControllerRef.current = new AbortController()

      const assistantMsgId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now() },
      ])

      try {
        const result = await sendAssistantMessage(
          content,
          currentMode,
          conversationId,
          abortControllerRef.current.signal,
          (_, full) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsgId ? { ...m, content: full } : m)),
            )
          },
        )

        setConversationId(result.conversationId)
        return true
      } catch (err: any) {
        if (err.name === 'AbortError') return false

        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId))

        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível conectar ao assistente.',
          action: React.createElement(
            ToastAction,
            { altText: 'Tentar Novamente', onClick: () => void sendMessage(content, currentMode) },
            'Tentar Novamente',
          ),
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [mode, conversationId, toast],
  )

  const clearHistory = () => {
    setMessages([])
    setConversationId(null)
    localStorage.removeItem('ai-assistant-chat-history')
  }

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    messages,
    mode,
    setMode,
    loading,
    sendMessage,
    clearHistory,
  }
}
