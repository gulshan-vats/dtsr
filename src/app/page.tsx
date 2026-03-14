"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SidebarLeft } from "@/components/sidebar-left"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  FileTextIcon,
  Share2Icon,
  XIcon,
  PlusIcon,
  AudioLinesIcon,
  ChevronDownIcon,
  SearchIcon,
  GlobeIcon,
  ArrowUpIcon,
  ImageIcon,
  SparklesIcon,
  DatabaseIcon,
  PenLineIcon,
  ChevronRightIcon,
  MoreVerticalIcon,
  BookmarkIcon,
  MessageSquarePlusIcon,
  BookOpenIcon,
  UserIcon,
  CopyIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  RefreshCcwIcon,
  InfoIcon,
  CheckIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChartBarMultiple } from "@/components/charts/chat-charts"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Area,
  AreaChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const ChartRenderer = React.memo(({ data: rawData }: { data: string }) => {
  try {
    const config = JSON.parse(rawData);
    const { type, data, config: chartConfig } = config;

    // Default margin to prevent number cutoffs
    const chartMargins = { left: 20, right: 30, top: 20, bottom: 20 };

    return (
      <div className="my-8 border border-black/10 rounded-3xl overflow-hidden bg-white p-8 w-full max-w-[720px] min-h-[400px]">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          {type === 'bar' ? (
            <BarChart data={data} margin={chartMargins}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} tick={{ fill: 'rgba(0,0,0,0.4)' }} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} tick={{ fill: 'rgba(0,0,0,0.4)' }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
          ) : type === 'pie' || type === 'gauge' ? (
            <PieChart margin={chartMargins}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={type === 'gauge' ? 80 : 60}
                outerRadius={type === 'gauge' ? 100 : 80}
                paddingAngle={5}
                startAngle={type === 'gauge' ? 180 : 0}
                endAngle={type === 'gauge' ? 0 : 360}
              >
                {data.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ff751f' : `rgba(255,117,31, ${0.8 - index * 0.2})`} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          ) : type === 'area' ? (
            <AreaChart data={data} margin={chartMargins}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area type="natural" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.1} />
            </AreaChart>
          ) : type === 'radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data} margin={chartMargins}>
              <PolarGrid stroke="rgba(0,0,0,0.05)" />
              <PolarAngleAxis dataKey="name" fontSize={11} />
              <Radar name="Value" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.6} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          ) : type === 'scatter' ? (
            <ScatterChart margin={chartMargins}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis type="category" dataKey="name" name="category" />
              <YAxis type="number" dataKey="value" name="value" />
              <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
              <Scatter name="Data" data={data} fill="var(--color-value)" />
            </ScatterChart>
          ) : type === 'waterfall' ? (
            <BarChart data={data} margin={chartMargins}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={4} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={chartMargins}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line type="natural" dataKey="value" stroke="var(--color-value)" strokeWidth={3} dot={{ fill: 'var(--color-value)', r: 4 }} />
            </LineChart>
          )}
        </ChartContainer>
      </div>
    );
  } catch (e) {
    return <pre className="p-4 bg-red-50 text-red-500 rounded-xl text-xs">Error rendering chart: {String(e)}</pre>;
  }
});

type SelectedOption = {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  type?: 'style' | 'tool' | 'paper';
}

type ResearchPaper = {
  id: string;
  title: string;
  score: number;
  year: number;
  citations: number;
  publisher: string;
  relevancy: number;
  tags: string[];
  summary: string;
}

type OptionsData = {
  title?: string;
  options?: { id: string; label: string }[];
  steps?: { title: string; options: { id: string; label: string }[] }[];
}

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "p1",
    title: "Attention Is All You Need",
    score: 98,
    year: 2017,
    citations: 120534,
    publisher: "NeurIPS",
    relevancy: 96,
    tags: ["LLM", "Transformer", "NLP"],
    summary: "Introducing the Transformer architecture, based solely on attention mechanisms, dispensing with recurrence and convolutions."
  },
  {
    id: "p2",
    title: "Language Models are Few-Shot Learners",
    score: 94,
    year: 2020,
    citations: 45210,
    publisher: "OpenAI",
    relevancy: 89,
    tags: ["GPT-3", "Few-Shot", "NLP"],
    summary: "Demonstrating that scaling up language models greatly improves few-shot performance, achieving state-of-the-art on many benchmarks."
  }
]

