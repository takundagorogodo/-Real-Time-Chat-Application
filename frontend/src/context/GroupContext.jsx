import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "../api/axios"; // ✅ custom instance with token — NOT plain axios
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const GroupContext = createContext();
export const useGroup = () => useContext(GroupContext);

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState({});
  const [typing, setTyping] = useState({});
  const { socket } = useSocket();
  const { user } = useAuth();

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    if (!user) return; // ✅ guard: don't run if not logged in
    try {
      const { data } = await axios.get("/groups");
      setGroups(data);
      if (socket) socket.emit("join_groups", user._id);
    } catch (err) {
      console.error("Failed to fetch groups:", err.response?.data || err.message);
    }
  }, [socket, user]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("group_message", (msg) => {
      setMessages((prev) => ({
        ...prev,
        [msg.groupId]: [...(prev[msg.groupId] || []), msg],
      }));
      setGroups((prev) => {
        const updated = prev.find((g) => g._id === msg.groupId);
        if (!updated) return prev;
        return [updated, ...prev.filter((g) => g._id !== msg.groupId)];
      });
    });

    socket.on("group_typing", ({ groupId, username }) => {
      setTyping((prev) => ({
        ...prev,
        [groupId]: [...new Set([...(prev[groupId] || []), username])],
      }));
    });

    socket.on("group_stop_typing", ({ groupId }) => {
      setTyping((prev) => {
        const updated = { ...prev };
        delete updated[groupId];
        return updated;
      });
    });

    socket.on("member_kicked", ({ groupId, kickedUserId }) => {
      if (kickedUserId === user._id) {
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        if (activeGroup?._id === groupId) setActiveGroup(null);
      }
    });

    return () => {
      socket.off("group_message");
      socket.off("group_typing");
      socket.off("group_stop_typing");
      socket.off("member_kicked");
    };
  }, [socket, user, activeGroup]);

  // Load messages for a group
  const loadMessages = async (groupId) => {
    if (messages[groupId]) return;
    try {
      const { data } = await axios.get(`/groups/${groupId}/messages`);
      setMessages((prev) => ({ ...prev, [groupId]: data }));
    } catch (err) {
      console.error("Failed to load messages:", err.response?.data || err.message);
    }
  };

  // Send message
  const sendMessage = (groupId, content) => {
    if (!socket) return;
    socket.emit("group_message", { groupId, senderId: user._id, content });
  };

  // Create group
  const createGroup = async (payload) => {
    const { data } = await axios.post("/groups", payload);
    setGroups((prev) => [data, ...prev]);
    if (socket) socket.emit("join_group", data._id);
    return data;
  };

  // Add member
  const addMember = async (groupId, userId) => {
    const { data } = await axios.post(`/groups/${groupId}/members`, { userId });
    setGroups((prev) => prev.map((g) => (g._id === groupId ? data : g)));
    if (activeGroup?._id === groupId) setActiveGroup(data);
  };

  // Kick member
  const kickMember = async (groupId, userId) => {
    const { data } = await axios.delete(`/groups/${groupId}/members/${userId}`);
    setGroups((prev) => prev.map((g) => (g._id === groupId ? data : g)));
    if (activeGroup?._id === groupId) setActiveGroup(data);
    if (socket) socket.emit("admin_kicked_member", { groupId, kickedUserId: userId });
  };

  // Leave group
  const leaveGroup = async (groupId) => {
    await axios.post(`/groups/${groupId}/leave`);
    setGroups((prev) => prev.filter((g) => g._id !== groupId));
    if (activeGroup?._id === groupId) setActiveGroup(null);
  };

  const emitTyping = (groupId) => {
    if (socket) socket.emit("group_typing", { groupId, userId: user._id, username: user.username });
  };

  const emitStopTyping = (groupId) => {
    if (socket) socket.emit("group_stop_typing", { groupId, userId: user._id });
  };

  return (
    <GroupContext.Provider value={{
      groups, activeGroup, setActiveGroup,
      messages, typing, loadMessages,
      sendMessage, createGroup,
      addMember, kickMember, leaveGroup,
      emitTyping, emitStopTyping, fetchGroups,
    }}>
      {children}
    </GroupContext.Provider>
  );
};