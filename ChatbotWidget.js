import React, { useState } from "react";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // ✅ Show user message
    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();

      const botMsg = { sender: "bot", text: data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to server." }
      ]);
    }
  };

  return (
    <>
      {/* CHAT ICON */}
      <div className="chat-icon" onClick={() => setOpen(true)}>
        💬
      </div>

      {/* CHAT WINDOW */}
      {open && (
        <div className="chatbox">
          <div className="chat-header">
            Support Chat
            <span onClick={() => setOpen(false)}>✖</span>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.sender === "user" ? "user" : "bot"}`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <textarea
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
