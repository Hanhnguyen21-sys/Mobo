import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="shell">
      <section className="card">
        <h1>Page not found</h1>
        <p>This page does not exist.</p>
        <Link className="btn btn-primary" to="/home">
          Go home
        </Link>
      </section>
    </main>
  );
}
