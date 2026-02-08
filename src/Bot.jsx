import React, { useState, useEffect, useRef } from 'react';

const Api_key = import.meta.env.VITE_GEMINI_API_KEY2;

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${Api_key}`;

const GeminiChatBot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Avi AI. How can i help you?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askGemini = async (userText) => {
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }] })
      });
      const data = await response.json();
      const botReply = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { text: botReply, sender: "bot" }]);
    } 
    catch (error) {
      console.log(error)
      setMessages(prev => [...prev, { text: "Error: Somossa hoyeche!", sender: "bot" }]);
    }
    setLoading(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setMessages([...messages, { text: input, sender: "user" }]);
    askGemini(input);
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Avi AI Assistant</div>
      
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message-wrapper ${msg.sender === 'user' ? 'user-wrapper' : 'bot-wrapper'}`}>
            <div className={`bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className="loading-text">Avi is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input 
          className="chat-input"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Type a message..."
          disabled={loading}
        />
        <button type="submit" className="send-button" disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default function Result() {
  return (
    <div className="main-wrapper">
      <GeminiChatBot />
    </div>
  );
}