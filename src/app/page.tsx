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
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ResearchPapersPanel from "@/components/research-papers-panel"
import { useSidebar } from "@/components/ui/sidebar" // Corrected import for useSidebar
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FileTextIcon,
  Share2Icon,
  XIcon,
  PlusIcon,
  AudioLinesIcon,
  ChevronDownIcon,
  ArrowDownIcon,
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
  LogOutIcon,
  LogInIcon,
  FolderIcon,
  CalendarIcon,
  LayoutGridIcon,
  LockIcon,
  StarIcon,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { ChartBarMultiple } from "@/components/charts/chat-charts"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ChatMessage } from "@/components/chat-message"
import { VISUALIZATION_SYSTEM_PROMPT } from "@/lib/systemPrompt"
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
  abstract?: string;
  authors?: string;
  pdfUrl?: string | null;
}

type OptionsData = {
  title?: string;
  options?: { id: string; label: string }[];
  steps?: { title: string; options: { id: string; label: string }[] }[];
}

const RESEARCH_PAPERS: ResearchPaper[] = [
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
  const [messages, setMessages] = React.useState<{ 
    role: 'user' | 'assistant'; 
    content: string;
    timestamp?: string;
  }[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadedDoc, setUploadedDoc] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [isDeepSearch, setIsDeepSearch] = React.useState(false)
  const [isWebMode, setIsWebMode] = React.useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false)
  const [shareMode, setShareMode] = React.useState<'private' | 'public'>('private')
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'info' | 'success' } | null>(null)
  const [thinkingStep, setThinkingStep] = React.useState(0)
  const thinkingSteps = ["Gathering sources...", "Analyzing data...", "Synthesizing answer...", "Formulating response..."]
  const [papers, setPapers] = React.useState<ResearchPaper[]>(RESEARCH_PAPERS)
  const [paperContexts, setPaperContexts] = React.useState<Record<string, string>>({})
  const [projects, setProjects] = React.useState<any[]>([])

  // Auth & Session state
  const [user, setUser] = React.useState<any>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeProjectId = searchParams.get("project")
  const randomId = React.useMemo(() => crypto.randomUUID(), [])
  const sessionId = searchParams.get("session") || randomId
  const [sessionTitle, setSessionTitle] = React.useState("New Research")
  const lastLoadedSessionId = React.useRef<string | null>(null)
  const [greeting, setGreeting] = React.useState("")
  const [subGreeting, setSubGreeting] = React.useState("")

  React.useEffect(() => {
    const hour = new Date().getHours()
    const name = user?.user_metadata?.full_name?.split(' ')[0] || "Orange"
    
    let g = ""
    if (hour < 12) g = "Good morning"
    else if (hour < 18) g = "Good afternoon"
    else g = "Good evening"
    
    setGreeting(`${g}, ${name}`)

    const questions = [
      "What are we finding today?",
      "Ready to dive into your research?",
      "Let's explore some new papers.",
      "What's on your mind for research?",
      "Shall we continue our investigation?"
    ]
    setSubGreeting(questions[Math.floor(Math.random() * questions.length)])
  }, [user])

  // Load user and session on mount
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  React.useEffect(() => {
    if (!user) return
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (data) setProjects(data)
    }
    fetchProjects()
  }, [user])

  // Load chat history and session title from Supabase
  React.useEffect(() => {
    if (!user) return

    const loadSessionData = async () => {
      // If we are already on this session and have messages, don't re-load history
      if (lastLoadedSessionId.current === sessionId && messages.length > 0) return
      
      // Reset before loading a DIFFERENT session
      if (lastLoadedSessionId.current !== sessionId) {
        setMessages([])
        setIsChatStarted(false)
        lastLoadedSessionId.current = sessionId
      }

      const { data: history, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (history && history.length > 0) {
        setMessages(history as any)
        setIsChatStarted(true)
      } else {
        // Only set to false if we are sure it's a new empty session
        setMessages([])
        setIsChatStarted(false)
      }

      // Load Title
      const { data: session } = await supabase
        .from('sessions')
        .select('title')
        .eq('id', sessionId)
        .single()
      
      if (session?.title) {
        setSessionTitle(session.title)
      } else {
        setSessionTitle("New Research")
      }
    }

    loadSessionData()
  }, [user, sessionId])

  // Dynamic Title Update
  React.useEffect(() => {
    if (sessionTitle) {
      document.title = `${sessionTitle} | Revio`;
    }
  }, [sessionTitle])

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
    // Also reset the state when manually scrolled
    setShowScrollButton(false)
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const [showScrollButton, setShowScrollButton] = React.useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const { scrollTop, scrollHeight, clientHeight } = target
    // Show button if we are scrolled up more than 100px from the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isAtBottom)
  }

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
  const handleSilentSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
      const searchData = await searchRes.json();
      if (searchRes.ok && searchData.results) {
        const newPapers = searchData.results.map((p: any) => ({
          id: p.id,
          title: p.title,
          score: Math.floor(Math.random() * 20) + 80,
          year: p.year,
          citations: p.citations || 0,
          authors: p.authors || "Unknown Authors",
          abstract: p.abstract || "No abstract available.",
          source: p.venue || "Semantic Scholar",
          tags: p.tags && p.tags.length > 0 ? p.tags : ["Research", "Academic"],
          url: p.url || "#"
        }));
        // Replace instead of merge for fresh context
        setPapers(newPapers);
        setToast({ message: `Loaded papers for "${query}"`, type: 'info' });
      }
    } catch (e) {
      console.error("Silent search failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (query: string) => {
    if (!query.trim()) return
    const userMsg = { 
      role: 'user' as const, 
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages((prev) => [...prev, userMsg])
    setPromptValue("")
    setIsChatStarted(true)
    setTimeout(() => scrollToBottom(), 0) // Instant scroll on Enter
    setIsLoading(true)

    try {
      const pulledPapers = selectedOptions.filter(opt => opt.type === 'paper')
      const finalQuery = isDeepSearch ? `Deep Research: ${query}` : query
      const queryWithContext = isWebMode
        ? `[WEB_MODE_ONLY] ${finalQuery}`
        : finalQuery

      // Build context based system prompt dynamically
      let dynamicSystemPrompt = "You are Revio, an AI research assistant.\n\n";
      let activeContext = "";

      if (!isWebMode) {
        pulledPapers.forEach(p => {
          if (paperContexts[p.id]) {
            activeContext += paperContexts[p.id] + "\n";
          } else {
            const paperData = papers.find(pp => pp.id === p.id);
            if (paperData) {
              activeContext += `Title: ${paperData.title}\nAbstract: ${paperData.abstract}\n[Full text unavailable]\n\n`;
            }
          }
        });

        if (uploadedDoc) {
          activeContext += `\n[UPLOADED DOCUMENT REFERENCE: ${uploadedDoc}]\n`;
        }
      }

      if (activeContext.trim()) {
        // Final safeguard for total context size
        const MAX_TOTAL_CONTEXT = 100000;
        const finalContext = activeContext.length > MAX_TOTAL_CONTEXT 
          ? activeContext.slice(0, MAX_TOTAL_CONTEXT) + "\n... [Context truncated for length]"
          : activeContext;

        dynamicSystemPrompt += `═══════════════════════════════\nLOADED PAPER — PRIMARY SOURCE\n═══════════════════════════════\n${finalContext}\nAnswer all questions using the paper above as your \nprimary reference. Quote specific sections when relevant.\nIf the answer is not found in the paper, say so clearly.\n═══════════════════════════════`;
      } else {
        dynamicSystemPrompt += "Answer based on your general research knowledge.";
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryWithContext,
          session_id: sessionId,
          user_id: user?.id || "guest",
          history: messages.map(m => ({ role: m.role, content: m.content })),
          system_prompt_suffix: dynamicSystemPrompt,
        }),
      })
      const data = await res.json()
      let assistantContent = res.ok ? data.response : (data.error || data.detail || "Something went wrong. Please try again.")

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
                const nextContent = assistantContent.replace(fullTag, "").trim();
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant') {
                    return [...prev.slice(0, -1), { role: 'assistant', content: nextContent }];
                  }
                  return prev;
                });
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
            const newPapers: any[] = searchData.results.map((p: any) => ({
              id: p.id,
              title: p.title,
              score: Math.floor(Math.random() * 20) + 80, // Mock score for UI
              year: p.year,
              citations: p.citations || 0,
              authors: p.authors || "Unknown Authors",
              abstract: p.abstract || "No abstract available for this research paper.",
              source: p.venue || "Semantic Scholar",
              tags: p.tags && p.tags.length > 0 ? p.tags : ["Research", "Academic"],
              url: p.url || "#"
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

      // Final UI Polish: If the message is just a selector/search tag, add context text
      if (assistantContent.replace(/\[SEARCH:.*\]/g, "").replace(/\[OPTIONS:.*\]/g, "").trim() === "") {
        if (hasOptions) {
          assistantContent = "I've generated some options to help refine your research. Please choose one below:"
        } else if (searchMatch) {
          assistantContent = "I'm searching for relevant papers based on your request. Results will appear in the document panel."
        }
      }

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: assistantContent,
      }])

      // Trigger session naming if this is the first message
      if (messages.length === 0 && user) {
        console.log("DEBUG: Triggering session naming for first message", { query, sessionId });
        fetch("/api/name-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ first_message: query, session_id: sessionId, user_id: user.id })
        }).then(async (r) => {
          if (r.ok) {
            const nameData = await r.json()
            console.log("DEBUG: Session naming success", nameData);
            if (nameData.title) setSessionTitle(nameData.title)
          } else {
            console.error("DEBUG: Session naming failed", r.status);
          }
        })
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Failed to reach the backend. Make sure the Python server is running on port 8000." }])
    } finally {
      setIsLoading(false)
      setSelectedOptions((prev) => prev.filter(o => o.type !== 'paper'))
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
                <BreadcrumbPage className="line-clamp-1 font-semibold text-[#1a1a1a]/60 capitalize">
                  {sessionTitle}
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
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 gap-2 px-3 border-black/10 bg-black/[0.02] hover:bg-black/5 text-black"
            onClick={() => setIsShareModalOpen(true)}
          >
            <Share2Icon className="size-4" />
            <span className="font-medium">Share</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <motion.div
          onScroll={handleScroll}
          animate={{
            marginRight: isDocPanelOpen ? 400 : (activeProjectId ? 340 : 0)
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="flex-1 overflow-auto flex flex-col relative h-[calc(100vh-64px)] scrollbar-hide"
        >
          {activeProjectId && (
            <div className="w-full max-w-3xl mx-auto px-6 pt-10 pb-4 flex items-center justify-between">
              <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight font-serif">{projects.find(p => p.id === activeProjectId)?.name || "Project"}</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-8 text-black/40 hover:text-black hover:bg-black/5 rounded-full"><MoreVerticalIcon className="size-4" /></Button>
                <Button variant="ghost" size="icon" className="size-8 text-black/40 hover:text-black hover:bg-black/5 rounded-full"><StarIcon className="size-4" /></Button>
              </div>
            </div>
          )}

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
                {!activeProjectId && (
                  <>
                    <h1 className="text-[48px] font-medium mb-3 tracking-tight flex items-center gap-4 text-[#1a1a1a]">
                      <span className="text-[#ff751f] text-[40px] leading-none">✸</span> {greeting}
                    </h1>
                    <p className="text-[18px] text-black/40 mb-8 font-medium">{subGreeting}</p>
                  </>
                )}

                <div className={cn("w-full relative group", activeProjectId ? "max-w-3xl mt-0" : "max-w-[720px]")}>
                  {/* Slow moving orange glow border that moves around */}
                  <div className="absolute inset-0 rounded-[28px] overflow-hidden">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,#ff751f_360deg)] opacity-40 blur-[2px] -z-10"
                    />
                  </div>
                  <div className="relative flex flex-col bg-white border border-black/35 rounded-[28px] p-3 shadow-sm transition-all duration-500 group-hover:border-orange-500/30">

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
                    return (
                      <React.Fragment key={i}>
                        {msg.role === 'user' ? (
                          <div id={isLastUserMsg ? "last-user-interaction" : undefined} className="flex flex-col w-full animate-in fade-in slide-in-from-right-4 duration-500 group/msg mb-4">
                            <div className="flex justify-end w-full mb-1">
                              <div className="bg-[#1a1a1a] px-5 py-2.5 rounded-[22px] rounded-tr-[4px] shadow-sm max-w-[85%] relative border border-white/5">
                                <p className="text-[14.5px] leading-relaxed text-white whitespace-pre-wrap">{msg.content}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 px-1 transition-opacity opacity-0 group-hover/msg:opacity-100">
                               <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">{msg.timestamp}</span>
                               <div className="flex items-center gap-1">
                                 <button 
                                   onClick={() => {
                                     setPromptValue(msg.content);
                                     setMessages(prev => prev.filter((_, idx) => idx !== i));
                                   }}
                                   className="p-1 text-black/20 hover:text-orange-500 transition-colors"
                                   title="Edit message"
                                 >
                                   <PenLineIcon className="size-3.5" />
                                 </button>
                                 <button 
                                   onClick={() => {
                                     navigator.clipboard.writeText(msg.content);
                                     setToast({ message: "Copied to clipboard", type: 'success' });
                                   }}
                                   className="p-1 text-black/20 hover:text-orange-500 transition-colors"
                                   title="Copy message"
                                 >
                                   <CopyIcon className="size-3.5" />
                                 </button>
                               </div>
                            </div>
                          </div>
                        ) : (
                          <ChatMessage
                            message={msg}
                            index={i}
                            isLatest={i === messages.length - 1}
                            isLoading={isLoading}
                            onCopy={handleCopy}
                            onFeedback={handleFeedback}
                          />
                        )}
                        {msg.role === 'assistant' && i < messages.length - 1 && (
                          <div className="w-full h-px bg-black/[0.03] my-10" />
                        )}
                      </React.Fragment>
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
                    <AnimatePresence>
                      {showScrollButton && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8, y: 10 }}
                          onClick={scrollToBottom}
                          className="absolute -top-[52px] left-1/2 -translate-x-1/2 size-10 bg-white border border-black/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-black/60 hover:text-black hover:bg-black/[0.02] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all z-50 pointer-events-auto active:scale-95"
                        >
                          <ArrowDownIcon className="size-4" strokeWidth={2.5} />
                        </motion.button>
                      )}
                    </AnimatePresence>
                    <div className={cn(
                      "relative flex flex-col bg-white border border-black/35 rounded-[28px] p-3 shadow-none transition-all duration-300",
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
                                      "w-full flex items-center gap-4 py-4 px-2 transition-all duration-200 text-left group border-b border-black/5 last:border-0",
                                      focusedOptionIndex === idx ? "bg-black/[0.02]" : ""
                                    )}
                                  >
                                    <div className={cn(
                                      "size-6 flex shrink-0 items-center justify-center rounded-[6px] transition-colors",
                                      isSelected ? "bg-black text-white" : "border border-black/20 bg-transparent text-transparent"
                                    )}>
                                      <CheckIcon className="size-3.5" strokeWidth={3} />
                                    </div>
                                    <span className={cn(
                                      "text-[15px] transition-colors leading-relaxed",
                                      isSelected ? "text-black font-semibold" : "text-black/70 font-medium"
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
                                  "w-full flex items-center gap-4 py-4 px-2 transition-all duration-200 text-left group",
                                  focusedOptionIndex === (activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options.length || 0) : (activeOptions.options?.length || 0))
                                    ? "bg-black/[0.02]"
                                    : ""
                                )}
                                onMouseEnter={() => setFocusedOptionIndex(activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options.length || 0) : (activeOptions.options?.length || 0))}
                              >
                                <div className={cn(
                                  "size-6 flex shrink-0 items-center justify-center rounded-[6px] transition-colors",
                                  "border border-black/10 bg-black/[0.02] text-black/40"
                                )}>
                                  <PenLineIcon className="size-3.5" />
                                </div>
                                <span className={cn(
                                  "text-[15px] transition-colors leading-relaxed italic",
                                  focusedOptionIndex === (activeOptions.steps ? (activeOptions.steps[currentStepIndex]?.options.length || 0) : (activeOptions.options?.length || 0)) ? "text-black font-medium" : "text-black/40"
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
            <ResearchPapersPanel
              papers={papers as any}
              isLoading={isLoading}
              onClose={() => setIsDocPanelOpen(false)}
              onSearch={(q) => handleSilentSearch(q)}
              onPullInChat={(paper, extractedContext) => {
                setPaperContexts(prev => ({ ...prev, [paper.id]: extractedContext }))
                setSelectedOptions(prev => {
                  if (prev.find(o => o.id === paper.id)) return prev;
                  return [
                    ...prev,
                    {
                      id: paper.id,
                      label: paper.title,
                      icon: <BookOpenIcon className="size-3" />,
                      color: "bg-orange-500/10 text-orange-600",
                      type: 'paper'
                    }
                  ]
                })
                setToast({ message: "Added to context", type: 'success' })
              }}
            />
          )}
        </AnimatePresence>
      </div >

      {/* Right side Project Context Panel */}
      <AnimatePresence>
        {activeProjectId && !isDocPanelOpen && (
          <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             className="absolute right-0 top-16 bottom-0 w-[340px] border-l border-[#e5e5e5] bg-[#fafafa] flex flex-col overflow-y-auto"
          >
             <div className="p-4 space-y-4">
               {/* Memory Card */}
               <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#e5e5e5]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="font-semibold text-[14px] text-[#1a1a1a]">Memory</h3>
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 text-black/40 text-[11px] font-medium">
                     <LockIcon className="size-3" />
                     Only you
                   </div>
                 </div>
                 <p className="text-[13px] text-black/40 leading-relaxed">
                   Project memory will show here after a few chats.
                 </p>
               </div>

               {/* Instructions Card */}
               <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#e5e5e5]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="font-semibold text-[14px] text-[#1a1a1a]">Instructions</h3>
                   <button className="size-6 flex items-center justify-center rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors">
                     <PlusIcon className="size-4" />
                   </button>
                 </div>
                 <p className="text-[13px] text-black/40 leading-relaxed">
                   Add instructions to tailor Revio's responses
                 </p>
               </div>

               {/* Files Card */}
               <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#e5e5e5]">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-semibold text-[14px] text-[#1a1a1a]">Files</h3>
                   <button className="size-6 flex items-center justify-center rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors">
                     <PlusIcon className="size-4" />
                   </button>
                 </div>
                 <div className="bg-[#f5f4ef] rounded-2xl p-6 flex flex-col items-center justify-center text-center border overflow-hidden border-dashed border-black/10">
                   <div className="flex -space-x-3 mb-4 scale-90 opacity-40">
                      <div className="size-10 bg-white border border-black/20 rounded-md shadow-sm transform -rotate-6" />
                      <div className="size-10 bg-white border border-black/20 rounded-md shadow-sm transform rotate-6" />
                      <div className="size-10 bg-white border border-black/20 rounded-md shadow-sm z-10 flex items-center justify-center">
                        <PlusIcon className="size-4 stroke-[3]" />
                      </div>
                   </div>
                   <p className="text-[12px] font-medium text-black/50 leading-relaxed px-2">
                     Add PDFs, documents, or other text to reference in this project.
                   </p>
                 </div>
               </div>

             </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[500px] bg-[#fffaf5] rounded-[32px] overflow-hidden shadow-2xl border border-white/40"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[24px] font-bold text-black tracking-tight">Share chat</h3>
                  <button 
                    onClick={() => setIsShareModalOpen(false)}
                    className="size-9 flex items-center justify-center text-black/20 hover:text-black hover:bg-black/5 rounded-full transition-all"
                  >
                    <XIcon className="size-6" />
                  </button>
                </div>
                <p className="text-[16px] text-black/40 font-medium mb-8">Only messages up to this point will be shared.</p>

                <div className="space-y-0 border border-black/5 rounded-[24px] overflow-hidden bg-white/50 mb-6">
                  <button 
                    onClick={() => setShareMode('private')}
                    className={cn(
                      "w-full flex items-center justify-between px-8 py-6 transition-all group",
                      shareMode === 'private' ? "bg-white" : "hover:bg-white/40"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "size-12 rounded-full flex items-center justify-center border",
                        shareMode === 'private' ? "bg-orange-500/5 border-orange-200 text-orange-600" : "bg-black/5 border-transparent text-black/30 group-hover:text-black/60"
                      )}>
                        <LockIcon className="size-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[17px] font-bold text-black">Keep private</p>
                        <p className="text-[14px] text-black/40 font-medium">Only you have access</p>
                      </div>
                    </div>
                    {shareMode === 'private' && <CheckIcon className="size-6 text-blue-500" />}
                  </button>

                  <div className="h-px bg-black/5 mx-8" />

                  <button 
                    onClick={() => setShareMode('public')}
                    className={cn(
                      "w-full flex items-center justify-between px-8 py-6 transition-all group",
                      shareMode === 'public' ? "bg-white" : "hover:bg-white/40"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "size-12 rounded-full flex items-center justify-center border",
                        shareMode === 'public' ? "bg-orange-500/5 border-orange-200 text-orange-600" : "bg-black/5 border-transparent text-black/30 group-hover:text-black/60"
                      )}>
                        <GlobeIcon className="size-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[17px] font-bold text-black">Create public link</p>
                        <p className="text-[14px] text-black/40 font-medium">Anyone with the link can view</p>
                      </div>
                    </div>
                    {shareMode === 'public' && <CheckIcon className="size-6 text-blue-500" />}
                  </button>
                </div>

                {shareMode === 'public' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8"
                  >
                    <div className="flex items-center gap-2 p-3 bg-black/[0.03] border border-black/5 rounded-xl">
                      <input 
                        readOnly 
                        value={`${window.location.origin}${window.location.pathname}?session=${sessionId}`}
                        className="flex-1 bg-transparent text-[13px] text-black/60 outline-none px-2"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 gap-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          const url = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
                          navigator.clipboard.writeText(url);
                          setToast({ message: "URL copied to clipboard!", type: 'success' });
                        }}
                      >
                        <CopyIcon className="size-3.5" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-[11px] text-black/30 mt-2 px-1">This link allows anyone with the link to view this chat after they authenticate.</p>
                  </motion.div>
                )}

                <div className="mt-2">
                  <p className="text-[13px] text-black/40 leading-relaxed font-medium mb-8">
                    Don’t share personal information or third-party content without permission, and see our <span className="underline cursor-pointer">Usage Policy</span>.
                  </p>

                  <Button 
                    className="w-full h-14 rounded-[20px] bg-[#1a1a1a] hover:bg-[#000] text-white font-bold text-[17px] shadow-sm"
                    onClick={() => {
                      if (shareMode === 'public') {
                        const url = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
                        navigator.clipboard.writeText(url);
                        setToast({ message: "Public link created and copied!", type: 'success' });
                      } else {
                        setToast({ message: "Access updated to private", type: 'success' });
                      }
                      setIsShareModalOpen(false);
                    }}
                  >
                    {shareMode === 'public' ? "Create share link" : "Update access"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
