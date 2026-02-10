import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

const Api_key = import.meta.env.VITE_GEMINI_API_KEY2;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${Api_key}`;

const GeminiChatBot = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "Chat One",
      chats: [
        { text: "Hello! I'm Avi AI. How can I help you?", sender: "bot" },
      ],
    },
  ]);

  const numberWords = [
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "eighteen",
    "Nineteen",
    "Twenty",
  ];

  const [activeChatId, setActiveChatId] = useState(chatHistory[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activechat = chatHistory.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activechat]);

  const handleRename = (id) => {
    if (!newTitle.trim()) return;
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat,
      ),
    );
    setEditingId(null);
  };

  const askGemini = async (userText) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }] }),
      });

      const data = await response.json();
      const botReply =
        data.candidates?.[0].content.parts[0].text ||
        "Sorry, I couldn't respond.";

      setChatHistory((prev) =>
        prev.map((history) =>
          history.id === activeChatId
            ? {
                ...history,
                chats: [...history.chats, { text: botReply, sender: "bot" }],
              }
            : history,
        ),
      );
    } catch (error) {
      setChatHistory((prev) =>
        prev.map((history) =>
          history.id === activeChatId
            ? {
                ...history,
                chats: [
                  ...history.chats,
                  { text: error.message, sender: "bot" },
                ],
              }
            : history,
        ),
      );
    }
    setLoading(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setChatHistory((prev) =>
      prev.map((history) =>
        history.id === activeChatId
          ? {
              ...history,
              chats: [...history.chats, { text: input, sender: "user" }],
            }
          : history,
      ),
    );

    askGemini(input);
    setInput("");
  };

  const addChathistory = () => {
    setChatHistory((prev) => {
      const newId = prev.length > 0 ? prev[0].id + 1 : 1;
      const newHistory = {
        id: newId,
        title: `Chat ${numberWords[prev.length] || prev.length + 1}`,
        chats: [
          { text: "Hello! I'm Avi AI. How can I help you?", sender: "bot" },
        ],
      };
      setActiveChatId(newId);
      return [newHistory, ...prev];
    });
  };

  return (
    <div
      className={`chat-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <aside className="sidebar">
        <div className="sidebar-header">
          <button onClick={addChathistory} className="new-chat-btn">
            New Chat
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="close-sidebar"
          >
            ✕
          </button>
        </div>

        <div className="history-list">
          {chatHistory.map((item) => (
            <div
              key={item.id}
              className={`history-item ${item.id === activeChatId ? "active" : ""}`}
              onClick={() => setActiveChatId(item.id)}
            >
              {editingId === item.id ? (
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={() => handleRename(item.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleRename(item.id)}
                  autoFocus
                />
              ) : (
                <>
                  <span className="chat-title">{item.title}</span>
                  <button
                    className="editBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(item.id);
                      setNewTitle(item.title);
                    }}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="chat-main-area">
        <div className="chat-header">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="menu-btn">
              ☰
            </button>
          )}
          Avi AI Assistant
        </div>

        <div className="chat-window">
          {activechat?.chats.map((msg, i) => (
            <div
              key={i}
              className={`message-wrapper ${msg.sender === "user" ? "user-wrapper" : "bot-wrapper"}`}
            >
              <div
                className={`bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
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
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
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
