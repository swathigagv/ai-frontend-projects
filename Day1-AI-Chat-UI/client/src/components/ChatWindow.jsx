import { useState, useRef, useEffect } from 'react'
import { Bot, Trash2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import InputBar from './InputBar'

const WELCOME = { role: 'assistant', content: 'Hi! I\'m Claude. How can I help you today?' }

export default function ChatWindow() {
  const [messages, setMessages]       = useState([WELCOME])
  const [inputValue, setInputValue]   = useState('')
  const [isStreaming, setIsStreaming]  = useState(false)
  const bottomRef = useRef(null)

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = inputValue.trim()
    if (!text || isStreaming) return

    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]

    // Add user message and a blank assistant message to stream into
    setMessages([...history, { role: 'assistant', content: '' }])
    setInputValue('')
    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the full conversation history (excluding the blank assistant placeholder)
        body: JSON.stringify({ messages: history }),
      })

console.log("Status:", response.status)
console.log("Headers:", [...response.headers.entries()])

console.log("Response body:", response.body)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const raw = line.replace('data: ', '')
          if (raw === '[DONE]') break

          const { text, error } = JSON.parse(raw)
          if (error) throw new Error(error)

          // Append each token to the last message (the assistant's reply)
          if (text) {
            setMessages(prev => {
              const updated = [...prev]
              updated[updated.length - 1] = {
                role: 'assistant',
                content: updated[updated.length - 1].content + text
              }
              return updated
            })
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '⚠️ Something went wrong. Please try again.'
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="avatar ai"><Bot size={16} /></div>
        <div>
          <h1>Claude Assistant</h1>
          <div className="status">
            <span className="status-dot" />
            Online
          </div>
        </div>
        <button
          onClick={() => setMessages([WELCOME])}
          title="Clear chat"
          style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="messages-area">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Typing dots — show only when streaming and last message is empty */}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="message">
            <div className="avatar ai"><Bot size={16} /></div>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <InputBar
        value={inputValue}
        onChange={setInputValue}
        onSend={sendMessage}
        disabled={isStreaming}
      />
    </div>
  )
}
