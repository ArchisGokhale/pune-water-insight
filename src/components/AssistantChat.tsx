import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Droplets, Send, MessageCircle, X, Loader2, RotateCcw } from "lucide-react";

const STORAGE_KEY = "pune-water-assistant-v1";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UIMessage[];
  } catch {
    return [];
  }
}

const SUGGESTIONS = [
  "How bad is Pune's water crisis right now?",
  "What's the schedule for Kothrud?",
  "Will there be water cuts tomorrow?",
  "Which dam is doing the worst?",
];

const transport = new DefaultChatTransport({ api: "/api/chat" });

function AssistantPanel({ onClose }: { onClose: () => void }) {
  const [initial] = useState<UIMessage[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "pune-water-assistant",
    messages: initial,
    transport,
  });

  // Persist messages to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* quota — ignore */
    }
  }, [messages]);

  // Autoscroll + autofocus
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isLoading = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || isLoading) return;
    sendMessage({ text: t });
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end bg-background/40 backdrop-blur-sm sm:p-6">
      <div className="glass-strong flex h-full w-full flex-col rounded-none border-l border-border sm:h-[640px] sm:max-h-[85vh] sm:w-[440px] sm:rounded-3xl sm:border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <div className="flex items-center gap-3">
            <div className="grad-aqua flex h-9 w-9 items-center justify-center rounded-xl glow">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-display text-sm font-bold leading-tight">Pune Water Assistant</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Grounded on live data</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setMessages([]); window.localStorage.removeItem(STORAGE_KEY); }}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Reset conversation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center pt-8 text-center">
              <div className="grad-aqua flex h-14 w-14 items-center justify-center rounded-2xl glow">
                <Droplets className="h-7 w-7 text-white" />
              </div>
              <div className="mt-4 font-display text-lg font-bold">Ask about Pune's water</div>
              <div className="mt-1 max-w-xs text-xs text-muted-foreground">
                Dam levels, ward supply schedules, monsoon outlook — answered from live data.
              </div>
              <div className="mt-5 grid w-full gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-xl border border-border/60 bg-card/40 px-3 py-2 text-left text-xs hover:border-aqua/40 hover:bg-card/70 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="mr-2 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-aqua/15 text-aqua">
                    <Droplets className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/60 bg-card/60 text-foreground"
                }`}>
                  {text || (isUser ? "" : <span className="text-muted-foreground">…</span>)}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error.message || "Something went wrong. Try again."}
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); submit(input); }}
          className="border-t border-border/60 p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card/60 p-2 focus-within:border-aqua/60">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); }
              }}
              rows={1}
              placeholder="Ask about dams, wards, monsoon…"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="grad-aqua flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-1.5 px-1 text-[10px] text-muted-foreground">
            AI · grounded on live PMC/WRD/IMD data · may be inaccurate
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 grad-aqua flex h-14 items-center gap-2 rounded-full pl-3 pr-5 text-sm font-semibold text-white shadow-xl shadow-aqua/30 transition hover:scale-105"
        title="Ask the Pune Water Assistant"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <MessageCircle className="h-5 w-5" />
        </span>
        Ask about Pune water
      </button>
      {open && <AssistantPanel onClose={() => setOpen(false)} />}
    </>
  );
}
