import { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";

export default function Composer() {
  const { sendMessage, sending } = useChat();
  const [value, setValue] = useState("");
  const taRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [value]);

  // Global keyboard shortcut: Cmd/Ctrl + / focuses input
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        taRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function submit() {
    const text = value.trim();
    if (!text || sending) return;
    setValue("");
    try {
      await sendMessage(text);
    } catch {
      // error already surfaced in context
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="chat__composer">
      <div className="composer">
        <textarea
          ref={taRef}
          className="composer__ta"
          placeholder="Ask anything…  (Enter to send · Shift+Enter for newline)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={sending}
        />
        <div className="composer__actions">
          <div className="composer__hint mono">
            ⌘/ to focus
          </div>
          <button
            className="btn btn--primary composer__send"
            onClick={submit}
            disabled={sending || !value.trim()}
          >
            {sending ? "Sending…" : "Send →"}
          </button>
        </div>
      </div>
      <div className="composer__foot mono">
        Genie can make mistakes. Verify important info.
      </div>
    </div>
  );
}