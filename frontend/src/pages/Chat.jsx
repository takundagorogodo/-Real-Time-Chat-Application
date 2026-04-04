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
        console.log("Fetching users...");
        const res = await axios.get("/users");
        console.log("Users fetched:", res.data);
        setUsers(res.data.filter(u => u._id !== user?.id));
      } catch (err) {
        console.error("Failed to load users", err.response?.data || err.message);
      }
    };
    
    if (user) {
      fetchUsers();
    }
  }, [user]);


  useEffect(() => {
    if (!socket) {
      console.log("Socket not available yet");
      return;
    }

    console.log("Setting up socket listeners");

  
    socket.on("receive_private_message", (message) => {
      console.log("Received message:", message);
      
    
      const processedMessage = {
        ...message,
        senderId: typeof message.senderId === 'object' ? message.senderId._id : message.senderId
      };
      
      if (processedMessage.roomId === currentRoom) {
        setMessages(prev => [...prev, processedMessage]);
      }
    });

   
    socket.on("message_edited", (updatedMessage) => {
      console.log("Message edited:", updatedMessage);
      const processedMessage = {
        ...updatedMessage,
        senderId: typeof updatedMessage.senderId === 'object' ? updatedMessage.senderId._id : updatedMessage.senderId
      };
      
      setMessages(prev =>
        prev.map(msg => (msg._id === processedMessage._id ? processedMessage : msg))
      );
    });

    
    socket.on("message_deleted", ({ messageId }) => {
      console.log("Message deleted:", messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, isDeleted: true, content: null } : msg
        )
      );
    });

  
    socket.on("message_status_update", (update) => {
      console.log("Message status update:", update);
      setMessages(prev =>
        prev.map(msg =>
          msg._id === update.messageId ? { ...msg, ...update } : msg
        )
      );
    });

  
    socket.on("user_typing", ({ userId, username }) => {
      console.log("User typing:", username);
      if (userId !== user?.id) {
        setTypingUser(username);
      }
    });

    socket.on("user_stop_typing", ({ userId }) => {
      console.log("User stopped typing:", userId);
      setTypingUser(null);
    });

    
    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("receive_private_message");
      socket.off("message_edited");
      socket.off("message_deleted");
      socket.off("message_status_update");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, currentRoom, user?.id]);

  // Join room when currentRoom changes
  useEffect(() => {
    if (socket && currentRoom) {
      console.log("Joining room:", currentRoom);
      socket.emit("join_room", currentRoom);
    }
  }, [socket, currentRoom]);

  const startChat = async (otherUserId) => {
    try {
      console.log("Starting chat with user:", otherUserId);
      console.log("Current user:", user);
      
      if (!user || !user.id) {
        console.error("No user found");
        return;
      }
      
      // Get or create private room
      const res = await axios.get(`/rooms/private/${otherUserId}`);
      console.log("Room response:", res.data);
      
      const room = res.data;
      setCurrentRoom(room._id);
      
      const selectedUser = users.find(u => u._id === otherUserId);
      console.log("Selected user:", selectedUser);
      setCurrentChatUser(selectedUser);

      // Load messages for this room
      console.log("Loading messages for room:", room._id);
      const msgRes = await axios.get(`/messages/${room._id}`);
      console.log("Messages loaded:", msgRes.data);
      setMessages(msgRes.data); // Already reversed from backend

      // Mark messages as seen when opening chat
      if (socket) {
        console.log("Marking messages as seen in room:", room._id);
        socket.emit("mark_seen", room._id);
      }
    } catch (err) {
      console.error("Failed to start chat:", err.response?.data || err.message);
      alert("Failed to start chat. Check console for details.");
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !currentChatUser || !socket) {
      console.log("Cannot send message:", { text, currentChatUser, socket });
      return;
    }

    console.log("Sending message to:", currentChatUser._id, "content:", text);
    
    socket.emit("private_message", {
      receiverId: currentChatUser._id,
      content: text,
      messageType: "text"
    });

    setText("");
    // Stop typing
    socket.emit("typing_stop", currentRoom);
  };

  const editMessage = (message) => {
    const newContent = prompt("Edit message:", message.content);
    if (newContent && newContent !== message.content && socket) {
      console.log("Editing message:", message._id, "new content:", newContent);
      socket.emit("edit_message", {
        messageId: message._id,
        newContent
      });
    }
  };

  const deleteMessage = (messageId) => {
    if (window.confirm("Delete this message?") && socket) {
      console.log("Deleting message:", messageId);
      socket.emit("delete_message", { messageId });
    }
  };

  const handleTyping = () => {
    if (!typing && socket && currentRoom) {
      setTyping(true);
      socket.emit("typing_start", currentRoom);
    }

    // Stop typing after 2 seconds of no input
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      if (typing) {
        setTyping(false);
        if (socket && currentRoom) {
          socket.emit("typing_stop", currentRoom);
        }
      }
    }, 2000);
  };


  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      if (socket) {
        socket.disconnect();
      }
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="chat-container">
      {/* Sidebar - Users List */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Chats</h3>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
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
                <div className="user-avatar">
                  {getInitials(u.username)}
                </div>
                <div className="user-info">
                  <div className="user-name">
                    {u.username}
                    {u.status === "online" && <span className="online-dot">●</span>}
                  </div>
                  <div className="user-status">
                    {u.status === "online" ? "online" : "offline"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-area">
        {currentChatUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-user-avatar">
                  {getInitials(currentChatUser.username)}
                </div>
                <div className="chat-user-details">
                  <h4>{currentChatUser.username}</h4>
                  <span>{currentChatUser.status === "online" ? "online" : "offline"}</span>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  No messages yet. Start chatting!
                </div>
              ) : (
                messages.map((msg) => {
                  // Ensure senderId is a string for comparison
                  const senderId = typeof msg.senderId === 'object' 
                    ? msg.senderId?._id 
                    : msg.senderId;
                  const isMine = senderId === user?.id;
                  
                  const date = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={msg._id}
                      className={`message-wrapper ${isMine ? "mine" : "other"}`}
                    >
                      <div className="message-bubble">
                        {msg.isDeleted ? (
                          <span className="deleted-message">This message was deleted</span>
                        ) : (
                          <>
                            {msg.content}
                            {msg.isEdited && (
                              <span className="edited-indicator">edited</span>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="message-footer">
                        <span className="message-time">{date}</span>
                        
                        {/* Status indicators for my messages */}
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

                      {/* Edit/Delete buttons for my messages */}
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

            {/* Typing Indicator */}
            {typingUser && (
              <div className="typing-indicator">
                {typingUser} is typing...
              </div>
            )}

            {/* Message Input */}
            <div className="message-input-area">
              <input
                type="text"
                placeholder="Type a message"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>➤</button>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;