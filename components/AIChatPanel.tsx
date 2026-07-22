"use client";

import { useState } from "react";

export function AIChatPanel() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setAnswer("");

    const response = await fetch("http://localhost:8000/api/chat/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const payload = await response.json();
    setAnswer(payload.answer);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h2>AI Chat</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something"
          style={{ width: "100%", padding: 10 }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: 10, padding: "10px 16px" }}>
          {loading ? "Loading..." : "Send"}
        </button>
      </form>
      <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>{answer}</div>
    </div>
  );
}