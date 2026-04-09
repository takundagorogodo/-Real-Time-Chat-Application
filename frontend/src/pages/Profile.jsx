import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return <div className="loading">Loading...</div>;

  const getInitials = (name) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-avatar">
          {user.profilePicture
            ? <img src={user.profilePicture} alt="avatar" />
            : <span>{getInitials(user.name)}</span>
          }
        </div>

        <h2 className="profile-name">{user.name}</h2>
        <p className="profile-email">{user.email}</p>

        <div className="profile-badges">
          <span className="badge branch">{user.branch}</span>
          <span className="badge year">Year {user.year}</span>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">Roll Number</span>
            <span className="detail-value">{user.rollNumber}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Branch</span>
            <span className="detail-value">{user.branch}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Year of Study</span>
            <span className="detail-value">Year {user.year}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value email">{user.email}</span>
          </div>
        </div>

        <button className="back-btn" onClick={() => navigate("/chat")}>
          ← Back to Chat
        </button>

      </div>
    </div>
  );
};

export default Profile;