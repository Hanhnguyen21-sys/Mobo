import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register, logout, user } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await register(formData);
      navigate("/plants");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <div className="auth-heading">
          <span className="auth-icon">🌱</span>
          <h1>Create your Mobo account</h1>
          <p>Start growing your first reflection plant.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Username
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="mobo_friend"
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn btn-primary" type="submit">
            Create account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
