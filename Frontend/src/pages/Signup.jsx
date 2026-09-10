import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    age: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    const ageNum = Number(form.age);
    if (form.age !== "" && !Number.isNaN(ageNum)) payload.age = ageNum;

    try {
      await signup(payload);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Signup failed");
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
    <div className="label">NEW ARRIVAL · MMXXV</div>
  </div>
          <h1 className="auth__wordmark serif">
            genie<span className="accent">.</span>
          </h1>
          <p className="auth__tagline">
            Your first wish is free.
          </p>
        </div>

        <div className="auth__manifesto">
          <div className="rule--heavy" />
          <p className="auth__manifesto-text">
            No credit card. No dark patterns. Just a{" "}
            <em className="accent">quiet interface</em> and a router to every
            serious AI model on the planet.
          </p>
          <div className="auth__ticker">
            <span className="label">10K TOKENS</span>
            <span className="mono"> ON THE HOUSE </span>
            <span className="label">·</span>
            <span className="mono"> NO CARD </span>
            <span className="label">·</span>
            <span className="mono"> CANCEL NEVER </span>
          </div>
        </div>

        <div className="auth__footer">
          <span className="mono">© 2025 · GENIE</span>
          <span className="mono">FORM 001-A</span>
        </div>
      </aside>

      {/* RIGHT — form panel */}
      <main className="auth__form-wrap">
        <form className="auth__form" onSubmit={onSubmit} autoComplete="off">
          <div className="auth__form-head">
            <div className="label">NEW USER REGISTRATION</div>
            <h2 className="serif auth__form-title">
              Begin<span className="accent">.</span>
            </h2>
          </div>

          <div className="rule--double" />

          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={update("name")}
              placeholder="what should we call you"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="age">Age (optional)</label>
            <input
              id="age"
              className="input"
              type="number"
              min="10"
              max="100"
              value={form.age}
              onChange={update("age")}
              placeholder="—"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@somewhere.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="8+ chars · Aa1! required"
              required
            />
          </div>

          {error && (
            <div className="auth__error mono" role="alert">
              ⚠ {error}
            </div>
          )}

          <button className="btn btn--primary auth__submit" disabled={busy}>
            {busy ? "Preparing…" : "Summon Genie →"}
          </button>

          <div className="auth__switch">
            <span className="muted">Already have an account?</span>{" "}
            <Link to="/login" className="auth__link">
              Sign in
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