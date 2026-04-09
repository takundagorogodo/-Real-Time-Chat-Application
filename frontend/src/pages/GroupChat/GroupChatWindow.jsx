import { useEffect, useRef, useState } from "react";
import { useGroup } from "../../context/GroupContext";
import { useAuth } from "../../context/AuthContext";
import GroupManageModal from "./GroupManageModal";
import "./Group.css";

export default function GroupChatWindow() {
  const {
    activeGroup,
    messages,
    loadMessages,
    sendMessage,
    typing,
    emitTyping,
    emitStopTyping,
  } = useGroup();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [showManage, setShowManage] = useState(false);
  const bottomRef = useRef();
  const typingTimer = useRef();

  useEffect(() => {
    if (!activeGroup) return;
    loadMessages(activeGroup._id);
  }, [activeGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[activeGroup?._id]]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(activeGroup._id, text.trim());
    setText("");
    emitStopTyping(activeGroup._id);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    emitTyping(activeGroup._id);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(
      () => emitStopTyping(activeGroup._id),
      1500
    );
  };

  if (!activeGroup) {
    return (
      <div className="gcw-empty">
        <p>Select a group to start chatting</p>
      </div>
    );
  }

  const groupMessages = messages[activeGroup._id] || [];
  const typingUsers = (typing[activeGroup._id] || []).filter(
    (u) => u !== user.username
  );
  const isAdmin =
    activeGroup.admin?._id === user._id || activeGroup.admin === user._id;

  return (
    <div className="gcw-container">
      {/* Header */}
      <div className="gcw-header">
        <div className="gcw-header-info">
          <h2>{activeGroup.name}</h2>
          <span>{activeGroup.members.length} members</span>
        </div>
        <button className="gcw-manage-btn" onClick={() => setShowManage(true)}>
          {isAdmin ? "Manage" : "Members"}
        </button>
      </div>

      {/* Messages */}
      <div className="gcw-messages">
        {groupMessages.map((msg) => {
          const isMine =
            msg.sender._id === user._id || msg.sender === user._id;
          return (
            <div
              key={msg._id}
              className={`gcw-message-row ${isMine ? "mine" : "theirs"}`}
            >
              <div className="gcw-message-block">
                {!isMine && (
                  <p className="gcw-sender-name">{msg.sender.username}</p>
                )}
                <div className={`gcw-bubble ${isMine ? "mine" : "theirs"}`}>
                  {msg.content}
                </div>
                <p className={`gcw-time ${isMine ? "right" : "left"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <p className="gcw-typing">
            {typingUsers.join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="gcw-input-bar">
        <input
          className="gcw-input"
          placeholder={`Message ${activeGroup.name}…`}
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="gcw-send-btn" onClick={handleSend}>
          Send
        </button>
      </div>

      {showManage && (
        <GroupManageModal onClose={() => setShowManage(false)} />
      )}
    </div>
  );
}