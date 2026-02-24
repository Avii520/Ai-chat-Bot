import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { FileUp, Menu, Trash2, SendHorizonal, Dot } from "lucide-react";
import Lottie from "lottie-react";
import AviLogo2 from "./assets/AviLogo2.png";
import DeleteModal from "./DeleteModal";
import CopyButton from "./CopyButton.jsx";

//firebase
import {
  handleLogin,
  handleLogout,
  saveChatToFirebase,
  loadChatFromFirebase,
  trackAuthState,
} from "./FirebaseFunction";
import Login from "./Login.jsx";
//

const Api_key = import.meta.env.VITE_GEMINI_API_KEY2;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${Api_key}`;

const GeminiChatBot = () => {
  const [showLogout, setShowLogout] = React.useState(false);

  //firebase
  const [user, setUser] = useState(null);
  //
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const [deleteId, setDeleteId] = useState(null); // Dlt_Modal State

  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      title: "Chat One",
      chats: [
        { text: "Hello! I'm Avi AI. How can I help you?", sender: "bot" },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(chatHistory[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  //firebase
  // --- useEffect update ---

  useEffect(() => {
    // trackAuthState check korbe user login ache ki na
    const unsubscribe = trackAuthState(async (currentUser) => {
      setUser(currentUser); // Age user set kore nite hobe

      if (currentUser) {
        // Login thakle Firestore theke tar purano chat load hobe
        console.log("User Logged In:", currentUser.uid);

        try {
          const history = await loadChatFromFirebase(currentUser.uid);
          if (history && history.length > 0) {
            setChatHistory(history);
            const nextChatNumber = history.length + 1;
            const newChatId = Date.now();
            const newSession = {
              id: newChatId,
              title: `Chat ${numberWords[history.length] || nextChatNumber}`,
              chats: [
                {
                  text: "Hello! I'm Avi AI. How can I help you?",
                  sender: "bot",
                },
              ],
            };
            setChatHistory((prev) => [newSession, ...prev]);
            setActiveChatId(newChatId);
          }
        } catch (error) {
          console.error("Firebase load error:", error);
        }
      } else {
        // User logout hole default chat history dekhabe
        setChatHistory([
          {
            id: 1,
            title: "Chat One",
            chats: [
              { text: "Hello! I'm Avi AI. How can I help you?", sender: "bot" },
            ],
          },
        ]);
        setActiveChatId(1);
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array thakbe jate shudhu mount-e kaj kore

  //

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

  const activechat = chatHistory.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activechat]);

  // File-ke Base64-e convert kora
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRename = (id) => {
    if (!newTitle.trim()) return;
    setChatHistory((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat,
      ),
    );
    setEditingId(null);
  };

  const askGemini = async (userText, base64Data = null, mimeType = null) => {
    //Recognition Logic
    const creatorKeywords = [
      "who made you",
      "who made u",
      "who build you",
      "who build u",
      "who create you",
      "who create u",
      "who made you",
      "who made u",
      "who built you",
      "who is your daddy",
      "who created you",
      "who created u",
      "banaise",
      "banaiche",
      "abba",
      "ke tomake banaiche",
      "tmk ke baniche",
      "tmk ke banise",
      "tomake ke banise",
    ];
    const lowerText = userText.toLowerCase();

    if (creatorKeywords.some((keyword) => lowerText.includes(keyword))) {
      // Fake loading start kora holo
      setLoading(true);

      const replies = [
        "I was created by Avi.",
        "The Avi is the one who built me.",
        "I am a creation of Avi. How can I help you today?",
        "My developer is Avi. He designed me to assist you!",
        "You can thank Avi for my existence! He is my creator.",
        "Avi is my daddy",
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      // 1.5 second opekkha kore reply pathano hochche
      setTimeout(() => {
        setChatHistory((prev) => {
          const finalHistory = prev.map((history) =>
            history.id === activeChatId
              ? {
                  ...history,
                  chats: [
                    ...history.chats,
                    { text: randomReply, sender: "bot" },
                  ],
                }
              : history,
          );
          if (user) saveChatToFirebase(user.uid, finalHistory);
          return finalHistory;
        });
        // Reply dewar por loading bondho kora holo
        setLoading(false);
      }, 1700);

      return; // Custom reply dewa holo, tai API call bondho
    }

    setLoading(true);
    try {
      // Shudhu shesh 10-ti message Gemini-ke context hishebe pathano hochche
      // Ete token banchbe kintu conversation-er dharabahikota thakbe
      const historyContext = activechat.chats.slice(-10).map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const contents = [
        ...historyContext,
        {
          role: "user",
          parts: [
            { text: userText || "Analyze this file." },
            ...(base64Data
              ? [{ inline_data: { mime_type: mimeType, data: base64Data } }]
              : []),
          ],
        },
      ];

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }), // Ekhane optimized context jacche
      });

      const data = await response.json();
      const botReply =
        data.candidates?.[0].content.parts[0].text ||
        "Sorry, I couldn't respond.";

      setChatHistory((prev) => {
        const finalHistory = prev.map((history) =>
          history.id === activeChatId
            ? {
                ...history,
                chats: [...history.chats, { text: botReply, sender: "bot" }],
              }
            : history,
        );

        if (user) {
          saveChatToFirebase(user.uid, finalHistory);
        }

        return finalHistory;
      });
    } catch (error) {
      console.error("API Error:", error);
    }
    setLoading(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || loading) return;

    let base64Data = null;
    let mimeType = null;
    let filePreview = null;
    let fileName = null;

    if (selectedFile) {
      base64Data = await convertToBase64(selectedFile);
      mimeType = selectedFile.type;
      fileName = selectedFile.name;
      if (selectedFile.type.startsWith("image/")) {
        filePreview = URL.createObjectURL(selectedFile);
      }
    }

    //firebase
    const updatedHistory = chatHistory.map((history) =>
      history.id === activeChatId
        ? {
            ...history,
            chats: [
              ...history.chats,
              {
                text: input,
                sender: "user",
                file: filePreview,
                fileName: fileName,
                isPdf: mimeType === "application/pdf",
              },
            ],
          }
        : history,
    );

    setChatHistory(updatedHistory);

    //firebase
    if (user) {
      saveChatToFirebase(user.uid, updatedHistory); //
    }

    askGemini(input, base64Data, mimeType);
    setInput("");
    setSelectedFile(null);
  };

  // Textarea-r height auto adjust korar function
  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Height reset kore notun scrollHeight mapbe
    e.target.style.height = "auto";

    // Maximum 150px porjonto barbe, tarpor scroll hobe
    const nextHeight = Math.min(e.target.scrollHeight, 150);
    e.target.style.height = `${nextHeight}px`;
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

  // Dlt_Modal open korbe
  const openDeleteModal = (id, e) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  //Confirm delete korle Firebase-e save hobe
  const confirmDelete = () => {
    if (!deleteId) return;

    const filteredHistory = chatHistory.filter((chat) => chat.id !== deleteId);

    if (filteredHistory.length === 0) {
      const defaultChat = [
        {
          id: 1,
          title: "Chat One",
          chats: [
            { text: "Hello! I'm Avi AI. How can I help you?", sender: "bot" },
          ],
        },
      ];
      setChatHistory(defaultChat);
      setActiveChatId(1);
      if (user) saveChatToFirebase(user.uid, []);
    } else {
      // Shob chat-er title abar 1 theke serial kora hochche
      const updatedHistory = filteredHistory.map((chat, index) => ({
        ...chat,
        title: `Chat ${numberWords[filteredHistory.length - 1 - index] || filteredHistory.length - index}`,
      }));

      if (deleteId === activeChatId) {
        setActiveChatId(updatedHistory[0].id);
      }
      setChatHistory(updatedHistory);
      if (user) saveChatToFirebase(user.uid, updatedHistory);
    }
    setDeleteId(null);
  };

  return (
    <div
      className={`chat-container ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
    >
      {/*Sudhu Sidebar open thaklei eta thakbe */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

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
                  {chatHistory.length > 1 && (
                    <button
                      className="deleteBtn"
                      style={{
                        marginLeft: "5px",
                        color: "#b83131",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={(e) => openDeleteModal(item.id, e)}
                    >
                      <Trash2 />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </aside>

      <div className="chat-main-area">
        {showLoginModal && (
          <Login
            user={user}
            onLogin={() => {
              handleLogin();
              setShowLoginModal(false);
              setShowLogout(false);
            }}
          />
        )}

        <div className="chat-header">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="menu-btn">
              <Menu />
            </button>
          )}

          <span className="chat-header-title">Avi AI Assistant</span>

          <div className="auth-container">
            {user ? (
              <div className="profile-wrapper" style={{ position: "relative" }}>
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="profile-circle"
                  onClick={() => setShowLogout(!showLogout)}
                />

                {showLogout && (
                  <button onClick={handleLogout} className="logout-popover">
                    Logout
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="login-btn"
              >
                Login
              </button>
            )}
          </div>
        </div>

        <div className="chat-window">
          {activechat?.chats.map((msg, i) => (
            <div
              key={i}
              className={`message-wrapper ${msg.sender === "user" ? "user-wrapper" : "bot-wrapper"}`}
            >
              {msg.sender === "bot" && (
                <img src={AviLogo2} className="bot-avatar" />
              )}
              <div
                className={`bubble ${msg.sender === "user" ? "user-bubble" : "bot-bubble"}`}
              >
                {msg.file && (
                  <img
                    src={msg.file}
                    alt="upload"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  />
                )}
                {msg.fileName && !msg.file && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      padding: "8px",
                      borderRadius: "5px",
                      marginBottom: "8px",
                      fontSize: "13px",
                    }}
                  >
                    {msg.isPdf ? "📄 PDF: " : "📁 File: "} {msg.fileName}
                  </div>
                )}
                <ReactMarkdown>{msg.text}</ReactMarkdown>
                {msg.sender === "bot" && <CopyButton text={msg.text} />}
              </div>
            </div>
          ))}
          {loading && (
            <div className="typing-wrapper">
              <img src={AviLogo2} alt="avi" className="typing-avatar" />
              <span className="loading-text">
                Avi is typing
                <span className="dot">.</span>
                <span className="dot"> .</span>
                <span className="dot"> .</span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="input-area">
          <input
            type="file"
            id="all-file-input"
            style={{ display: "none" }} // Ete UI-te baaje dekhabe na
            accept="image/*,application/pdf" // Shudhu image ar pdf allow korbe
            onChange={(e) => setSelectedFile(e.target.files[0])} // File select hole state update hobe
          />
          <label
            htmlFor="all-file-input"
            style={{ cursor: "pointer", marginRight: "10px", fontSize: "20px" }}
          >
            {selectedFile ? (
              selectedFile.type === "application/pdf" ? (
                "📄"
              ) : (
                "🖼️"
              )
            ) : (
              <FileUp
                color="Lightgreen"
                size={"27.5px"}
                className="plus-icon"
              />
            )}
          </label>
          {/*  Purano input replace korun niche textarea diye */}
          <textarea
            className="chat-input"
            value={input}
            onChange={handleInputChange} // Amader toiri kora logic
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask Avi Ai. . ."
            disabled={loading}
            rows="1"
            style={{
              resize: "none",
              overflowY: "auto",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
            }}
          />

          <button type="submit" className="send-button" disabled={loading}>
            {loading ? "..." : <SendHorizonal />}
          </button>
        </form>

        {/*Single Line Connection for Dlt_Modal */}
        <DeleteModal
          isOpen={!!deleteId}
          onCancel={() => setDeleteId(null)}
          onConfirm={confirmDelete}
        />
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
