import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ResultsContext {
  certificationCode: string;
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  topicBreakdown: { topic: string; percentage: number }[];
  weakTopics: string[];
}

interface EzzyChatProps {
  examMode?: boolean;
  certificationCode?: string;
  resultsContext?: ResultsContext;
}

const DEFAULT_SUGGESTIONS = [
  "What is Azure VNet?",
  "Difference between RBAC and Azure Policy?",
  "Which cert should I start with?",
  "How does Azure Storage replication work?",
];

function getResultsSuggestions(ctx: ResultsContext): string[] {
  const suggestions = [
    `Why did I score ${ctx.score}% on ${ctx.certificationCode}? What should I focus on?`,
    `Explain my weak areas: ${ctx.weakTopics.slice(0, 2).join(" and ")}`,
    `Create a 2-week study plan for my ${ctx.certificationCode} weak topics`,
  ];
  if (!ctx.passed) {
    suggestions.push(`What's the fastest path to passing ${ctx.certificationCode}?`);
  } else {
    suggestions.push(`What certification should I take after passing ${ctx.certificationCode}?`);
  }
  return suggestions;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <p className="font-bold text-base mt-2 mb-1">{children}</p>,
        h2: ({ children }) => <p className="font-bold text-sm mt-2 mb-1">{children}</p>,
        h3: ({ children }) => <p className="font-semibold text-sm mt-2 mb-1 text-primary/90">{children}</p>,
        p: ({ children }) => <p className="my-1 leading-relaxed text-sm">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
        ul: ({ children }) => <ul className="my-1.5 space-y-0.5 pl-1">{children}</ul>,
        ol: ({ children }) => <ol className="my-1.5 space-y-0.5 pl-1 list-decimal list-inside">{children}</ol>,
        li: ({ children }) => (
          <li className="text-sm flex items-start gap-1.5">
            <span className="text-primary mt-1 shrink-0">•</span>
            <span>{children}</span>
          </li>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <code className="block bg-black/30 rounded-lg p-2 text-xs font-mono my-1.5 overflow-x-auto">{children}</code>
          ) : (
            <code className="bg-black/30 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
          );
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/50 pl-3 my-1.5 text-muted-foreground italic text-sm">{children}</blockquote>
        ),
        hr: () => <hr className="border-white/10 my-2" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function EzzyChat({ examMode = false, certificationCode, resultsContext }: EzzyChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !examMode) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, examMode]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || examMode) return;

    const userMessage: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextPayload: any = { certificationCode: certificationCode || resultsContext?.certificationCode };
      if (resultsContext) {
        contextPayload.resultsContext = {
          score: resultsContext.score,
          passed: resultsContext.passed,
          correctCount: resultsContext.correctCount,
          totalCount: resultsContext.totalCount,
          weakTopics: resultsContext.weakTopics,
          topicBreakdown: resultsContext.topicBreakdown,
        };
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history,
          context: contextPayload,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an issue connecting to the AI. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, examMode, messages, certificationCode, resultsContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] flex flex-col rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
            style={{ background: "hsl(var(--card))" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-primary/20 to-purple-600/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-card"></span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Ezzy</p>
                  <p className="text-xs text-muted-foreground">Azure AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                    title="Clear chat"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {examMode ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-destructive" />
                </div>
                <p className="font-semibold text-sm">Ezzy is disabled</p>
                <p className="text-xs text-muted-foreground">
                  Ezzy is not available during exam simulation to preserve exam integrity. Switch to Practice mode to get AI assistance.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: "420px" }}>
                  {messages.length === 0 && showSuggestions && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%]">
                          {resultsContext ? (
                            <>
                              <p className="leading-relaxed">
                                I've reviewed your <strong>{resultsContext.certificationCode}</strong> results ({resultsContext.score}%). Let me help you improve! 🎯
                              </p>
                              <p className="text-muted-foreground mt-1.5 text-xs">
                                Ask me about your weak areas, study strategies, or next steps.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="leading-relaxed">
                                Hi! I'm <strong>Ezzy</strong>, your Azure certification expert. 🎯
                              </p>
                              <p className="text-muted-foreground mt-1.5 text-xs">
                                Ask me anything about Azure services, exam strategies, or certification paths.
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground px-1">
                          {resultsContext ? "Ask about your results:" : "Try asking:"}
                        </p>
                        {(resultsContext ? getResultsSuggestions(resultsContext) : DEFAULT_SUGGESTIONS).map((q) => (
                          <button
                            key={q}
                            onClick={() => sendMessage(q)}
                            className="w-full text-left text-xs px-3 py-2.5 rounded-xl border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex items-start gap-2.5", msg.role === "user" && "flex-row-reverse")}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        msg.role === "assistant"
                          ? "bg-gradient-to-br from-primary to-cyan-400"
                          : "bg-white/10"
                      )}>
                        {msg.role === "assistant"
                          ? <Sparkles className="w-3.5 h-3.5 text-white" />
                          : <User className="w-3.5 h-3.5 text-muted-foreground" />
                        }
                      </div>

                      <div className={cn(
                        "rounded-2xl px-4 py-3 text-sm max-w-[85%]",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-white/5 rounded-tl-sm"
                      )}>
                        {msg.role === "assistant"
                          ? <MarkdownContent content={msg.content} />
                          : <p className="leading-relaxed text-sm">{msg.content}</p>
                        }
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="px-4 py-3 border-t border-white/10 shrink-0">
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2 focus-within:border-primary/50 transition-colors">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Ezzy anything about Azure..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={!input.trim() || isLoading}
                      className="p-1.5 rounded-lg bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground/40 mt-1.5">
                    Powered by Gemini AI · AzureCertify
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          examMode
            ? "bg-destructive/80 cursor-not-allowed opacity-60"
            : "bg-gradient-to-br from-primary to-cyan-500 hover:shadow-primary/40 hover:scale-110"
        )}
        whileHover={{ scale: examMode ? 1 : 1.1 }}
        whileTap={{ scale: examMode ? 1 : 0.95 }}
        title={examMode ? "Ezzy disabled in exam mode" : "Chat with Ezzy"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && !examMode && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background animate-pulse"></span>
        )}
      </motion.button>
    </>
  );
}
