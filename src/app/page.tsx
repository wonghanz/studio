"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Sparkles } from 'lucide-react'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Logic for first-time user vs returning user could go here
      const hasOnboarded = localStorage.getItem('native_onboarded')
      if (hasOnboarded) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gradient-bg p-4 overflow-hidden">
      <div className="relative animate-bounce mb-8">
        <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full" />
        <Image
          src={PlaceHolderImages[0].imageUrl}
          alt="NATIVE Learn Logo"
          width={150}
          height={150}
          className="rounded-3xl shadow-2xl relative"
          priority
          data-ai-hint="educational technology"
        />
      </div>
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-4xl font-bold text-primary tracking-tight">NATIVE Learn</h1>
        <p className="text-lg text-muted-foreground font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Your AI English Companion
        </p>
      </div>
      <div className="mt-16 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/30 animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
