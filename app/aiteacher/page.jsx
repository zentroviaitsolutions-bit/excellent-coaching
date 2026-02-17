"use client"
import { useState } from "react"

export default function AITeacher() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const askAI = async () => {
    if (!question.trim()) return

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
      setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Server error." }])
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center p-6">

      <h1 className="text-4xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
         Zentrovia 🤖 AI Teacher
      </h1>

      {/* Chat Box */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-6 flex flex-col h-[70vh] overflow-hidden">

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-500 text-sm"> Zentrovia AI is thinking...</div>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-4 flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your doubt..."
            className="flex-1 p-3 border rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && askAI()}
          />
          <button
            onClick={askAI}
            className="px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}


