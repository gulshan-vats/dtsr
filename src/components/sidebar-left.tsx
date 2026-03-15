"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { TeamSwitcher } from "@/components/team-switcher"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  User2Icon,
  SearchIcon,
  BookOpenIcon,
  MessageSquareIcon,
  ClockIcon,
  MoreHorizontalIcon,
  PlusIcon,
  FolderIcon,
  CompassIcon,
  SettingsIcon,
  Trash2Icon,
  GhostIcon,
  FolderPlusIcon,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOutIcon, BadgeCheckIcon, CreditCardIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

// This is sample data.
const data = {
  teams: [
    {
      name: "Revio",
      logo: <span className="text-[#ff751f] font-bold text-[30px] leading-none">✸</span>,
      plan: "Enterprise",
    },
  ],
  topNav: [
    {
      title: "New Chat",
      url: "/",
      icon: <PlusIcon className="size-4" />,
      shortcut: "⇧⌘O",
    },
    {
      title: "Projects",
      url: "/dashboard",
      icon: <FolderIcon className="size-4" />,
      shortcut: "⌘P",
    },
  ],
  mainNav: [
    {
      title: "Personal Research",
      url: "#",
      icon: <GhostIcon className="size-4" />,
      shortcut: "⌘K",
    },
    {
      title: "Library",
      url: "#",
      icon: <BookOpenIcon className="size-4" />,
      shortcut: "⌘L",
    },
    {
      title: "Discover",
      url: "#",
      icon: <CompassIcon className="size-4" />,
      shortcut: "⌘D",
    },
  ],
}

