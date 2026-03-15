"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Copy as CopyIcon, ThumbsUp as ThumbsUpIcon, ThumbsDown as ThumbsDownIcon } from "lucide-react"
import { InlineVisual } from "@/components/inline-visual"
import { parseMessageParts } from "@/lib/parse-message-parts"
import { cn } from "@/lib/utils"

// Locally-scoped chart renderer for legacy ```chart fenced blocks -----------
// (keep parity with the existing ChartRenderer already in page.tsx)
let ChartRendererImport: React.ComponentType<{ data: string }> | null = null
try {
  // Dynamic require to avoid breaking if the parent module moves
  const m = require("@/components/charts/chat-charts") as { ChartBarMultiple: React.ComponentType<{ data: string }> }
  ChartRendererImport = m.ChartBarMultiple
} catch { /* ignore if not found */ }

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessageData {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

interface ChatMessageProps {
  message: ChatMessageData
  index: number
  isLatest: boolean
  isLoading: boolean
  onCopy: (content: string) => void
  onFeedback: (index: number, type: "like" | "dislike") => void
}

// ── Markdown component map (matches existing styles in page.tsx) ─────────────

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 text-black" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 text-black" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-1 text-black" {...props} />,
  p:  ({ node, ...props }) => <p className="text-black/80 leading-relaxed mb-3" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-3 space-y-1" {...props} />,
  li: ({ node, ...props }) => <li className="text-black/80" {...props} />,
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-4 border border-black/10 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-black/[0.02] border-b border-black/5">
        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Data Table</span>
      </div>
      <table className="w-full text-left text-[13px] border-collapse" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => <thead className="bg-[#fafafa] border-b border-black/5 text-black/40" {...props} />,
  th:    ({ node, ...props }) => <th className="px-4 py-3 font-semibold" {...props} />,
  td:    ({ node, ...props }) => <td className="px-4 py-3 border-b border-black/5 text-black/70" {...props} />,
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "")
    if (!inline && match?.[1] === "chart" && ChartRendererImport) {
      return <ChartRendererImport data={String(children).replace(/\n$/, "")} />
    }
    return !inline ? (
      <div className="my-4 overflow-hidden rounded-xl border border-black/10 bg-[#0d0d0d] shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="flex gap-1">
              <div className="size-2.5 rounded-full bg-[#ff5f56]" />
              <div className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="size-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[10px] font-mono text-white/30 uppercase ml-2">{match?.[1] || "code"}</span>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <code className="text-[13px] font-mono text-white/90 leading-relaxed block" {...props}>
            {children}
          </code>
        </div>
      </div>
    ) : (
      <code className="bg-black/5 rounded px-1 py-0.5 font-mono text-xs" {...props}>
        {children}
      </code>
    )
  },
}

// ── ChatMessage component ────────────────────────────────────────────────────

export function ChatMessage({
  message,
  index,
  isLatest,
  isLoading,
  onCopy,
  onFeedback,
}: ChatMessageProps) {
  if (message.role === "assistant") {
    const parts = parseMessageParts(message.content)

    return (
      <div className="flex flex-col w-full animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex justify-start w-full">
          <div className="flex flex-col gap-4 w-full max-w-[95%]">
            <div className="flex gap-4 items-start">
              {/* ✸ avatar */}
              <div className="size-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-1">
                {isLoading && isLatest ? (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-orange-500 text-lg font-bold leading-none inline-block origin-center"
                  >
                    ✸
                  </motion.span>
                ) : (
                  <span className="text-orange-500 text-lg font-bold leading-none">✸</span>
                )}
              </div>

              {/* Message body */}
              <div className="flex flex-col gap-3 flex-1 pt-1 overflow-hidden prose prose-sm max-w-none">
                {parts.map((part, partIdx) => {
                  if (part.type === "text") {
                    return (
                      <ReactMarkdown
                        key={partIdx}
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {part.content}
                      </ReactMarkdown>
                    )
                  }
                  // html or svg → InlineVisual
                  return (
                    <InlineVisual
                      key={partIdx}
                      type={part.type}
                      content={part.content}
                    />
                  )
                })}

                {/* Action bar */}
                <div className="flex items-center gap-1.5 mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-black/20 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                    onClick={() => onCopy(message.content)}
                  >
                    <CopyIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-black/20 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                    onClick={() => onFeedback(index, "like")}
                  >
                    <ThumbsUpIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-black/20 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                    onClick={() => onFeedback(index, "dislike")}
                  >
                    <ThumbsDownIcon className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User message — passed through as-is (rendered by parent)
  return null
}
