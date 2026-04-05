import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import axios from "../api/axios";
import "./Chat.css";

function Chat() {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/users");
        setUsers(res.data.filter(u => u._id !== user?.id));
      } catch (err) {
        console.error("Failed to load users", err.response?.data || err.message);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_private_message", (message) => {
      const processedMessage = {
        ...message,
        senderId: typeof message.senderId === "object" ? message.senderId._id : message.senderId
      };
      if (processedMessage.roomId === currentRoom) {
        setMessages(prev => [...prev, processedMessage]);
      }
    });

    socket.on("message_edited", (updatedMessage) => {
      const processedMessage = {
        ...updatedMessage,
        senderId: typeof updatedMessage.senderId === "object" ? updatedMessage.senderId._id : updatedMessage.senderId
      };
      setMessages(prev =>
        prev.map(msg => (msg._id === processedMessage._id ? processedMessage : msg))
      );
    });

    socket.on("message_deleted", ({ messageId }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, isDeleted: true, content: null } : msg
        )
      );
    });

    socket.on("message_status_update", (update) => {
      setMessages(prev =>
        prev.map(msg => (msg._id === update.messageId ? { ...msg, ...update } : msg))
      );
    });

    socket.on("user_typing", ({ userId, username }) => {
      if (userId !== user?.id) setTypingUser(username);
    });

    socket.on("user_stop_typing", () => setTypingUser(null));

    return () => {
      socket.off("receive_private_message");
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.off("message_status_update");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, currentRoom, user?.id]);

  useEffect(() => {
    if (socket && currentRoom) {
      socket.emit("join_room", currentRoom);
    }
  }, [socket, currentRoom]);

  const startChat = async (otherUserId) => {
    try {
      if (!user?.id) return;
      const res = await axios.get(`/rooms/private/${otherUserId}`);
      const room = res.data;
      setCurrentRoom(room._id);
      setCurrentChatUser(users.find(u => u._id === otherUserId));
      const msgRes = await axios.get(`/messages/${room._id}`);
      setMessages(msgRes.data);
      if (socket) socket.emit("mark_seen", room._id);
    } catch (err) {
      console.error("Failed to start chat:", err.response?.data || err.message);
      alert("Failed to start chat.");
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !currentChatUser || !socket) return;
    socket.emit("private_message", {
      receiverId: currentChatUser._id,
      content: text,
      messageType: "text"
    });
    setText("");
    socket.emit("typing_stop", currentRoom);
  };

  const editMessage = (message) => {
    const newContent = prompt("Edit message:", message.content);
    if (newContent && newContent !== message.content && socket) {
      socket.emit("edit_message", { messageId: message._id, newContent });
    }
  };

  const deleteMessage = (messageId) => {
    if (window.confirm("Delete this message?") && socket) {
      socket.emit("delete_message", { messageId });
    }
  };

  const handleTyping = () => {
    if (!typing && socket && currentRoom) {
      setTyping(true);
      socket.emit("typing_start", currentRoom);
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setTyping(false);
      if (socket && currentRoom) socket.emit("typing_stop", currentRoom);
    }, 2000);
  };

  const handleLogout = async () => {
    try {
      if (socket) socket.disconnect();
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          {/* ✅ App name with logo style */}
          <div className="app-brand">
            <div className="app-logo">A</div>
            <span className="app-name">Aditya Connect</span>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => navigate("/profile")} className="profile-btn">
              Profile
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        <div className="users-list">
          {users.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#8696a0" }}>
              No other users found
            </div>
          ) : (
            users.map(u => (
              <div
                key={u._id}
                className={`user-item ${u.status === "online" ? "online" : ""}`}
                onClick={() => startChat(u._id)}
              >
                <div className="user-avatar">{getInitials(u.name)}</div>
                <div className="user-info">
                
                  <div className="user-name">
                    {u.name}
                    {u.status === "online" && <span className="online-dot">●</span>}
                  </div>
                  <div className="user-status">
                    {u.rollNumber} · {u.branch}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        {currentChatUser ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-user-avatar">
                  {getInitials(currentChatUser.name)}
                </div>
                <div className="chat-user-details">
                
                  <h4>{currentChatUser.name}</h4>
                  <span>
                    {currentChatUser.status === "online" ? "🟢 online" : "offline"} · {currentChatUser.branch} Year {currentChatUser.year}
                  </span>
                </div>
              </div>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-chat">No messages yet. Start chatting!</div>
              ) : (
                messages.map((msg) => {
                  const senderId = typeof msg.senderId === "object" ? msg.senderId?._id : msg.senderId;
                  const isMine = senderId === user?.id;
                  const date = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div key={msg._id} className={`message-wrapper ${isMine ? "mine" : "other"}`}>
                      <div className="message-bubble">
                        {msg.isDeleted ? (
                          <span className="deleted-message">This message was deleted</span>
                        ) : (
                          <>
                            {msg.content}
                            {msg.isEdited && <span className="edited-indicator"> edited</span>}
                          </>
                        )}
                      </div>

                      <div className="message-footer">
                        <span className="message-time">{date}</span>
                        {isMine && !msg.isDeleted && (
                          <span className="message-status">
                            {msg.seenBy?.length > 0 ? (
                              <span className="status-read" title="Seen">✓✓</span>
                            ) : msg.deliveredTo?.length > 0 ? (
                              <span className="status-delivered" title="Delivered">✓✓</span>
                            ) : (
                              <span className="status-sent" title="Sent">✓</span>
                            )}
                          </span>
                        )}
                      </div>

                      {isMine && !msg.isDeleted && (
                        <div className="message-actions">
                          <span onClick={() => editMessage(msg)}>Edit</span>
                          <span onClick={() => deleteMessage(msg._id)}>Delete</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {typingUser && (
              <div className="typing-indicator">{typingUser} is typing...</div>
            )}

            <div className="message-input-area">
              <input
                type="text"
                placeholder="Type a message"
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping(); }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>➤</button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <div>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
              <div style={{ fontSize: "20px", fontWeight: "500", color: "#41525d" }}>Welcome to Aditya Connect</div>
              <div style={{ fontSize: "14px", color: "#8696a0", marginTop: "8px" }}>Select a student to start chatting</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;