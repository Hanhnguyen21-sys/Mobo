import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

export default function Reflections() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [postToDelete, setPostToDelete] = useState(null);
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await apiRequest("/posts/me");
        setPosts(data.posts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  async function handleDeletePost() {
    if (!postToDelete) return;

    setError("");
    setDeletingId(postToDelete.id);

    try {
      await apiRequest(`/posts/${postToDelete.id}`, {
        method: "DELETE",
      });

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postToDelete.id),
      );

      setPostToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <section className="card">
          <p>Loading journal...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shell">
        <section className="card">
          <p className="error">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell journal-page">
      <section className="journal-heading">
        <div>
          <p className="eyebrow">Journal</p>
          <h1>Your reflections</h1>
          <p>Look back at the small moments that helped your plant grow.</p>
        </div>

        <Link className="btn btn-primary" to="/new-reflection?care=care">
          New reflection
        </Link>
      </section>

      {posts.length === 0 ? (
        <section className="card empty-journal-card">
          <h2>No reflections yet</h2>
          <p>Write your first reflection to start growing your plant.</p>
          <Link className="btn btn-primary" to="/new-reflection?care=care">
            Write reflection
          </Link>
        </section>
      ) : (
        <section className="journal-list">
          {posts.map((post) => (
            <article className="card journal-card" key={post.id}>
              <button
                className="delete-post-button"
                type="button"
                aria-label="Delete reflection"
                disabled={deletingId === post.id}
                onClick={() => setPostToDelete(post)}
              >
                ×
              </button>

              <div className="journal-card-header">
                <div>
                  <span className="journal-emotion">
                    {post.emotion?.icon || "✨"}
                  </span>
                  <strong>{post.emotion?.name || "Reflection"}</strong>
                </div>

                <span className="points-badge">+{post.points_earned} pts</span>
              </div>

              <p className="journal-content">{post.content}</p>

              {post.image_url && (
                <img
                  className="journal-image"
                  src={post.image_url}
                  alt="Reflection"
                />
              )}

              <div className="journal-meta">
                <span>{new Date(post.created_at).toLocaleString()}</span>
                <span>{post.visibility}</span>
              </div>
            </article>
          ))}
        </section>
      )}
      {postToDelete && (
        <div className="modal-backdrop">
          <section className="delete-modal card">
            <div className="modal-icon">📝</div>
            <h2>Delete this reflection?</h2>
            <p>
              This journal entry will be removed from your reflection history.
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setPostToDelete(null)}
              >
                Keep reflection
              </button>

              <button
                className="btn btn-danger"
                type="button"
                disabled={deletingId === postToDelete.id}
                onClick={handleDeletePost}
              >
                {deletingId === postToDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
