import { useRef, useEffect } from 'react'
import { SendHorizonal } from 'lucide-react'

export default function InputBar({ value, onChange, onSend, disabled }) {
  const ref = useRef(null)

  // Auto-grow textarea as user types
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  function handleKeyDown(e) {
    // Send on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled) onSend()
    }
  }

  return (
    <div className="input-area">
      <textarea
        ref={ref}
        rows={1}
        placeholder="Type a message… (Shift+Enter for new line)"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        className="send-btn"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <SendHorizonal size={18} />
      </button>
    </div>
  )
}
