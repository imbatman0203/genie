export default function TypingIndicator() {
    return (
      <article className="msg msg--assistant fade-up">
        <div className="msg__meta">
          <span className="msg__role label">
            GENIE<span className="accent"> ●</span>
          </span>
          <span className="msg__time mono">summoning…</span>
        </div>
        <div className="msg__body">
          <div className="typing">
            <span className="typing__dot" />
            <span className="typing__dot" />
            <span className="typing__dot" />
          </div>
        </div>
      </article>
    );
  }