"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0])
  if (!activeTeam) {
    return null
  }
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-1.5 px-2 py-1.5">
          {activeTeam.logo}
          <span className="font-bold text-[20px] tracking-tight text-[#1a1a1a]">{activeTeam.name}</span>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
