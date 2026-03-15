"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Github, Chrome, Mail, Lock, User, AtSign, ArrowRight } from "lucide-react"

interface AuthFormProps {
  mode: "login" | "signup"
  className?: string
}

export function AuthForm({ mode, className }: AuthFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [fullName, setFullName] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
        if (error) throw error
        if (data?.user?.identities?.length === 0) {
          setError("This email is already registered. Please sign in.")
        } else {
          router.push("/")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push("/")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className={cn("grid gap-8 w-full max-w-[380px]", className)}>
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] font-bold tracking-tight text-white leading-tight">
          {mode === "login" ? "Welcome back" : "Get Started"}
        </h1>
        <p className="text-[14px] text-white/40">
          {mode === "login" 
            ? "Enter your credentials to access your account" 
            : "Complete these easy steps to register your account"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-11 transition-all h-12 font-medium"
          onClick={() => handleOAuthSignIn('google')}
        >
          <Chrome className="mr-2 size-4 text-orange-500" /> Google
        </Button>
        <Button 
          variant="outline" 
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl h-11 transition-all h-12 font-medium"
          onClick={() => handleOAuthSignIn('github')}
        >
          <Github className="mr-2 size-4 text-white" /> Github
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10"></span>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
          <span className="bg-[#0a0a0a] px-3 text-white/20">or</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 rounded-xl py-3">
          <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-5">
        {mode === "signup" && (
          <div className="grid gap-2">
            <Label htmlFor="fullName" className="text-[12px] font-bold text-white/30 ml-1 uppercase tracking-wider">First & Last Name</Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
              <Input
                id="fullName"
                placeholder="eg. Gulshan Vats"
                type="text"
                autoCapitalize="words"
                autoComplete="name"
                disabled={loading}
                required
                className="bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl h-12 pl-11 focus:ring-orange-500 focus:border-orange-500 transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-[12px] font-bold text-white/30 ml-1 uppercase tracking-wider">Email</Label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
            <Input
              id="email"
              placeholder="eg. hi@hextastudio.in"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={loading}
              required
              className="bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl h-12 pl-11 focus:ring-orange-500 focus:border-orange-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between ml-1">
            <Label htmlFor="password" className="text-[12px] font-bold text-white/30 uppercase tracking-wider">Password</Label>
            {mode === "login" && (
              <button 
                type="button" 
                className="text-[11px] text-orange-500 font-bold hover:text-orange-400 transition-colors"
              >
                Forgot?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/20" />
            <Input
              id="password"
              placeholder="••••••••••••"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              disabled={loading}
              required
              className="bg-white/5 border-white/5 text-white placeholder:text-white/20 rounded-xl h-12 pl-11 focus:ring-orange-500 focus:border-orange-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === "signup" && (
            <p className="text-[10px] text-white/20 ml-1 italic mt-1">Must be at least 8 characters.</p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="bg-white hover:bg-white/90 text-black font-bold h-12 rounded-xl mt-2 transition-all shadow-xl shadow-white/5"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>{mode === "login" ? "Log In" : "Sign Up"} <ArrowRight className="ml-2 size-4" /></>
          )}
        </Button>
      </form>

      <div className="text-center text-[13px] text-white/40 mt-2">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <button 
              onClick={() => router.push("/signup")}
              className="text-white font-bold hover:underline underline-offset-4"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button 
              onClick={() => router.push("/login")}
              className="text-white font-bold hover:underline underline-offset-4"
            >
              Log in
            </button>
          </>
        )}
      </div>
    </div>
  )
}
