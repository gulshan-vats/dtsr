"use client"

export function DynamicGradient() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      <img 
        src="/auth-bg.jpg" 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}
