import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || "/";

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      {/* LEFT — brand panel */}
      <aside className="auth__brand">
      <div className="auth__brand-top">
  <div className="auth__crest-row">
    <Logo size={22} />
    <div className="label">EST. MMXXVI · A SUMMONING APP</div>
  </div>
          <h1 className="auth__wordmark serif">
            genie<span className="accent">.</span>
          </h1>
          <p className="auth__tagline">
            Ask once. Any model answers.
          </p>
        </div>

        <div className="auth__manifesto">
          <div className="rule--heavy" />
          <p className="auth__manifesto-text">
            One interface. Every frontier model —{" "}
            <em className="accent">Claude</em>,{" "}
            <em className="accent">GPT</em>,{" "}
            <em className="accent">Gemini</em>,{" "}
            <em className="accent">Llama</em>. Route your thoughts through the
            right brain, not the loudest one.
          </p>
          <div className="auth__ticker">
            <span className="label">LIVE MODELS</span>
            <span className="mono"> 300+ </span>
            <span className="label">·</span>
            <span className="mono"> 5 PROVIDERS </span>
            <span className="label">·</span>
            <span className="mono"> 1 CONVERSATION </span>
          </div>
        </div>

        <div className="auth__footer">
          <span className="mono">© 2026 · GENIE</span>
          <span className="mono">NO. 001</span>
        </div>
      </aside>

      {/* RIGHT — form panel */}
      <main className="auth__form-wrap">
        <form className="auth__form" onSubmit={onSubmit} autoComplete="off">
          <div className="auth__form-head">
            <div className="label">RETURNING USER</div>
            <h2 className="serif auth__form-title">
              Sign in<span className="accent">.</span>
            </h2>
          </div>

          <div className="rule--double" />

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@somewhere.com"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="auth__error mono" role="alert">
              ⚠ {error}
            </div>
          )}

          <button className="btn btn--primary auth__submit" disabled={busy}>
            {busy ? "Summoning…" : "Enter Genie →"}
          </button>

          <div className="auth__switch">
            <span className="muted">No account?</span>{" "}
            <Link to="/signup" className="auth__link">
              Create one
            </Link>
          </div>
        </form>

        <div className="auth__form-foot mono">
          <span>Secure session · httpOnly cookie</span>
          <span>v0.1</span>
        </div>
      </main>
    </div>
  );
}