import { useState, useEffect, useCallback, useRef } from 'react'
import { sendSchoolHelperMessage } from '@/services/assistant'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import React from 'react'

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

export function useSchoolHelper() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const { toast } = useToast()

  const abortControllerRef = useRef<AbortController | null>(null)
  const requestTimestamps = useRef<number[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('school-helper-history')
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
      localStorage.setItem('school-helper-history', JSON.stringify({ conversationId, messages }))
    } else if (conversationId === null) {
      localStorage.removeItem('school-helper-history')
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
    async (content: string) => {
      if (!checkRateLimit()) {
        toast({
          variant: 'destructive',
          title: 'Limite atingido',
          description: 'Você atingiu o limite de 10 mensagens por minuto. Aguarde um momento.',
        })
        return false
      }

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
        const result = await sendSchoolHelperMessage(
          content,
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
          title: 'Erro de conexão',
          description: err?.message || 'Não foi possível conectar ao tutor.',
          action: React.createElement(
            ToastAction,
            { altText: 'Tentar Novamente', onClick: () => void sendMessage(content) },
            'Tentar Novamente',
          ),
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [conversationId, toast],
  )

  const clearHistory = () => {
    setMessages([])
    setConversationId(null)
    localStorage.removeItem('school-helper-history')
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
    loading,
    sendMessage,
    clearHistory,
  }
}
