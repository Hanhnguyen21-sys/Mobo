import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();

  const [plantCount, setPlantCount] = useState(0);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [rewardCount, setRewardCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    profile_image_url: user?.profile_image_url || "",
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const plantsData = await apiRequest("/user-plants");
        setPlantCount(plantsData.plants.length);

        const postsData = await apiRequest("/posts/me");
        setReflectionCount(postsData.posts.length);

        const rewardsData = await apiRequest("/rewards/me");
        setRewardCount(rewardsData.rewards.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }
  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  }
  async function handleSaveProfile(event) {
    event.preventDefault();
    setError("");

    setSaving(true);

    try {
      await updateProfile(profileForm);

      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell profile-page">
      <section className="profile-header card">
        <div className="profile-avatar">
          {user?.profile_image_url ? (
            <img src={user.profile_image_url} alt={user.username} />
          ) : (
            user?.username?.charAt(0).toUpperCase() || "M"
          )}
        </div>

        <div>
          <p className="eyebrow">Profile</p>
          <h1>{user?.username}</h1>
          <p>{user?.email}</p>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      <section className="profile-stats">
        <article className="card stat-card">
          <span>🌱</span>
          <strong>{loadingStats ? "..." : plantCount}</strong>
          <p>Plants</p>
        </article>

        <article className="card stat-card">
          <span>📝</span>
          <strong>{loadingStats ? "..." : reflectionCount}</strong>
          <p>Reflections</p>
        </article>

        <article className="card stat-card">
          <span>🏅</span>
          <strong>{loadingStats ? "..." : rewardCount}</strong>
          <p>Rewards</p>
        </article>
      </section>

      <section className="card settings-card">
        <div className="section-row">
          {!editing && (
            <button
              className="btn btn-secondary edit-profile-button"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit profile
            </button>
          )}
        </div>

        {editing ? (
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <label>
              Username
              <input
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
              />
            </label>

            <label>
              Profile image URL
              <input
                name="profile_image_url"
                value={profileForm.profile_image_url}
                onChange={handleProfileChange}
                placeholder="Optional image link"
              />
            </label>

            <div className="profile-form-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save profile"}
              </button>

              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setEditing(false);
                  setProfileForm({
                    username: user?.username || "",
                    profile_image_url: user?.profile_image_url || "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="btn btn-accent"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </section>
    </main>
  );
}
