"use client"

import { SidebarLeft } from "@/components/sidebar-left"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import * as React from "react"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { PlusIcon, SearchIcon, ChevronDownIcon, FolderIcon, CalendarIcon, MoreVerticalIcon, LayoutGridIcon, ChevronRightIcon, Trash2Icon } from "lucide-react"

import { useRouter } from "next/navigation"

interface Project {
  id: string
  name: string
  description: string
  created_at: string
}

export default function Page() {
  const router = useRouter()
  const [user, setUser] = React.useState<User | null>(null)
  const [projects, setProjects] = React.useState<Project[]>([])
  const [isCreating, setIsCreating] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [newDesc, setNewDesc] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProjects = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (data) setProjects(data)
    setLoading(false)
  }

  React.useEffect(() => {
    if (user) fetchProjects()
  }, [user])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !user) return

    const payloadDescription = JSON.stringify({
      text: newDesc
    })

    const { data, error } = await supabase
      .from("projects")
      .insert([{ name: newName, description: payloadDescription, user_id: user.id }])
      .select()

    if (data) {
      setProjects([data[0], ...projects])
      setNewName("")
      setNewDesc("")
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    // Optimistic update
    setProjects(projects.filter(p => p.id !== id))
    
    // Delete from Supabase
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      
    if (error) {
      console.error("Failed to delete project:", error)
      // Revert on failure
      fetchProjects()
    }
  }

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fffaf7] p-4 text-center">
        <div className="size-16 rounded-3xl bg-orange-500/10 flex items-center justify-center mb-6">
          <FolderIcon className="size-8 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Projects & Workspace</h1>
        <p className="text-black/40 max-w-sm mb-8">Please sign in to access your projects and manage your research workspaces.</p>
        <Button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="bg-[#1a1a1a] hover:bg-black text-white px-8 h-11 rounded-xl"
        >
          Sign In to Continue
        </Button>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset className="bg-[#fffaf7]">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center px-6 bg-[#fffaf7]">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
          </div>
        </header>

        <main className="p-8 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-medium text-[#1a1a1a] tracking-tight font-serif">Projects</h1>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-[#1a1a1a] hover:bg-black text-white rounded-xl h-10 px-4 gap-2 text-[14px] font-medium shadow-sm transition-all"
            >
              <PlusIcon className="size-4" strokeWidth={2.5} />
              New project
            </Button>
          </div>

          <div className="relative mb-4">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-black/40" />
            <input 
              type="text"
              placeholder="Search projects..."
              className="w-full h-12 pl-11 pr-4 bg-white border border-black/10 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-black/5 transition-shadow"
            />
          </div>

          <div className="flex justify-end mb-12">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/[0.02] text-[13px] text-black/60 transition-colors">
              <span>Sort by</span>
              <span className="font-medium text-black">Activity</span>
              <ChevronDownIcon className="size-3.5 text-black/40" />
            </button>
          </div>

          {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl w-full max-w-[400px] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-6">
                  <h2 className="text-[22px] font-medium tracking-tight text-[#1a1a1a] font-serif">Create project</h2>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#1a1a1a]">Title</label>
                    <input 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Name your project"
                      autoFocus
                      className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-[#1a1a1a]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#1a1a1a]">Description <span className="text-black/40 font-normal">(Optional)</span></label>
                    <textarea 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Brief goals, subject, etc..."
                      rows={3}
                      className="w-full bg-white border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none text-[#1a1a1a]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="rounded-lg h-9 px-4 text-[13px] font-medium text-[#1a1a1a] hover:bg-black/5">Cancel</Button>
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg h-9 px-5 text-[13px] font-medium shadow-sm">Create</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              let parsedDesc = project.description
              try {
                const parsed = JSON.parse(project.description)
                if (parsed.text !== undefined) parsedDesc = parsed.text
              } catch (e) {
                // Ignore, it's a legacy plain text description
              }

              return (
              <div 
                key={project.id}
                className="group relative bg-white border border-[#e5e5e5] rounded-xl p-6 transition-all cursor-pointer hover:shadow-sm hover:border-black/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <FolderIcon className="size-5 text-orange-600" />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 -mr-1.5 text-black/40 hover:text-black hover:bg-black/5 rounded-md transition-all flex-shrink-0 z-10 relative">
                        <MoreVerticalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] rounded-xl shadow-lg border-black/5 p-1">
                       <DropdownMenuItem 
                         onClick={(e) => {
                           e.stopPropagation()
                           handleDeleteProject(project.id)
                         }}
                         className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-lg text-[13px] font-medium p-2 gap-2"
                       >
                          <Trash2Icon className="size-4" />
                          Delete Project
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div 
                   onClick={() => router.push(`/?project=${project.id}`)}
                   className="absolute inset-0 z-0" 
                />
                <div className="relative pointer-events-none z-0">
                  <h3 className="font-medium text-lg text-[#1a1a1a] mb-1.5 font-serif line-clamp-1">{project.name}</h3>
                  <p className="text-black/60 text-[13px] leading-relaxed line-clamp-2 h-10 mb-6">{parsedDesc || "Experimental research workspace for exploring paper insights."}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
                   <div className="flex items-center gap-1.5 text-black/40">
                      <CalendarIcon className="size-3.5" />
                      <span className="text-[12px]">{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                   </div>
                </div>
               </div>
              )
            })}

            {projects.length === 0 && !loading && (
              <div className="col-span-full pt-16 flex flex-col items-center justify-center text-center">
                <div className="mb-6 relative">
                  <LayoutGridIcon className="size-14 text-black stroke-[1.5]" />
                  <div className="absolute -bottom-2 -right-2 bg-[#fffaf7] rounded-full p-1 border-2 border-[#fffaf7]">
                    <span className="block size-6 bg-[#fffaf7] rounded-full border-2 border-dashed border-black/30 animate-[spin_10s_linear_infinite]" />
                  </div>
                </div>
                <h3 className="font-medium text-[17px] text-[#1a1a1a] mb-3">Looking to start a project?</h3>
                <p className="text-black/60 text-[15px] max-w-sm mx-auto leading-relaxed mb-8">
                  Upload materials, set custom instructions, and organize conversations in one space.
                </p>
                <Button 
                  onClick={() => setIsCreating(true)}
                  variant="outline"
                  className="rounded-xl h-10 px-5 gap-2 border-black/10 hover:bg-black/[0.02]"
                >
                  <PlusIcon className="size-4 opacity-50" strokeWidth={2.5} />
                  New project
                </Button>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
