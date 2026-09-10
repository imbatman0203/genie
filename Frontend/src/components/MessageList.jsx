import { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList() {
  const { messagesList, loadingMessages, sending, error } = useChat();
  const bottomRef = useRef(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    if (messagesList.length !== lastCountRef.current) {
      lastCountRef.current = messagesList.length;
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messagesList.length]);

  useEffect(() => {
    if (sending) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [sending]);

  if (loadingMessages) {
    return (
      <div className="chat__messages">
        <div className="label" style={{ textAlign: "center", padding: 40 }}>
          LOADING CONVERSATION…
        </div>
      </div>
    );
  }

  return (
    <div className="chat__messages">
      {error && (
        <div className="msg-error mono">⚠ {error}</div>
      )}
      {messagesList.map((m) => (
        <MessageBubble key={m._id} message={m} />
      ))}
      {sending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}