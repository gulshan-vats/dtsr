"use client"

import { LoginForm } from "@/components/login-form"
import { DynamicGradient } from "@/components/dynamic-gradient"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white selection:bg-orange-100">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative">
        <div className="flex justify-center gap-2 md:justify-start items-center">
          <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
            <span className="text-[#ff751f] text-3xl leading-none">✸</span>
            Revio
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm mode="signup" />
          </div>
        </div>
        <div className="flex justify-center">
           <p className="text-[11px] text-black/20 uppercase tracking-[0.2em] font-bold">
             © 2026 Revio AI
           </p>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <DynamicGradient />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="text-center px-12 z-20">
              <div className="mb-8">
                 <span className="text-6xl text-[#ff751f]">✸</span>
              </div>
              <h2 className="text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
                The research brain <br />
                you didn't have.
              </h2>
              <p className="text-xl text-white/60 max-w-md mx-auto font-medium">
                Revio connects your questions to the papers that answer them.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
