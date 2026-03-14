"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  TerminalIcon,
  AudioLinesIcon,
  SearchIcon,
  MessageSquarePlusIcon,
  FileTextIcon,
  BookOpenIcon,
  StarIcon,
  MessageSquareIcon,
  ClockIcon
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

// This is sample data.
const data = {
  teams: [
    {
      name: "Revio",
      logo: <span className="text-[#ff751f] font-bold text-[36px] leading-none">✸</span>,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "New Chat",
      url: "#",
      icon: <MessageSquarePlusIcon className="text-blue-500" />,
    },
    {
      title: "Project",
      url: "#",
      icon: <FileTextIcon className="text-purple-500" />,
    },
    {
      title: "Research Papers",
      url: "#",
      icon: <BookOpenIcon className="text-green-500" />,
    },
    {
      title: "Favourites",
      url: "#",
      icon: <StarIcon className="text-orange-500" />,
    },
  ],
  recentChats: [
    {
      title: "Transformer Architecture Analysis",
      url: "#",
    },
    {
      title: "Few-Shot Learning Trends",
      url: "#",
    },
    {
      title: "Optimization Strategies 2024",
      url: "#",
    },
  ],
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  return (
    <Sidebar className="border-r border-black/5" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1 px-2">
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
        <NavMain items={data.navMain} />

        {state === "expanded" && (
          <>
            <div className="my-2 px-2">
              <div className="h-px bg-black/[0.07]" />
            </div>

            <div className="px-2 mb-2 flex items-center gap-2 text-[11px] font-bold text-black/40 uppercase tracking-wider">
              <ClockIcon className="size-3" />
              Recent
            </div>

            <div className="flex flex-col gap-1 mb-6">
              {data.recentChats.map((chat) => (
                <a
                  key={chat.title}
                  href={chat.url}
                  className="flex items-center gap-3 px-3 py-2 text-[13px] text-black/60 hover:text-black hover:bg-black/5 rounded-lg transition-colors group"
                >
                  <MessageSquareIcon className="size-4 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity" />
                  <span className="truncate">{chat.title}</span>
                </a>
              ))}
            </div>

            <div className="my-4 px-2">
              <Separator className="bg-black/[0.05]" />
            </div>
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
