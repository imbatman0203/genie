export default function EmptyState() {
    return (
      <div className="center grow">
        <div style={{ textAlign: "center", maxWidth: 520 }}>
          <div className="label" style={{ marginBottom: 16 }}>NO CONVERSATION SELECTED</div>
          <h2 className="serif" style={{ fontSize: 44, fontStyle: "italic", lineHeight: 1.1 }}>
            Summon your first <span className="accent">thought</span>.
          </h2>
          <p className="mono muted" style={{ marginTop: 20, fontSize: 13 }}>
            Pick a model above. Type below. Watch it appear.
          </p>
        </div>
      </div>
    );
  }