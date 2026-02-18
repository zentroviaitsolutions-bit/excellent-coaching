"use client"
import { useState, useRef, useEffect } from "react"

export default function AITeacher() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const askAI = async () => {
    if (!question.trim() || loading) return

    const userMessage = { role: "user", text: question }
    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      const data = await res.json()

      const aiMessage = {
        role: "ai",
        text: data.answer || "I could not answer.",
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Server error. Please try again." },
      ])
    }

    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">

      {/* Header */}
      <div className="p-4 text-center shadow-sm bg-white">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Vaelthor 🤖 AI Teacher
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask your doubts instantly
        </p> 
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm border"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-gray-500 text-sm animate-pulse">
            Vaelthor AI is typing...
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => e.key === "Enter" && askAI()}
          />
          <button
            onClick={askAI}
            disabled={loading}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}



