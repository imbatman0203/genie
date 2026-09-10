import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const codeEl = children;
  const cls = codeEl?.props?.className || "";
  const match = /language-(\w+)/.exec(cls);
  const lang = match ? match[1] : "code";

  async function copy() {
    const text = ref.current?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="codeblock">
      <div className="codeblock__head">
        <span className="codeblock__lang mono">{lang}</span>
        <button className="codeblock__copy mono" onClick={copy} type="button">
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <pre ref={ref}>{codeEl}</pre>
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <article className={`msg msg--${isUser ? "user" : "assistant"} fade-up`}>
      <div className="msg__meta">
        <span className="msg__role label">
          {isUser ? (
            "YOU"
          ) : (
            <>
              GENIE<span className="accent"> ●</span>
            </>
          )}
        </span>
        <span className="msg__time mono">{time}</span>

        <div className="msg__actions">
          <button
            className="msg__action mono"
            onClick={copyMessage}
            type="button"
            title="Copy message"
          >
            {copied ? "copied ✓" : "copy"}
          </button>
        </div>
      </div>

      <div className="msg__body">
        {isUser ? (
          <p className="msg__text">{message.content}</p>
        ) : (
          <div className="md">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </article>
  );
}