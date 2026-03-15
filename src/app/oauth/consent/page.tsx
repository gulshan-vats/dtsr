"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, ShieldCheck, ArrowRight, Loader2, Lock, Shield, Info } from "lucide-react"

export default function OAuthConsentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = React.useState(false)
  const provider = searchParams.get("provider") || "Google"

  const handleConsent = async () => {
    setLoading(true)
    // Simulating consent processing
    setTimeout(() => {
      setLoading(false)
      router.push("/")
    }, 2000)
  }

  return (
    <div className="min-h-svh bg-[#0a0a0a] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 size-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 size-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl">
          {/* Header Section */}
          <div className="p-8 pb-4">
             <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-xl bg-[#ff751f] flex items-center justify-center shadow-lg shadow-orange-500/20">
                   <span className="text-white font-bold text-xl">✸</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-white/60 text-sm font-medium tracking-wide">OAuth Security Check</span>
             </div>

             <h1 className="text-[28px] font-bold text-white leading-tight mb-2">
               Connect with {provider}
             </h1>
             <p className="text-white/40 text-[14px]">
               Revio Intelligence Systems requires your permission to access basic profile information to personalize your research experience.
             </p>
          </div>

          {/* Permissions List */}
          <div className="px-8 py-6 space-y-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:border-white/10 transition-colors">
               <div className="size-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5 text-orange-500" />
               </div>
               <div>
                  <h3 className="text-white text-sm font-bold">Profile Identity</h3>
                  <p className="text-white/30 text-xs mt-0.5">Access to your name, profile picture, and email address.</p>
               </div>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-start gap-4 hover:border-white/10 transition-colors">
               <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Lock className="size-5 text-purple-500" />
               </div>
               <div>
                  <h3 className="text-white text-sm font-bold">Secure Session</h3>
                  <p className="text-white/30 text-xs mt-0.5">Creation of a secure persistent session for your research history.</p>
               </div>
            </div>
          </div>

          {/* Warning / Link Section */}
          <div className="px-8 py-4">
             <div className="flex items-center gap-2 text-[10px] text-white/20 uppercase tracking-[0.15em] font-bold mb-4">
                <Info className="size-3" /> Data Privacy & Protection
             </div>
             <p className="text-[12px] text-white/30 leading-relaxed italic">
               By continuing, you agree to Revio's <button className="text-white underline underline-offset-2 hover:text-orange-500">Terms of Service</button> and <button className="text-white underline underline-offset-2 hover:text-orange-500">Privacy Policy</button>. We never sell your data.
             </p>
          </div>

          {/* Footer Actions */}
          <div className="p-8 pt-6 bg-white/[0.02] border-t border-white/5 flex flex-col gap-3">
            <Button 
              onClick={handleConsent}
              disabled={loading}
              className="w-full bg-white hover:bg-white/90 text-black font-bold h-14 rounded-2xl transition-all shadow-xl shadow-white/5 group"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <span className="flex items-center">
                  Allow & Continue <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </Button>
            <Button 
               variant="ghost" 
               className="w-full text-white/40 hover:text-white hover:bg-white/5 h-12 rounded-xl transition-all font-medium"
               disabled={loading}
               onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-white/10 font-medium tracking-wider uppercase">
           <div className="flex items-center gap-1.5 border-r border-white/5 pr-4">
              <Shield className="size-3" /> End-to-end Encrypted
           </div>
           <div>
              verified enterprise security
           </div>
        </div>
      </motion.div>

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] blend-overlay" />
    </div>
  )
}
