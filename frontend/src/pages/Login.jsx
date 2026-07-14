import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
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
      await login(formData);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <div className="auth-heading">
          <span className="auth-icon">🌿</span>
          <h1>Welcome back</h1>
          <p>Check in with your plant and your day.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
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
              placeholder="Your password"
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>

        <p className="auth-switch">
          New to Mobo? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
