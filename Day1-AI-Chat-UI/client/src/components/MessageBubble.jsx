import { Bot, User } from 'lucide-react'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`message ${isUser ? 'user' : ''}`}>
      <div className={`avatar ${isUser ? 'user' : 'ai'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={`bubble ${isUser ? 'user' : 'ai'}`}>
        {message.content}
      </div>
    </div>
  )
}
