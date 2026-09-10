import { useState, useMemo, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

export default function ChatHeader({ onMenuClick }) {
  const { user } = useAuth();
  const {
    availableModels,
    selectedModel,
    setSelectedModel,
    activeChatId,
    chatList,
    deleteChat,
  } = useChat();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const activeChat = useMemo(
    () => chatList.find((c) => c._id === activeChatId),
    [chatList, activeChatId]
  );

  const currentModelId = activeChat?.model || selectedModel;

  const currentModel = useMemo(
    () => availableModels.find((m) => m.id === currentModelId),
    [availableModels, currentModelId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return availableModels.slice(0, 80);
    return availableModels
      .filter(
        (m) =>
          m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      )
      .slice(0, 80);
  }, [availableModels, query]);

  function pick(id) {
    setSelectedModel(id);
    setOpen(false);
    setQuery("");
  }

  const tokensUsed = user?.usage?.tokenUsed ?? 0;

  return (
    <header className="chat__header">
      <button
        className="chat__hamburger"
        onClick={onMenuClick}
        aria-label="Open conversations"
        type="button"
      >
        ☰
      </button>

      {/* --- Model selector --- */}
      <div className="model-picker" ref={wrapRef}>
        <button
          className="model-picker__btn"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="model-picker__label">
            <span className="label">MODEL</span>
            <span className="model-picker__name mono">
              {currentModel?.name || currentModelId || "select"}
            </span>
          </div>
          <span className="model-picker__chev mono">
            {open ? "▴" : "▾"}
          </span>
        </button>

        {open && (
          <div className="model-picker__panel fade-up">
            <div className="model-picker__search">
              <input
                className="input"
                placeholder="Search 300+ models…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="rule" />
            <ul className="model-picker__list">
              {filtered.map((m) => (
                <li
                  key={m.id}
                  className={
                    "model-picker__item" +
                    (m.id === currentModelId ? " model-picker__item--active" : "")
                  }
                  onClick={() => pick(m.id)}
                >
                  <div className="model-picker__item-name mono">{m.name}</div>
                  <div className="model-picker__item-id mono muted">
                    {m.id}
                  </div>
                  {m.context && (
                    <div className="model-picker__item-ctx mono">
                      {Math.round(m.context / 1000)}K ctx
                    </div>
                  )}
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="model-picker__item mono muted">no matches</li>
              )}
            </ul>
            <div className="model-picker__foot mono">
              showing {filtered.length} / {availableModels.length}
            </div>
          </div>
        )}
      </div>

      {/* --- Right side: actions + token meter --- */}
      <div className="chat__header-right">
        {activeChatId && (
          <button
            className="btn btn--icon chat__delete-btn"
            title="Delete this conversation"
            onClick={() => {
              if (confirm("Delete this conversation permanently?")) {
                deleteChat(activeChatId);
              }
            }}
            type="button"
          >
            ×
          </button>
        )}
        <div className="token-meter">
          <div className="label">TOKENS</div>
          <div className="token-meter__num mono">
            {tokensUsed.toLocaleString()}
            <span className="muted"> / 10K</span>
          </div>
          <div className="token-meter__bar">
            <div
              className="token-meter__fill"
              style={{ width: `${Math.min(100, (tokensUsed / 10000) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}