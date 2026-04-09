import { useState } from "react";
import { useGroup } from "../../context/GroupContext";
import axios from "axios";
import "./Group.css";

export default function CreateGroupModal({ onClose }) {
  const { createGroup } = useGroup();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchUsers = async (q) => {
    setSearch(q);
    if (q.length < 2) return setResults([]);
    try {
      const { data } = await axios.get(`/api/users/search?q=${q}`);
      setResults(data.filter((u) => !selected.find((s) => s._id === u._id)));
    } catch {
      setResults([]);
    }
  };

  const toggleUser = (u) => {
    setSelected((prev) =>
      prev.find((s) => s._id === u._id)
        ? prev.filter((s) => s._id !== u._id)
        : [...prev, u]
    );
    setResults((prev) => prev.filter((r) => r._id !== u._id));
    setSearch("");
  };

  const removeSelected = (id) => {
    setSelected((prev) => prev.filter((s) => s._id !== id));
  };

  const handleCreate = async () => {
    if (!name.trim()) return setError("Group name is required.");
    setError("");
    setLoading(true);
    try {
      await createGroup({
        name,
        description,
        members: selected.map((u) => u._id),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cgm-overlay">
      <div className="cgm-modal">
        <div className="cgm-header">
          <h2>Create Group</h2>
          <button className="cgm-close" onClick={onClose}>✕</button>
        </div>

        {error && <p className="cgm-error">{error}</p>}

        <label className="cgm-label">Group Name *</label>
        <input
          className="cgm-input"
          placeholder="Enter group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="cgm-label">Description</label>
        <input
          className="cgm-input"
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="cgm-label">Add Members</label>
        <input
          className="cgm-input"
          placeholder="Search by username…"
          value={search}
          onChange={(e) => searchUsers(e.target.value)}
        />

        {results.length > 0 && (
          <ul className="cgm-results">
            {results.map((u) => (
              <li key={u._id} className="cgm-result-item">
                <span>{u.username}</span>
                <button className="cgm-add-btn" onClick={() => toggleUser(u)}>
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected.length > 0 && (
          <div className="cgm-selected">
            {selected.map((u) => (
              <span key={u._id} className="cgm-tag">
                {u.username}
                <button onClick={() => removeSelected(u._id)}>✕</button>
              </span>
            ))}
          </div>
        )}

        <button
          className="cgm-submit"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating…" : "Create Group"}
        </button>
      </div>
    </div>
  );
}