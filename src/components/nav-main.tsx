"use client"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
    isActive?: boolean
    shortcut?: string
  }[]
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title} className="group/nav-item">
          <SidebarMenuButton
            isActive={item.isActive}
            render={
              <a href={item.url} className="flex items-center w-full">
                {item.icon}
                <span className="ml-2">{item.title}</span>
                {item.shortcut && (
                  <span className="ml-auto opacity-0 group-hover/nav-item:opacity-100 transition-opacity text-[10px] text-black/50 font-bold tracking-tight">
                    {item.shortcut}
                  </span>
                )}
              </a>
            }
            tooltip={item.title}
          />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
