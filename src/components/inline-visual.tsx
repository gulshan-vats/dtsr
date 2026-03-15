"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface InlineVisualProps {
  type: "html" | "svg"
  content: string
  className?: string
}

/**
 * InlineVisual
 *
 * Renders an AI-generated visualization inline inside a chat message.
 *
 * • html → sandboxed iframe (blob URL, allow-scripts only)
 * • svg  → dangerouslySetInnerHTML inside a scoped wrapper
 *
 * Styling intentionally matches the existing app's panel/card tokens:
 * border, border-black/5, bg-white, rounded-2xl — no new design tokens.
 */
export const InlineVisual = React.memo(function InlineVisual({ type, content, className }: InlineVisualProps) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null)
  const [svgHeight, setSvgHeight] = React.useState<number>(280)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const svgWrapperRef = React.useRef<HTMLDivElement>(null)

  // ── HTML: build a blob URL once per content change ─────────────────────────
  React.useEffect(() => {
    if (type !== "html") return

    const blob = new Blob([content], { type: "text/html" })
    const url  = URL.createObjectURL(blob)
    setBlobUrl(url)

    return () => {
      URL.revokeObjectURL(url)
      setBlobUrl(null)
    }
  }, [type, content])

  // ── SVG: auto-size the wrapper to match the SVG's viewBox height ───────────
  React.useEffect(() => {
    if (type !== "svg" || !svgWrapperRef.current) return

    const svgEl = svgWrapperRef.current.querySelector("svg")
    if (!svgEl) return

    const vb = svgEl.getAttribute("viewBox")
    if (vb) {
      const parts = vb.split(/[\s,]+/)
      const vbH = parseFloat(parts[3])
      const vbW = parseFloat(parts[2])
      if (vbW && vbH) {
        // derive render height proportionally to the wrapper's actual pixel width
        const wrapperW = svgWrapperRef.current.clientWidth || 680
        const aspectH  = Math.round((vbH / vbW) * wrapperW)
        setSvgHeight(Math.min(Math.max(aspectH, 200), 500))
      }
    }

    // Make sure SVG fills 100 % of its container
    svgEl.setAttribute("width", "100%")
    svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet")
  }, [type, content])

  // ── iframe: auto-resize to match inner document height ─────────────────────
  const handleIframeLoad = React.useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    try {
      const docH = iframe.contentDocument?.documentElement?.scrollHeight
      if (docH) {
        iframe.style.height = `${Math.min(Math.max(docH, 200), 500)}px`
      }
    } catch {
      // cross-origin guard — just leave the default
    }
  }, [])

  const sharedWrapper = cn(
    "my-4 w-full overflow-hidden rounded-2xl border border-black/[0.06] bg-white",
    className
  )

  // ── SVG render ─────────────────────────────────────────────────────────────
  if (type === "svg") {
    // Pure inline SVG without wrappers or borders as requested by user
    return (
      <div 
        className={cn("my-6 w-full flex justify-center", className)}
        style={{ minHeight: 160 }}
      >
        <div
          ref={svgWrapperRef}
          className="w-full flex justify-center items-center"
          style={{ height: svgHeight }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    )
  }

  // ── HTML render ────────────────────────────────────────────────────────────
  return (
    <div className={sharedWrapper}>
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-black/[0.04] bg-black/[0.01]">
        <span className="flex gap-0.5">
          <span className="size-2 rounded-full bg-[#ff5f56]" />
          <span className="size-2 rounded-full bg-[#ffbd2e]" />
          <span className="size-2 rounded-full bg-[#27c93f]" />
        </span>
        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest ml-1">Chart</span>
      </div>
      {blobUrl ? (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          sandbox="allow-scripts"
          onLoad={handleIframeLoad}
          className="w-full border-0"
          style={{ minHeight: 200, height: 300 }}
          title="AI-generated chart"
        />
      ) : (
        <div className="flex items-center justify-center h-[200px] text-black/20 text-sm">
          Loading chart…
        </div>
      )}
    </div>
  )
})
