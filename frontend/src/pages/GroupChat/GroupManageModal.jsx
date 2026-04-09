import { useState } from "react";
import { useGroup } from "../../context/GroupContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Group.css";

export default function GroupManageModal({ onClose }) {
  const { activeGroup, addMember, kickMember, leaveGroup } = useGroup();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  const isAdmin =
    activeGroup.admin?._id === user._id || activeGroup.admin === user._id;

  const searchUsers = async (q) => {
    setSearch(q);
    if (q.length < 2) return setSearchResults([]);
    try {
      const { data } = await axios.get(`/api/users/search?q=${q}`);
      const memberIds = activeGroup.members.map((m) => m._id);
      setSearchResults(data.filter((u) => !memberIds.includes(u._id)));
    } catch {
      setSearchResults([]);
    }
  };

  const handleAdd = async (userId) => {
    try {
      await addMember(activeGroup._id, userId);
      setSearchResults((prev) => prev.filter((u) => u._id !== userId));
      setSearch("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member.");
    }
  };

  const handleKick = async (userId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      await kickMember(activeGroup._id, userId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member.");
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await leaveGroup(activeGroup._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave group.");
    }
  };

  return (
    <div className="gmm-overlay">
      <div className="gmm-modal">
        <div className="gmm-header">
          <div>
            <h2>{activeGroup.name}</h2>
            <span className="gmm-subtitle">
              {activeGroup.members.length} members
            </span>
          </div>
          <button className="gmm-close" onClick={onClose}>✕</button>
        </div>

        {error && <p className="gmm-error">{error}</p>}

        {/* Members list */}
        <h3 className="gmm-section-title">Members</h3>
        <ul className="gmm-members">
          {activeGroup.members.map((member) => {
            const isThisAdmin =
              member._id ===
              (activeGroup.admin?._id || activeGroup.admin);
            return (
              <li key={member._id} className="gmm-member-item">
                <div className="gmm-member-left">
                  <div className="gmm-member-avatar">
                    {member.username[0].toUpperCase()}
                  </div>
                  <span className="gmm-member-name">{member.username}</span>
                  {isThisAdmin && (
                    <span className="gmm-admin-badge">Admin</span>
                  )}
                </div>
                {isAdmin && !isThisAdmin && member._id !== user._id && (
                  <button
                    className="gmm-kick-btn"
                    onClick={() => handleKick(member._id)}
                  >
                    Kick
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Add member — admin only */}
        {isAdmin && (
          <>
            <h3 className="gmm-section-title">Add Member</h3>
            <input
              className="gmm-input"
              placeholder="Search by username…"
              value={search}
              onChange={(e) => searchUsers(e.target.value)}
            />
            {searchResults.length > 0 && (
              <ul className="gmm-search-results">
                {searchResults.map((u) => (
                  <li key={u._id} className="gmm-search-item">
                    <span>{u.username}</span>
                    <button
                      className="gmm-add-btn"
                      onClick={() => handleAdd(u._id)}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Leave group — non-admin only */}
        {!isAdmin && (
          <button className="gmm-leave-btn" onClick={handleLeave}>
            Leave Group
          </button>
        )}
      </div>
    </div>
  );
}