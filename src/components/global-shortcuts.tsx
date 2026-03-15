"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function GlobalShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return
      }

      // New Chat: Shift + Cmd + O (or Shift + Ctrl + O)
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault()
        router.push("/")
      }
      
      // Projects: Cmd + P (or Ctrl + P)  -- overriding default print behavior
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        router.push("/dashboard")
      }

      // Personal Research: Cmd + K (or Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        // Assuming this should just stay on current / no-op for now based on "#" url, 
        // or toggle a drawer. Currently mapping to same route logic.
        console.log("Personal Research shortcut triggered")
      }

      // Library: Cmd + L (or Ctrl + L)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault()
        console.log("Library shortcut triggered")
      }

      // Discover: Cmd + D (or Ctrl + D)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        console.log("Discover shortcut triggered")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return null
}