function PageContent() {
  const { state: sidebarState } = useSidebar()
  const [isDocPanelOpen, setIsDocPanelOpen] = React.useState(false)
  const [isChatStarted, setIsChatStarted] = React.useState(false)
  const [promptValue, setPromptValue] = React.useState("")
  const [isPlusMenuOpen, setIsPlusMenuOpen] = React.useState(false)
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = React.useState<SelectedOption[]>([])
  const [activePaperAction, setActivePaperAction] = React.useState<string | null>(null)
  const [savingPaperId, setSavingPaperId] = React.useState<string | null>(null)
  const [summaryPaperId, setSummaryPaperId] = React.useState<string | null>(null)

  // Chat state
  const [messages, setMessages] = React.useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadedDoc, setUploadedDoc] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [isDeepSearch, setIsDeepSearch] = React.useState(false)
  const [isWebMode, setIsWebMode] = React.useState(false)
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const [thinkingStep, setThinkingStep] = React.useState(0)
  const thinkingSteps = ["Gathering sources...", "Analyzing data...", "Synthesizing answer...", "Formulating response..."]
  const [papers, setPapers] = React.useState<ResearchPaper[]>(RESEARCH_PAPERS)

  // Options state
  const [activeOptions, setActiveOptions] = React.useState<OptionsData | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [focusedOptionIndex, setFocusedOptionIndex] = React.useState(0)
  const [selectedOptionIds, setSelectedOptionIds] = React.useState<Set<string>>(new Set())
  const [allStepSelections, setAllStepSelections] = React.useState<Record<number, { title: string, labels: string[] }>>({})

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLoading) {
      interval = setInterval(() => {
        setThinkingStep((prev) => (prev + 1) % thinkingSteps.length)
      }, 2000)
    } else {
      setThinkingStep(0)
    }
    return () => clearInterval(interval)
  }, [isLoading])

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Option Selector Keyboard Controls
  React.useEffect(() => {
    if (!activeOptions) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentStep = activeOptions.steps?.[currentStepIndex];
      const currentOptions = activeOptions.steps
        ? (currentStep?.options || [])
        : (activeOptions.options || []);
      const totalOptions = (currentOptions?.length || 0) + 1; // +1 for "Something else"

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedOptionIndex((prev) => (prev + 1) % totalOptions);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedOptionIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
      } else if (e.key === ' ') { // Multi-select toggle
        e.preventDefault();
        if (focusedOptionIndex < (currentOptions?.length || 0)) {
          const option = currentOptions[focusedOptionIndex];
          const id = typeof option === 'string' ? option : option.id;
          setSelectedOptionIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedOptionIndex < currentOptions.length) {
          const id = currentOptions[focusedOptionIndex].id;
          setSelectedOptionIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }
        else {
          setActiveOptions(null);
          setSelectedOptionIds(new Set());
          setTimeout(() => document.querySelector('textarea')?.focus(), 50);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActiveOptions(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOptions, focusedOptionIndex]);

  const scrollToBottom = () => {
    // We want the last message group (User + AI) to align to the top
    const lastUserMsg = document.getElementById("last-user-interaction")
    if (lastUserMsg) {
      lastUserMsg.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const projects = ["AI Ethics", "Transformer Research", "Deep Learning"]

  const isSidebarOpen = sidebarState === "expanded"

  const [isListening, setIsListening] = React.useState(false)

  const startListening = () => {
    if (isListening) {
      if ((window as any).recognition) {
        (window as any).recognition.stop();
      }
      setIsListening(false);
      setToast({ message: "Voice recognition disabled", type: 'success' });
      return;
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
        ; (window as any).recognition = recognition;
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsListening(true)
        setToast({ message: "Voice recognition enabled", type: 'success' })
      }
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')
        setPromptValue(transcript)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } else {
      alert("Speech recognition is not supported in this browser.")
    }
  }


  // Send message to the backend
  const handleSendMessage = async (query: string) => {
    if (!query.trim()) return
    const userMsg = { role: 'user' as const, content: query }
    setMessages((prev) => [...prev, userMsg])
    setPromptValue("")
    setIsChatStarted(true)
    setTimeout(() => scrollToBottom(), 0) // Instant scroll on Enter
    setIsLoading(true)

    try {
      // Regular chat
      // Context aware chat - inject pulled papers
      const pulledPapers = selectedOptions.filter(opt => opt.type === 'paper')
      let contextInjection = ""

      // Only inject context if NOT in Web Mode
      if (!isWebMode && (pulledPapers.length > 0 || uploadedDoc)) {
        contextInjection = "\n\n[CONTEXT: Use the following context to answer the user's question:]\n"
        if (uploadedDoc) {
          contextInjection += `- Active Document: ${uploadedDoc}\n`
        }
        pulledPapers.forEach(p => {
          const paperData = papers.find(pp => pp.id === p.id)
          if (paperData) {
            contextInjection += `- Paper: ${paperData.title}\n  Summary: ${paperData.summary}\n`
          }
        })
      }

      const finalQuery = isDeepSearch ? `Deep Research: ${query}` : query
      // Explicitly tell the backend if we are in Web Mode
      const queryWithContext = isWebMode
        ? `[WEB_MODE_ONLY] ${finalQuery}`
        : (contextInjection ? `${finalQuery}${contextInjection}` : finalQuery)

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryWithContext,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      })
      const data = await res.json()
      let assistantContent = res.ok ? data.response : (data.error ?? "Something went wrong. Please try again.")

      // Robust Options Interceptor - Manual scanner for nested JSON
      const optionsStartTag = "[OPTIONS:";
      const startIndex = assistantContent.indexOf(optionsStartTag);
      let hasOptions = false;
      if (startIndex !== -1) {
        let jsonStart = assistantContent.indexOf("{", startIndex);
        if (jsonStart !== -1) {
          let bracketCount = 0;
          let foundEnd = false;
          let jsonEnd = -1;

          for (let i = jsonStart; i < assistantContent.length; i++) {
            if (assistantContent[i] === "{") bracketCount++;
            else if (assistantContent[i] === "}") {
              bracketCount--;
              if (bracketCount === 0) {
                jsonEnd = i + 1;
                foundEnd = true;
                break;
              }
            }
          }

          if (foundEnd) {
            const closingBracketIndex = assistantContent.indexOf("]", jsonEnd);
            if (closingBracketIndex !== -1) {
              const fullTag = assistantContent.substring(startIndex, closingBracketIndex + 1);
              const optionsJson = assistantContent.substring(jsonStart, jsonEnd);

              try {
                let cleanedJson = optionsJson.trim();
                // legacy support for {{ }}
                if (cleanedJson.startsWith('{{')) {
                  cleanedJson = cleanedJson.replace(/^{{/, '{').replace(/}}$/, '}');
                }
                const optionsData = JSON.parse(cleanedJson);
                setActiveOptions(optionsData);
                setFocusedOptionIndex(0);
                setCurrentStepIndex(0);
                setAllStepSelections({});
                // Cleanly remove the tag from visibility
                assistantContent = assistantContent.replace(fullTag, "").trim();
                hasOptions = true;
              } catch (e) {
                console.error("Failed to parse extracted AI options", e);
              }
            }
          }
        }
      }

      // Web Search Interceptor - Capture everything between [SEARCH: and the last ]
      const searchMatch = assistantContent.match(/\[SEARCH:\s*([\s\S]*)\s*\]/)
      if (searchMatch) {
        const searchTerm = searchMatch[1].trim()
        assistantContent = assistantContent.replace(/\[SEARCH:\s*[\s\S]*\s*\]/g, '').trim()

        try {
          const searchRes = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&limit=6`)
          const searchData = await searchRes.json()
          if (searchRes.ok && searchData.results) {
            // Transform backend paper to frontend ResearchPaper format
            const newPapers: ResearchPaper[] = searchData.results.map((p: any) => ({
              id: p.id,
              title: p.title,
              score: Math.floor(Math.random() * 20) + 80, // Mock score for UI
              year: p.year,
              citations: p.citations,
              publisher: "Semantic Scholar",
              relevancy: Math.floor(Math.random() * 30) + 70,
              tags: ["New", "Web Search"],
              summary: p.abstract || "No abstract available."
            }))
            setPapers(prev => [...newPapers, ...prev.slice(0, 10)])
            setToast({ message: `Found ${newPapers.length} new papers!`, type: 'info' })
            if (!hasOptions) {
              setIsDocPanelOpen(true)
            }
          }
        } catch (e) {
          console.error("Discovery search failed", e)
        }
      }

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: assistantContent,
      }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Failed to reach the backend. Make sure the Python server is running on port 8000." }])
    } finally {
      setIsLoading(false)
      setSelectedOptions((prev) => prev.filter(o => o.type !== 'paper'))
      // Deep Search persists for the session
    }
  }

  // Handle Feedback
  const handleFeedback = async (msgIndex: number, rating: 'like' | 'dislike') => {
    const userMsg = messages[msgIndex - 1]?.content || ""
    const aiMsg = messages[msgIndex]?.content || ""

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, response: aiMsg, rating }),
      })
      setToast({ message: `Response ${rating}d!`, type: 'success' })
    } catch (e) {
      console.error("Feedback failed", e)
    }
  }

  // Handle Copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setToast({ message: "Copied to clipboard!", type: 'success' })
  }

  // Trigger hidden PDF file input
  const handlePdfUpload = () => {
    fileInputRef.current?.click()
  }

  // Upload PDF to backend
  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Only PDF files are supported. Please select a PDF.' }])
      setIsChatStarted(true)
      return
    }
    setIsChatStarted(true)
    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        setUploadedDoc(data.document ?? file.name)
        // Instead of starting chat, add to selectedOptions as a chip
        setSelectedOptions(prev => [
          ...prev,
          {
            id: `paper-${Date.now()}`,
            label: file.name,
            icon: <FileTextIcon className="size-4" />,
            color: "text-orange-500",
            type: 'paper'
          }
        ])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }])
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Failed to upload PDF.' }])
    } finally {
      setIsLoading(false)
    }
  }
  const toggleOption = (option: SelectedOption) => {
    setSelectedOptions((prev) => {
      const isStyle = option.type === 'style';
      const exists = prev.find((o) => o.id === option.id)

      if (exists) {
        return prev.filter((o) => o.id !== option.id)
      }

      // If it's a style, remove any previous style first
      if (isStyle) {
        return [...prev.filter(o => o.type !== 'style'), option]
      }

      return [...prev, option]
    })
  }

  const removeOption = (id: string) => {
    setSelectedOptions((prev) => prev.filter((o) => o.id !== id))
  }

  const menuItems = [
    {
      id: "files",
      label: "Upload PDF",
      icon: <ImageIcon className="size-4" />,
      color: "text-blue-500",
      type: 'tool' as const
    },
    {
      id: "research",
      label: "Deep Research",
      icon: <SparklesIcon className="size-4" />,
      color: "text-purple-500",
      type: 'tool' as const
    },
    {
      id: "context",
      label: "Pull Context",
      icon: <DatabaseIcon className="size-4" />,
      color: "text-green-500",
      type: 'tool' as const
    },
  ]

  const styleOptions = [
    { id: "formal", label: "Formal", icon: <PenLineIcon className="size-4" />, color: "text-orange-500", type: 'style' as const },
    { id: "simple", label: "Simple", icon: <PenLineIcon className="size-4" />, color: "text-orange-500", type: 'style' as const },
    { id: "creative", label: "Creative", icon: <PenLineIcon className="size-4" />, color: "text-orange-500", type: 'style' as const },
  ]

  return (
    <SidebarInset className="relative flex flex-col min-h-screen bg-white text-[#1a1a1a] overflow-hidden">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-4 bg-[#fffaf7]/80 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1 font-semibold text-[#1a1a1a]/60">
                  Project Management & Task Tracking
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-9 transition-colors hover:bg-black/5",
              isDocPanelOpen && "bg-black text-white hover:bg-black/90"
            )}
            onClick={() => setIsDocPanelOpen(!isDocPanelOpen)}
          >
            <FileTextIcon className="size-4" />
            <span className="sr-only">Toggle Document Panel</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2 px-3 border-black/10 bg-black/[0.02] hover:bg-black/5 text-black">
            <Share2Icon className="size-4" />
            <span className="font-medium">Share</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <motion.div
          animate={{
            marginRight: isDocPanelOpen ? 400 : 0
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="flex-1 overflow-auto flex flex-col relative h-[calc(100vh-64px)] scrollbar-hide"
        >
          <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .animate-shimmer {
              animation: shimmer 2s infinite linear;
            }
          `}</style>

          <AnimatePresence mode="wait">
            {!isChatStarted ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 100, transition: { duration: 0.3, ease: "easeInOut" } }}
                className="flex flex-col items-center justify-center min-h-full w-full p-4"
              >
                <h1 className="text-[48px] font-medium mb-6 tracking-tight flex items-center gap-4 text-[#1a1a1a]">
                  <span className="text-[#ff751f] text-[40px] leading-none">✸</span> Good evening, Orange
                </h1>

                <div className="w-full max-w-[720px]">
                  <div className="relative flex flex-col bg-white border border-black/15 rounded-[28px] p-3">

                    {selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 px-2">
                        {selectedOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-1.5 px-2 py-1 bg-black/[0.03] border border-black/5 rounded-lg text-[12px] text-black/60 group animate-in fade-in zoom-in duration-200"
                          >
                            <span className={opt.color}>{opt.icon}</span>
                            {opt.label}
                            <button
                              onClick={() => removeOption(opt.id)}
                              className="ml-1 text-black/20 hover:text-black transition-colors"
                            >
                              <XIcon className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      className="w-full bg-transparent px-3 py-1.5 text-[14px] outline-none placeholder:text-black/20 text-[#1a1a1a] resize-none min-h-[60px]"
                      placeholder={selectedOptions.some(o => o.type === 'paper') ? "Summarize key findings or ask a question about this paper..." : "Type / for commands"}
                      value={promptValue}
                      onChange={(e) => setPromptValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(promptValue);
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2 px-1">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 text-black/20 hover:text-black hover:bg-black/5 rounded-xl border border-black/5"
                          onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                          onBlur={() => setTimeout(() => setIsPlusMenuOpen(false), 200)}
                        >
                          <PlusIcon className="size-5" />
                        </Button>

                        <div className="absolute left-[60px] top-1/2 -translate-y-1/2 flex items-center gap-2 pr-4">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap", isDeepSearch ? "text-orange-500" : "text-black/20")}>
                            Deep Dive
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setIsDeepSearch(!isDeepSearch);
                            }}
                            className={cn(
                              "relative w-8 h-4.5 rounded-full transition-colors duration-200 outline-none",
                              isDeepSearch ? "bg-orange-500" : "bg-black/10"
                            )}
                          >
                            <motion.div
                              animate={{ x: isDeepSearch ? 16 : 2 }}
                              className="absolute top-1/2 -translate-y-1/2 size-3 bg-white rounded-full shadow-sm"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </button>
                        </div>
                        <AnimatePresence>
                          {isPlusMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute bottom-full left-0 mb-3 w-[220px] bg-white border border-black/10 rounded-2xl shadow-2xl p-2 z-[60] overflow-visible"
                            >
                              <div className="flex flex-col gap-1">
                                {menuItems.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      if (item.id === 'files') {
                                        handlePdfUpload()
                                        setIsPlusMenuOpen(false)
                                      } else {
                                        toggleOption(item)
                                      }
                                    }}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors text-left group"
                                  >
                                    <span className={cn(item.color, "transition-transform group-hover:scale-110")}>{item.icon}</span>
                                    {item.label}
                                  </button>
                                ))}

                                <div className="h-px bg-black/5 my-1 mx-2" />

                                <div className="relative">
                                  <button
                                    onMouseEnter={() => setHoveredItem('styles')}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className="flex items-center justify-between w-full px-3 py-2.5 text-[13px] text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-all text-left"
                                  >
                                    <div className="flex items-center gap-3">
                                      <PenLineIcon className="size-4 text-orange-500" />
                                      Use Style
                                    </div>
                                    <ChevronRightIcon className="size-3 text-black/20" />
                                  </button>

                                  {hoveredItem === 'styles' && (
                                    <motion.div
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      onMouseEnter={() => setHoveredItem('styles')}
                                      onMouseLeave={() => setHoveredItem(null)}
                                      className="absolute left-full top-0 ml-2 w-[160px] bg-white border border-black/10 rounded-xl shadow-2xl p-1.5 z-[70]"
                                    >
                                      {styleOptions.map((opt) => (
                                        <button
                                          key={opt.id}
                                          onClick={() => toggleOption(opt)}
                                          className="flex items-center gap-3 w-full px-3 py-2 text-[13px] text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors text-left"
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center gap-2">
                        {promptValue.trim() ? (
                          <Button
                            className="size-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                            onClick={() => handleSendMessage(promptValue)}
                          >
                            <ArrowUpIcon className="size-5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "size-10 rounded-xl transition-all",
                              isListening ? "text-orange-500 bg-orange-50 animate-pulse border border-orange-200" : "text-black/20 hover:text-black hover:bg-black/5"
                            )}
                            onClick={startListening}
                          >
                            <AudioLinesIcon className="size-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between text-[13px] text-black/30 px-6 font-medium">
                    <span>Connect your tools to Revio</span>
                    <div className="flex items-center gap-5 grayscale opacity-50">
                      <SearchIcon className="size-5" />
                      <GlobeIcon className="size-5" />
                      <span className="text-sm font-bold">N</span>
                      <span className="text-sm font-bold">G</span>
                      <ChevronDownIcon className="size-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active-chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full flex-1 flex flex-col items-center"
              >
                <div className="w-full max-w-3xl flex flex-col gap-8 py-12 px-6 pb-[240px]">
                  {messages.map((msg, i) => {
                    const isLastUserMsg = i === messages.length - 2 && msg.role === 'user'
                    return msg.role === 'user' ? (
                      <div key={i} id={isLastUserMsg ? "last-user-interaction" : undefined} className="flex flex-col w-full animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex justify-end w-full mb-2">
                          <div className="bg-[#1a1a1a] px-6 py-2.5 rounded-[18px] shadow-sm max-w-[85%]">
                            <p className="text-[14.5px] leading-relaxed text-white">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex flex-col w-full animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex justify-start w-full">
                          <div className="flex flex-col gap-4 w-full max-w-[95%]">
                            <div className="flex gap-4 items-start">
                              <div className="size-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-1">
                                <span className="text-orange-500 text-lg font-bold leading-none">✸</span>
                              </div>
                              <div className="flex flex-col gap-3 flex-1 pt-1 overflow-hidden prose prose-sm max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2 text-black" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2 text-black" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-1 text-black" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-black/80 leading-relaxed mb-3" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-3 space-y-1" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-black/80" {...props} />,
                                    table: ({ node, ...props }) => (
                                      <div className="overflow-x-auto my-4 border border-black/10 rounded-xl bg-white shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-black/[0.02] border-b border-black/5">
                                          <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Data Table</span>
                                          <Button variant="ghost" size="sm" className="h-6 gap-1.5 px-2 text-[10px] text-black/40 hover:text-black" onClick={() => handleCopy(node?.position ? "" : "")}>
                                            <CopyIcon className="size-3" />
                                            Copy
                                          </Button>
                                        </div>
                                        <table className="w-full text-left text-[13px] border-collapse" {...props} />
                                      </div>
                                    ),
                                    thead: ({ node, ...props }) => <thead className="bg-[#fafafa] border-b border-black/5 text-black/40" {...props} />,
                                    th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold" {...props} />,
                                    td: ({ node, ...props }) => <td className="px-4 py-3 border-b border-black/5 text-black/70" {...props} />,
                                    code: ({ node, inline, className, children, ...props }: any) => {
                                      const match = /language-(\w+)/.exec(className || '')
                                      if (!inline && match?.[1] === 'chart') {
                                        return <ChartRenderer data={String(children).replace(/\n$/, '')} />
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
                                              <span className="text-[10px] font-mono text-white/30 uppercase ml-2">{match?.[1] || 'code'}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-6 gap-1.5 px-2 text-[10px] text-white/40 hover:text-white hover:bg-white/5" onClick={() => handleCopy(String(children).replace(/\n$/, ''))}>
                                              <CopyIcon className="size-3" />
                                              Copy
                                            </Button>
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
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Button variant="ghost" size="icon" className="size-8 text-black/20 hover:text-black hover:bg-black/5 rounded-lg transition-colors" onClick={() => handleCopy(msg.content)}>
                                    <CopyIcon className="size-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="size-8 text-black/20 hover:text-black hover:bg-black/5 rounded-lg transition-colors" onClick={() => handleFeedback(i, 'like')}>
                                    <ThumbsUpIcon className="size-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="size-8 text-black/20 hover:text-black hover:bg-black/5 rounded-lg transition-colors" onClick={() => handleFeedback(i, 'dislike')}>
                                    <ThumbsDownIcon className="size-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-px bg-black/[0.03] my-10" />
                      </div>
                    )
                  })}

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start w-full animate-in fade-in duration-300">
                      <div className="flex gap-4 items-start">
                        <div className="size-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                          <span className="text-orange-500 text-lg font-bold leading-none">✸</span>
                        </div>
                        <div className="flex flex-col gap-1 pt-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-[13px] font-medium text-black/40 animate-pulse bg-gradient-to-r from-black/40 via-black to-black/40 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                              {thinkingSteps[thinkingStep]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 h-1">
                            <span className="h-0.5 w-12 bg-black/[0.03] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-orange-500"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isChatStarted && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 200, delay: 0.1 }}
                className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center"
              >
                {/* Masking Container: Strictly constrained to main area */}
                <motion.div
                  animate={{
                    left: isSidebarOpen ? 256 : 64,
                    right: isDocPanelOpen ? 400 : 0
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-t from-white via-white/95 to-transparent -z-10"
                />

                <motion.div
                  animate={{
                    paddingLeft: isSidebarOpen ? 256 : 64,
                    paddingRight: isDocPanelOpen ? 400 : 0
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-full flex flex-col items-center pb-8 pt-4 pointer-events-none"
                >
                  <div className="w-full max-w-[800px] px-6 pointer-events-auto relative">
                    <div className={cn(
                      "relative flex flex-col bg-white border border-black/15 rounded-[28px] p-3 shadow-none transition-all duration-300",
                      activeOptions ? "min-h-[200px]" : "pb-2"
                    )}>
                      <AnimatePresence mode="wait">
                        {activeOptions ? (
                          <motion.div
                            key="selector"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col p-4 w-full h-full"
                          >
                            <div className="flex justify-between items-start mb-4 px-2">
                              <div className="flex flex-col gap-0.5">
                                <h3 className="text-[17px] font-medium text-[#1a1a1a] tracking-tight">
                                  {activeOptions.steps ? activeOptions.steps[currentStepIndex]?.title : activeOptions.title}
                                </h3>
                                {activeOptions.steps && (
                                  <div className="flex gap-1">
                                    {activeOptions.steps.map((_, i) => (
                                      <div
                                        key={i}
                                        className={cn(
                                          "h-1 rounded-full transition-all",
                                          i === currentStepIndex ? "w-4 bg-black" : "w-1.5 bg-black/10"
                                        )}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setActiveOptions(null);
                                  setSelectedOptionIds(new Set());
                                  setCurrentStepIndex(0);
                                  setAllStepSelections({});
                                }}
                                className="text-black/30 hover:text-black transition-colors"
                              >
                                <XIcon className="size-4" />
                              </button>
                            </div>

                            <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0 max-h-[300px]">
                              {(activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options || []) : (activeOptions.options || [])).map((option, idx) => {
                                const id = typeof option === 'string' ? option : option.id;
                                const label = typeof option === 'string' ? option : option.label;
                                const isSelected = selectedOptionIds.has(id);
                                return (
                                  <button
                                    key={id || idx}
                                    onClick={() => {
                                      setSelectedOptionIds(prev => {
                                        const next = new Set(prev);
                                        if (next.has(id)) next.delete(id);
                                        else next.add(id);
                                        return next;
                                      });
                                    }}
                                    onMouseEnter={() => setFocusedOptionIndex(idx)}
                                    className={cn(
                                      "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group",
                                      focusedOptionIndex === idx
                                        ? "bg-[#f9f8f4] translate-x-1"
                                        : isSelected ? "bg-black/[0.02]" : "hover:bg-black/[0.01]"
                                    )}
                                  >
                                    <div className={cn(
                                      "size-7 rounded-lg flex items-center justify-center text-[11px] font-medium transition-colors",
                                      isSelected ? "bg-black text-white" : focusedOptionIndex === idx ? "bg-black/10 text-black" : "bg-black/[0.05] text-black/40"
                                    )}>
                                      {isSelected ? <CheckIcon className="size-3.5" /> : idx + 1}
                                    </div>
                                    <span className={cn(
                                      "text-[14px] transition-colors",
                                      isSelected ? "text-black font-semibold" : focusedOptionIndex === idx ? "text-black font-medium" : "text-black/60"
                                    )}>
                                      {label}
                                    </span>
                                  </button>
                                );
                              })}

                              <button
                                onClick={() => {
                                  setActiveOptions(null);
                                  setSelectedOptionIds(new Set());
                                  setCurrentStepIndex(0);
                                  setAllStepSelections({});
                                  setTimeout(() => document.querySelector('textarea')?.focus(), 50);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group border border-transparent",
                                  focusedOptionIndex === (activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options.length || 0) : (activeOptions.options?.length || 0))
                                    ? "bg-[#f9f8f4] border-black/5"
                                    : "hover:bg-black/[0.02]"
                                )}
                                onMouseEnter={() => setFocusedOptionIndex(activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options.length || 0) : (activeOptions.options?.length || 0))}
                              >
                                <div className={cn(
                                  "size-7 rounded-lg flex items-center justify-center transition-colors",
                                  focusedOptionIndex === (activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options.length || 0) : (activeOptions.options?.length || 0)) ? "bg-black text-white" : "bg-black/[0.05] text-black/40"
                                )}>
                                  <PenLineIcon className="size-4" />
                                </div>
                                <span className={cn(
                                  "text-[14px] transition-colors",
                                  focusedOptionIndex === (activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options.length || 0) : (activeOptions.options?.length || 0)) ? "text-black font-medium" : "text-black/20 italic"
                                )}>
                                  Something else
                                </span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/[0.05] px-2">
                              <div className="flex items-center gap-3 text-[10px] text-black/30 font-medium uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><span className="px-1 py-0.5 border border-black/10 rounded">Space</span> Toggle</span>
                                <span className="flex items-center gap-1.5"><span className="px-1 py-0.5 border border-black/10 rounded">Enter</span> Select</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="rounded-xl px-4 h-9 text-black/40 hover:text-black hover:bg-black/5 text-[12px] font-medium"
                                  onClick={() => {
                                    setActiveOptions(null);
                                    setSelectedOptionIds(new Set());
                                    setCurrentStepIndex(0);
                                    setAllStepSelections({});
                                  }}
                                >
                                  Skip
                                </Button>
                                {activeOptions.steps && currentStepIndex < activeOptions.steps.length - 1 ? (
                                  <Button
                                    disabled={selectedOptionIds.size === 0}
                                    className="rounded-xl px-6 h-9 bg-black hover:bg-black/90 text-white text-[12px] font-bold shadow-lg disabled:opacity-30 disabled:pointer-events-none"
                                    onClick={() => {
                                      const currentStep = activeOptions.steps![currentStepIndex];
                                      const selectedLabels = currentStep.options
                                        .filter(o => {
                                          const id = typeof o === 'string' ? o : o.id;
                                          return selectedOptionIds.has(id);
                                        })
                                        .map(o => typeof o === 'string' ? o : o.label);

                                      setAllStepSelections(prev => ({
                                        ...prev,
                                        [currentStepIndex]: {
                                          title: currentStep.title,
                                          labels: selectedLabels
                                        }
                                      }));
                                      setCurrentStepIndex(prev => prev + 1);
                                      setSelectedOptionIds(new Set());
                                      setFocusedOptionIndex(0);
                                    }}
                                  >
                                    Next Step
                                  </Button>
                                ) : (
                                  <Button
                                    disabled={selectedOptionIds.size === 0}
                                    className="rounded-xl px-6 h-9 bg-black hover:bg-black/90 text-white text-[12px] font-bold shadow-lg disabled:opacity-30 disabled:pointer-events-none"
                                    onClick={() => {
                                      const currentStepTitle = activeOptions.steps
                                        ? activeOptions.steps[currentStepIndex].title
                                        : (activeOptions.title || "Selected Options");

                                      const currentOptions = activeOptions.steps
                                        ? activeOptions.steps[currentStepIndex].options
                                        : (activeOptions.options || []);

                                      const currentLabels = currentOptions
                                        .filter(o => {
                                          const id = typeof o === 'string' ? o : o.id;
                                          return selectedOptionIds.has(id);
                                        })
                                        .map(o => typeof o === 'string' ? o : o.label);

                                      let multiLineMsg = "User selections:\n";
                                      // Previous steps
                                      Object.values(allStepSelections).forEach(step => {
                                        multiLineMsg += `- ${step.title} → ${step.labels.join(", ")}\n`;
                                      });
                                      // Current step
                                      multiLineMsg += `- ${currentStepTitle} → ${currentLabels.join(", ")}\n\n`;
                                      multiLineMsg += "Now retrieve papers based on these filters.";

                                      handleSendMessage(multiLineMsg);
                                      setActiveOptions(null);
                                      setSelectedOptionIds(new Set());
                                      setCurrentStepIndex(0);
                                      setAllStepSelections({});
                                      setTimeout(() => document.querySelector('textarea')?.focus(), 50);
                                    }}
                                  >
                                    Confirm Selection
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col w-full h-full"
                          >
                            {selectedOptions.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2 px-1">
                                {selectedOptions.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className="flex items-center gap-1 px-2 py-0.5 bg-black/[0.03] border border-black/5 rounded-md text-[11px] text-black/40 animate-in fade-in zoom-in duration-200"
                                  >
                                    <span className={opt.color}>{opt.icon}</span>
                                    <span className="truncate max-w-[150px]">{opt.label}</span>
                                    <button onClick={() => removeOption(opt.id)}>
                                      <XIcon className="size-2.5 ml-1" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <textarea
                              className="w-full bg-transparent px-3 py-1 text-[14px] outline-none placeholder:text-black/20 text-[#1a1a1a] resize-none min-h-[44px] max-h-[200px]"
                              placeholder={selectedOptions.some(o => o.type === 'paper') ? "Ask about methodology, findings, or conclusions..." : "Reply..."}
                              value={promptValue}
                              onChange={(e) => setPromptValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage(promptValue);
                                }
                              }}
                            />
                            <div className="flex items-center justify-between mt-2 px-1">
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-9 text-black/20 hover:text-black hover:bg-black/5 rounded-xl border border-black/5"
                                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                                  onBlur={() => setTimeout(() => setIsPlusMenuOpen(false), 200)}
                                >
                                  <PlusIcon className="size-5" />
                                </Button>

                                <div className="absolute left-[52px] top-1/2 -translate-y-1/2 flex items-center gap-1.5 pr-4">
                                  <span className={cn("text-[9px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap", isDeepSearch ? "text-orange-500" : "text-black/20")}>
                                    Deep Dive
                                  </span>
                                  <button
                                    onClick={() => setIsDeepSearch(!isDeepSearch)}
                                    className={cn(
                                      "relative w-7 h-4 rounded-full transition-colors duration-200 outline-none",
                                      isDeepSearch ? "bg-orange-500" : "bg-black/10"
                                    )}
                                  >
                                    <motion.div
                                      animate={{ x: isDeepSearch ? 14 : 2 }}
                                      className="absolute top-1/2 -translate-y-1/2 size-2.5 bg-white rounded-full shadow-sm"
                                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                  </button>

                                  <div className="w-px h-3.5 bg-black/10 mx-1" />

                                  <button
                                    onClick={() => setIsWebMode(!isWebMode)}
                                    className={cn(
                                      "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all",
                                      isWebMode ? "bg-blue-50 text-blue-600 border-blue-100 border" : "text-black/30 hover:text-black/50"
                                    )}
                                    title={isWebMode ? "Web Search Only (Bypassing PDF)" : "Enable Web Search Mode"}
                                  >
                                    <GlobeIcon className={cn("size-3.5", isWebMode && "animate-pulse")} />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Web</span>
                                  </button>
                                </div>
                                <AnimatePresence>
                                  {isPlusMenuOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-black/5 p-1 z-[100]"
                                    >
                                      {menuItems.map((item) => (
                                        <button
                                          key={item.id}
                                          onClick={() => {
                                            if (item.id === 'files') {
                                              handlePdfUpload()
                                              setIsPlusMenuOpen(false)
                                            } else {
                                              toggleOption(item)
                                            }
                                          }}
                                          className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-black/60 hover:text-black hover:bg-black/5 rounded-xl transition-colors text-left"
                                        >
                                          <span className={item.color}>{item.icon}</span>
                                          {item.label}
                                        </button>
                                      ))}
                                      <div className="h-px bg-black/5 my-1 mx-2" />
                                      <div className="relative">
                                        <button
                                          onMouseEnter={() => setHoveredItem('styles')}
                                          className="flex items-center justify-between w-full px-3 py-2 text-[13px] text-black/60 hover:text-black hover:bg-black/5 rounded-xl transition-colors text-left"
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <PenLineIcon className="size-4 text-orange-500" />
                                            Use Style
                                          </div>
                                          <ChevronRightIcon className="size-3 opacity-30" />
                                        </button>

                                        {hoveredItem === 'styles' && (
                                          <motion.div
                                            initial={{ opacity: 0, x: 5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            className="absolute left-full bottom-0 ml-1 w-40 bg-white rounded-xl shadow-2xl border border-black/5 p-1"
                                          >
                                            {styleOptions.map((opt) => (
                                              <button
                                                key={opt.id}
                                                onClick={() => {
                                                  toggleOption(opt);
                                                  setHoveredItem(null);
                                                  setIsPlusMenuOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-[12px] text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
                                              >
                                                {opt.label}
                                              </button>
                                            ))}
                                          </motion.div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className="flex items-center gap-2">
                                {promptValue.trim() ? (
                                  <Button
                                    className="size-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                                    onClick={() => handleSendMessage(promptValue)}
                                  >
                                    <ArrowUpIcon className="size-5" />
                                  </Button>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {isListening && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 rounded-xl border border-red-100 text-red-500 hover:bg-red-50"
                                        onClick={() => {
                                          (window as any).recognition?.stop();
                                          setIsListening(false);
                                        }}
                                      >
                                        <XIcon className="size-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "size-9 rounded-xl border transition-all",
                                        isListening ? "text-orange-500 bg-orange-50 animate-pulse border-orange-200" : "text-black/20 hover:text-black border-black/5 hover:bg-black/5"
                                      )}
                                      onClick={startListening}
                                    >
                                      <AudioLinesIcon className="size-5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-center text-[12px] text-black/20 mt-4 tracking-tight font-medium">
                      Revio is AI and can make mistakes. Please double-check responses.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {isDocPanelOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 z-50 h-full w-[400px] border-l border-black/5 bg-[#fffaf7]/95 backdrop-blur-xl flex flex-col pt-10 rounded-l-[40px] scrollbar-hide overflow-y-auto"
            >
              <div className="flex items-center justify-between px-8 mb-8 shrink-0">
                <h2 className="text-[20px] font-bold text-black tracking-tight">Research Papers</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-black/30 hover:text-black hover:bg-black/5 rounded-full"
                  onClick={() => setIsDocPanelOpen(false)}
                >
                  <XIcon className="size-5" />
                </Button>
              </div>

              <div className="flex-1 px-6 pb-12 space-y-4">
                {papers.map((paper) => (
                  <div key={paper.id} className="group relative bg-white rounded-[24px] p-6 shadow-sm border border-black/[0.05] hover:border-black/10 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-11 rounded-full bg-green-50 flex items-center justify-center border border-green-100/50">
                        <div className="flex items-center gap-[1px] leading-none mb-0.5">
                          <span className="text-green-600 font-bold text-[18px] leading-none">{paper.score}</span>
                          <span className="text-green-600/80 font-bold text-[11px] mt-1">%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "size-8 rounded-full transition-colors",
                            summaryPaperId === paper.id ? "bg-black/5 text-black" : "text-black/30 hover:text-black hover:bg-black/5"
                          )}
                          title="View summary"
                          onClick={() => setSummaryPaperId(summaryPaperId === paper.id ? null : paper.id)}
                        >
                          <InfoIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-black/30 hover:text-black hover:bg-black/5 rounded-full"
                          title="Read paper"
                        >
                          <BookOpenIcon className="size-4" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-8 rounded-lg gap-2 px-3 border-black/[0.05] transition-colors",
                              savingPaperId === paper.id ? "bg-black text-white" : "bg-black/[0.02] text-black/60 hover:text-black"
                            )}
                            onClick={() => setSavingPaperId(savingPaperId === paper.id ? null : paper.id)}
                          >
                            <span className="text-[12px] font-medium">Save</span>
                            <BookmarkIcon className="size-3.5" />
                          </Button>

                          <AnimatePresence>
                            {savingPaperId === paper.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute top-full right-0 mt-2 w-[180px] bg-white border border-black/10 rounded-xl shadow-xl p-1.5 z-[60]"
                              >
                                <p className="px-2 py-1.5 text-[10px] font-bold text-black/30 uppercase tracking-wider">Save to project</p>
                                {projects.map(project => (
                                  <button
                                    key={project}
                                    className="w-full text-left px-2 py-1.5 text-[12px] text-black/60 hover:text-black hover:bg-black/5 rounded-md transition-colors"
                                    onClick={() => setSavingPaperId(null)}
                                  >
                                    {project}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-black/80">{paper.publisher}</span>
                        <span className="text-[11px] text-black/30 font-medium">• {paper.year}</span>
                      </div>
                      <h3 className="text-[16px] font-bold text-[#1a1a1a] leading-tight line-clamp-2">{paper.title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {paper.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-black/[0.03] text-[11px] text-black/60 font-medium rounded-full border border-black/[0.02]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mb-4">
                      <AnimatePresence>
                        {summaryPaperId === paper.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="mt-1 text-[12px] leading-relaxed text-black/60 italic border-l-2 border-orange-200 pl-3 py-1">
                              {paper.summary}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="h-px bg-black/[0.04] mb-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-[#1a1a1a]">{paper.citations.toLocaleString()}</span>
                        <span className="text-[10px] text-black/30 font-semibold tracking-wider uppercase">Citations</span>
                      </div>
                      <Button
                        className="h-10 px-5 rounded-xl bg-[#1a1a1a] hover:bg-black text-white text-[13px] font-bold shadow-sm"
                        onClick={() => toggleOption({ id: paper.id, label: paper.title, icon: <FileTextIcon className="size-4" />, color: "text-green-500", type: 'paper' })}
                      >
                        Pull In Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0])
            e.target.value = '' // Reset input so same file can be selected again
          }
        }}
      />

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-24 left-1/2 z-[100] px-4 py-2 bg-[#1a1a1a] text-white rounded-full shadow-2xl flex items-center gap-2 border border-white/10"
            style={{
              marginLeft: isSidebarOpen ? (isDocPanelOpen ? -72 : 128) : (isDocPanelOpen ? -168 : 32)
            }}
          >
            <div className="size-4 rounded-full bg-orange-500 flex items-center justify-center">
              <span className="text-[10px] font-bold">✸</span>
            </div>
            <span className="text-[13px] font-medium">{toast?.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarInset>
  )
}

export default function Page() {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <PageContent />
    </SidebarProvider>
  )
}