interface ChatSession {
  id: string
  title: string
  created_at: string
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const { state } = useSidebar()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session')
  const [user, setUser] = React.useState<any>(null)
  const [sessions, setSessions] = React.useState<ChatSession[]>([])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleDeleteChat = async (id: string) => {
    try {
      // Optimistic update
      setSessions((prev) => prev.filter((s) => s.id !== id))
      
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success("Chat deleted permanently")
      
      if (sessionId === id) {
        router.push("/")
      }
    } catch (err) {
      console.error("Error deleting session:", err)
      // Re-fetch on error to sync back
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) setSessions(data)
    }
  }

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
    if (!user) {
      setSessions([])
      return
    }

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (data) {
        setSessions(data)
      } else if (error && (error.code === 'PGRST205' || error.message?.includes('does not exist'))) {
        console.error("Database table 'sessions' missing. Please run the SQL in walkthrough.md")
      }
    }

    fetchSessions()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchSessions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return (
    <Sidebar className="border-r border-black/5" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1 px-1">
          {state === "expanded" ? (
            <>
              <TeamSwitcher teams={data.teams} />
              <div className="ml-auto">
                <SidebarTrigger />
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-center py-2">
              <SidebarTrigger />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <div className="py-1">
           <NavMain items={data.topNav} />
        </div>
        
        <div className="px-3 my-1">
           <Separator className="bg-black/10" />
        </div>

        <div className="py-1">
           <NavMain items={data.mainNav} />
        </div>
        
        <div className="px-3 my-1">
           <Separator className="bg-black/10" />
        </div>

        {state === "expanded" && (
          <>
            <div className="px-3 py-1.5 flex items-center gap-2 text-[13px] font-medium text-black/40">
              Recents
            </div>

            <div className="flex flex-col gap-0.5 mb-2">
              {sessions.map((chat) => (
                <div key={chat.id} className="group relative">
                  <Link
                    href={`/?session=${chat.id}`}
                    className={cn(
                      "flex items-center px-3 py-1 text-[14px] text-black/70 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors overflow-hidden pr-8",
                      sessionId === chat.id && "bg-black/[0.04] text-black font-medium"
                    )}
                  >
                    <span className="truncate block w-full">{chat.title || "New Chat"}</span>
                  </Link>
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        render={
                          <button className="p-1 hover:bg-black/5 rounded-md transition-colors">
                            <MoreHorizontalIcon className="size-4 text-black/40" />
                          </button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem className="p-2 rounded-lg cursor-pointer">
                          <FolderPlusIcon className="size-4 mr-2 opacity-40" />
                          Add to project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer p-2 rounded-lg"
                          onClick={() => handleDeleteChat(chat.id)}
                        >
                          <Trash2Icon className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="px-3 py-4 flex flex-col gap-2 bg-orange-500/5 rounded-xl border border-orange-500/10 mx-2">
                  <div className="text-[11px] text-orange-600 font-bold flex items-center gap-1.5 uppercase tracking-tight">
                    <ClockIcon className="size-3" /> No recent chats
                  </div>
                  <p className="text-[10px] text-black/40 leading-relaxed italic">
                    If you already ran your first instruction, make sure to <b>run the SQL</b> from <u>walkthrough.md</u> to see them here!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2 bg-white/50">
        <div className="px-3 mb-1">
           <Separator className="bg-black/10" />
        </div>
        <SidebarMenu>
           <SidebarMenuItem>
              <SidebarMenuButton 
                 size="lg" 
                 tooltip="Settings"
                 className={cn(
                   "hover:bg-black/[0.03] rounded-xl transition-all h-10 px-3",
                   state === "collapsed" && "justify-center px-0"
                 )}
              >
                 <SettingsIcon className="size-4 opacity-40 shrink-0" />
                 {state === "expanded" && <span className="text-[14px] font-medium text-black/60">Settings</span>}
              </SidebarMenuButton>
           </SidebarMenuItem>
            <SidebarMenuItem>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton 
                        size="lg" 
                        tooltip={user.user_metadata?.full_name || user.email}
                        className={cn(
                          "hover:bg-black/[0.03] rounded-xl mt-1 h-auto py-2 transition-all px-2",
                          state === "collapsed" && "justify-center px-0"
                        )}
                      >
                        <div className={cn(
                          "size-8 rounded-xl bg-black/[0.03] flex items-center justify-center text-black/40 border border-black/5 shrink-0 transition-colors group-hover:bg-black/[0.06] group-hover:text-black",
                          state === "collapsed" && "mx-auto"
                        )}>
                          <User2Icon className="size-4" />
                        </div>
                        {state === "expanded" && (
                          <div className="flex flex-col items-start gap-0 overflow-hidden ml-1.5">
                            <span className="text-[14px] font-bold text-black/70 truncate w-full tracking-tight leading-tight">
                              {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                            </span>
                            <span className="text-[11px] text-black/30 truncate w-full tracking-tight leading-tight">
                              {user.email}
                            </span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    }
                  />
                  <DropdownMenuContent
                    className="w-56 rounded-xl border-orange-500/10"
                    side={state === "collapsed" ? "right" : "top"}
                    align="start"
                    sideOffset={12}
                  >
                    <DropdownMenuLabel className="font-normal p-2">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1">Signed in as</span>
                          <span className="text-sm font-bold text-black">{user.user_metadata?.full_name || user.email}</span>
                       </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="p-2 rounded-lg cursor-pointer">
                      <BadgeCheckIcon className="size-4 mr-2 opacity-40" /> Account
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-2 rounded-lg cursor-pointer">
                      <CreditCardIcon className="size-4 mr-2 opacity-40" /> Billing
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="p-2 rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOutIcon className="size-4 mr-2" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SidebarMenuButton 
                  size="lg" 
                  tooltip="Sign In"
                  className={cn(
                    "hover:bg-orange-600 bg-[#ff751f] text-white rounded-xl mt-1 h-10 transition-all font-bold px-3",
                    state === "collapsed" && "justify-center px-0"
                  )}
                  onClick={() => router.push("/login")}
                >
                  <User2Icon className="size-4 shrink-0" />
                  {state === "expanded" && <span className="ml-2">Sign In</span>}
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
