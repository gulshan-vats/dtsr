"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  SearchIcon, 
  XIcon, 
  InfoIcon, 
  BookmarkIcon, 
  BookOpenIcon, 
  Share2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquarePlusIcon,
  MoreHorizontalIcon,
  Loader2Icon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { extractPaperText } from "@/lib/extractPaper"
import { buildPaperContext } from "@/lib/buildPaperContext"

export type ResearchPaper = {
  id: string
  score: number
  source: string
  year: number
  title: string
  abstract: string
  tags: string[]
  citations: number
  authors: string
  url: string
  pdfUrl?: string | null
}

interface ResearchPapersPanelProps {
  papers: ResearchPaper[]
  onClose: () => void
  onPullInChat: (paper: ResearchPaper, extractedContext: string) => void
  onSearch: (query: string) => void
  isLoading?: boolean
}

type SortOption = 'relevance' | 'citations' | 'newest' | 'oldest'

export default function ResearchPapersPanel({
  papers,
  onClose,
  onPullInChat,
  onSearch,
  isLoading
}: ResearchPapersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSort, setActiveSort] = useState<SortOption>('relevance')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null)
  const [savedPaperIds, setSavedPaperIds] = useState<Set<string>>(new Set())
  const [extractingId, setExtractingId] = useState<string | null>(null)

  const handlePullInChat = async (paper: ResearchPaper) => {
    setExtractingId(paper.id);
    let contextStr = "";
    if (paper.pdfUrl) {
      const text = await extractPaperText(paper.pdfUrl);
      contextStr = buildPaperContext(paper, text);
    } else {
      contextStr = buildPaperContext(paper, null);
    }
    onPullInChat(paper, contextStr);
    setExtractingId(null);
  };

  // Truly dynamic suggestions extracted from current papers' tags
  const suggestions = useMemo(() => {
    const tagFreq: Record<string, number> = {}
    papers.forEach(p => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          const normalized = t.trim().toUpperCase()
          if (normalized) {
            tagFreq[normalized] = (tagFreq[normalized] || 0) + 1
          }
        })
      }
    })
    // Sort by frequency and take top 8
    return Object.entries(tagFreq)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 8)
  }, [papers])

  // Filtering and Sorting Logic
  const filteredPapers = useMemo(() => {
    let result = papers.filter(p => {
      const query = searchQuery.toLowerCase()
      return (
        p.title.toLowerCase().includes(query) ||
        p.authors.toLowerCase().includes(query) ||
        p.source.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      )
    })

    // Base sort by relevance score (%) descending
    let sorted = [...result].sort((a, b) => b.score - a.score)
    
    // If user explicitly picked another sort, apply it
    if (activeSort === 'citations') {
      sorted = sorted.sort((a, b) => b.citations - a.citations)
    } else if (activeSort === 'newest') {
      sorted = sorted.sort((a, b) => b.year - a.year)
    } else if (activeSort === 'oldest') {
      sorted = sorted.sort((a, b) => a.year - b.year)
    }

    return sorted
  }, [papers, searchQuery, activeSort])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  const toggleSave = (id: string) => {
    setSavedPaperIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10"
    if (score >= 88) return "text-amber-400 border-amber-400/20 bg-amber-400/10"
    return "text-zinc-400 border-zinc-400/20 bg-zinc-400/10"
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 z-50 h-full w-[400px] border-l border-black/5 bg-[#fafafa] flex flex-col overflow-hidden rounded-l-[0px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
        <div>
          <h2 className="text-[20px] font-bold text-black tracking-tight flex items-center gap-2">
            Research Results
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-white/40">
              {filteredPapers.length}
            </span>
          </h2>
        </div>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      {/* Search & Filters Section */}
      <div className="px-6 space-y-4 pb-6 border-b border-black/5">
        {/* Search Bar */}
        <div className="relative group">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/30 group-focus-within:text-[#ff751f] transition-colors" />
          <input
            type="text"
            placeholder="Filter by title, tag, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-black/10 rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-black placeholder:text-black/30 focus:outline-none focus:border-[#ff751f]/40 focus:ring-1 focus:ring-[#ff751f]/20 transition-all shadow-sm"
          />
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          {(['relevance', 'citations', 'newest', 'oldest'] as SortOption[]).map((sort) => (
            <button
              key={sort}
              onClick={() => setActiveSort(sort)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition-all whitespace-nowrap border shadow-sm",
                activeSort === sort 
                  ? "bg-[#ff751f]/10 border-[#ff751f]/30 text-[#ff751f]" 
                  : "bg-white border-black/5 text-black/50 hover:text-black hover:bg-black/[0.02]"
              )}
            >
              {sort}
            </button>
          ))}
        </div>

        {/* Suggestion Pills */}
        {(suggestions.length > 0 || isLoading) && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            {isLoading && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-[#ff751f]/5 border border-[#ff751f]/10">
                <Loader2Icon className="size-3 text-[#ff751f] animate-spin" />
                <span className="text-[10px] font-bold text-[#ff751f]/60 uppercase tracking-wider">Searching...</span>
              </div>
            )}
            {suggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => onSearch(tag)}
                disabled={isLoading}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border bg-white border-black/[0.05] text-black/40 shadow-sm hover:text-[#ff751f] hover:border-[#ff751f]/20 hover:bg-[#ff751f]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Paper List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => (
            <motion.div
              layout
              key={paper.id}
              className="group relative bg-white rounded-xl shadow-sm border border-black/[0.04] p-5 hover:border-black/10 hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-bold border tabular-nums",
                      getScoreColor(paper.score)
                    )}>
                      {paper.score}%
                    </div>
                    <span className="text-[11px] text-black/40 font-medium tracking-wide">
                      {paper.source} • {paper.year}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-black/80 leading-tight group-hover:text-black transition-colors">
                    {paper.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpandedPaperId(expandedPaperId === paper.id ? null : paper.id)}
                    className={cn(
                      "size-8 flex items-center justify-center rounded-lg transition-colors",
                      expandedPaperId === paper.id ? "bg-black/[0.05] text-black" : "text-black/30 hover:text-black hover:bg-black/5"
                    )}
                  >
                    <InfoIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => toggleSave(paper.id)}
                    className={cn(
                      "size-8 flex items-center justify-center rounded-lg transition-colors",
                      savedPaperIds.has(paper.id) ? "text-[#ff751f] scale-110" : "text-black/30 hover:text-black hover:bg-black/5"
                    )}
                  >
                    <BookmarkIcon className={cn("size-4", savedPaperIds.has(paper.id) && "fill-current")} />
                  </button>
                </div>
              </div>

              {/* Abstract / Authors */}
              <AnimatePresence>
                {expandedPaperId === paper.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[13px] text-black/60 leading-relaxed mb-4 italic pt-3 border-t border-black/5 mt-3">
                      {paper.abstract}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
                {paper.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-[#ff751f]/60 bg-[#ff751f]/5 px-2 py-0.5 rounded border border-[#ff751f]/10">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-black/40 font-medium">Citations: {paper.citations.toLocaleString()}</span>
                  <span className="text-[11px] text-black/60 font-medium truncate max-w-[180px]">{paper.authors}</span>
                </div>
                
                <button 
                  onClick={() => handlePullInChat(paper)}
                  disabled={extractingId === paper.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#ff751f]/10 hover:bg-[#ff751f]/20 text-[#ff751f] rounded-lg transition-all text-[12px] font-bold group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {extractingId === paper.id ? (
                    <>
                      <Loader2Icon className="size-3.5 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <MessageSquarePlusIcon className="size-3.5" />
                      {paper.pdfUrl ? "Pull in chat · Full text" : "Pull in chat · Abstract only"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-10 py-20 bg-white shadow-sm rounded-xl border border-dashed border-black/10">
            <div className="size-16 rounded-full bg-black/[0.02] flex items-center justify-center mb-4">
              <SearchIcon className="size-8 text-black/10" />
            </div>
            <h3 className="text-black/60 font-semibold mb-2">No results match your search</h3>
            <p className="text-black/40 text-[13px]">Try adjusting your search terms or filters to find what you're looking for.</p>
            <Button
              variant="ghost"
              className="mt-4 text-[#ff751f] hover:bg-[#ff751f]/5"
              onClick={() => {
                setSearchQuery("")
                setSelectedTags(new Set())
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
