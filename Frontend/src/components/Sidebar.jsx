import { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const {
    chatList,
    activeChatId,
    selectChat,
    startNewChat,
    deleteChat,
    loadingChats,
  } = useChat();

  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const filtered = chatList.filter((c) =>
    (c.topic || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="sidebar">
      {/* --- Brand --- */}
      <div className="sidebar__brand">
  <div className="sidebar__brand-row">
    <Logo size={32} />
    <div className="sidebar__wordmark serif">
      genie<span className="accent">.</span>
    </div>
  </div>
  <div className="label sidebar__tag">A SUMMONING APP</div>
</div>

      {/* --- New chat --- */}
      <div className="sidebar__new">
      <button
  className="btn btn--primary sidebar__new-btn"
  onClick={() => {
    startNewChat();
    onNavigate?.();
  }}
>
  + New chat
</button>
      </div>

      {/* --- Search --- */}
      <div className="sidebar__search">
        <input
          className="input sidebar__search-input"
          placeholder="Search conversations…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* --- Chat list --- */}
      <nav className="sidebar__list">
        <div className="label sidebar__list-label">
          {query ? "RESULTS" : "RECENT"}
        </div>

        {loadingChats && (
          <div className="sidebar__empty mono">loading…</div>
        )}

        {!loadingChats && filtered.length === 0 && (
          <div className="sidebar__empty mono">
            {query ? "no matches" : "no conversations yet"}
          </div>
        )}

        {filtered.map((c) => (
          <div
            key={c._id}
            className={
              "sidebar__item" +
              (activeChatId === c._id ? " sidebar__item--active" : "")
            }
            onClick={() => selectChat(c._id)}
          >
            <div className="sidebar__item-text">
              <div className="sidebar__item-title">
                {c.topic || "Untitled"}
              </div>
              <div className="sidebar__item-meta mono">
                {new Date(c.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <button
              className="sidebar__item-del"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Delete this conversation?")) deleteChat(c._id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </nav>

      {/* --- User footer --- */}
      <div className="sidebar__user">
        <div className="rule--heavy" />
        <button
          className="sidebar__user-btn"
          onClick={() => setUserMenuOpen((v) => !v)}
        >
          <div className="sidebar__avatar serif">
            {(user?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.name || "User"}</div>
            <div className="sidebar__user-mail mono">
              {user?.email || ""}
            </div>
          </div>
          <div className="sidebar__user-chev">{userMenuOpen ? "▾" : "▸"}</div>
        </button>

        {userMenuOpen && (
          <div className="sidebar__menu fade-up">
            <div className="sidebar__menu-row mono">
              <span className="muted">Tokens used</span>
              <span>{user?.usage?.tokenUsed ?? 0}</span>
            </div>
            <div className="sidebar__menu-row mono">
              <span className="muted">Lifetime</span>
              <span>{user?.usage?.totalTokenUsed ?? 0}</span>
            </div>
            <div className="rule" />
            <button
              className="sidebar__menu-logout"
              onClick={async () => {
                if (confirm("Log out of Genie?")) await logout();
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}