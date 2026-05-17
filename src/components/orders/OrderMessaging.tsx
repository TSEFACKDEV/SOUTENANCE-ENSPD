'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSend } from 'react-icons/fi'
import { formatDateTime } from '@/lib/utils'

type Message = {
  id: string
  content: string
  senderId: string
  createdAt: Date
  sender: { id: string; nom: string; prenom: string; role: string }
}

export default function OrderMessaging({
  orderId,
  initialMessages,
  currentUserId,
}: {
  orderId: string
  initialMessages: Message[]
  currentUserId: string
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!content.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setContent('')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div className="px-5 py-4 max-h-72 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-text-muted text-sm py-6">
            Pas encore de messages. Démarrez la conversation !
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe ? 'bg-primary text-white' : 'bg-gray-100 text-text-dark'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-medium opacity-70 mb-1">
                      {msg.sender.prenom} {msg.sender.nom}
                    </p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-text-muted'}`}>
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Votre message..."
          className="flex-1 bg-gray-50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={send}
          disabled={!content.trim() || sending}
          className="w-10 h-10 bg-primary hover:bg-primary-light disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  )
}
