import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-layout">
      <header className="topbar">
        <Link className="brand" to="/home">
          <span aria-hidden="true">🌱</span>
          Mobo
        </Link>

        <nav className="topnav" aria-label="Main navigation">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/plants">Plants</NavLink>
          <NavLink to="/new-reflection">Reflect</NavLink>
          <NavLink to="/reflections">Journal</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <button type="button" className="nav-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Mobile navigation">
        <NavLink to="/home">
          <span aria-hidden="true">⌂</span>
          Home
        </NavLink>

        <NavLink to="/plants">
          <span aria-hidden="true">♧</span>
          Plants
        </NavLink>

        <NavLink to="/new-reflection">
          <span aria-hidden="true">＋</span>
          Reflect
        </NavLink>

        <NavLink to="/reflections">
          <span aria-hidden="true">☰</span>
          Journal
        </NavLink>
        <NavLink to="/profile">
          <span>●</span>
          Profile
        </NavLink>
      </nav>
    </div>
  );
}
