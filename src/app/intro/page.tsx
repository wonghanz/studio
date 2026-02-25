"use client"

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mic, PenTool, BookOpen, ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { APP_NAME } from '@/lib/constants'

export default function IntroPage() {
  const router = useRouter()
  
  // Find the specific analytics image from the centralized placeholder list
  const analyticsItem = PlaceHolderImages.find(img => img.id === 'demo-analytics')
  const analyticsImage = analyticsItem?.imageUrl || 'https://placehold.co/600x400?text=Analytics+Overview'

  const handleStart = () => {
    localStorage.setItem('native_intro_seen', 'true')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <section className="text-center space-y-4 max-w-2xl">
        <div className="flex justify-center mb-4">
          <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary bg-primary/5">
            PROTOTYPE DEMONSTRATION
          </Badge>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">{APP_NAME}</h1>
        <p className="text-sm font-medium text-muted-foreground opacity-70 tracking-widest uppercase">
          National AI for Targeted In-situ Vocabulary & English
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {APP_NAME} is an AI-powered English learning app designed to help MUET and SPM candidates improve speaking, writing, reading, and listening skills through examiner-style feedback and daily story-based practice.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Key Features
          </h2>
          <div className="space-y-3">
            {[
              { title: "AI Speaking Examiner", icon: Mic, desc: "Get instant band scores and fluency tips." },
              { title: "Offline Writing Drafts", icon: PenTool, desc: "Draft essays anytime, get AI feedback online." },
              { title: "Daily Diary Stories", icon: BookOpen, desc: "Story-based practice for reading and listening." },
              { title: "Personalized Study Plans", icon: CheckCircle2, desc: "Daily goals tailored to your skill gaps." }
            ].map((feat) => (
              <Card key={feat.title} className="border-none shadow-sm bg-white/50">
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <feat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Demo Analytics Overview
          </h2>
          <Card className="border-none shadow-sm bg-white overflow-hidden p-0 relative aspect-[4/3] w-full">
            {analyticsImage && (
              <Image 
                src={analyticsImage} 
                alt="Demo Analytics Overview" 
                fill 
                className="object-contain p-2"
                data-ai-hint="data analysis"
                unoptimized
              />
            )}
          </Card>
          <p className="text-[10px] text-center text-muted-foreground font-medium italic">
            Visualizing proficiency trends and skill-specific accuracy.
          </p>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <Button onClick={handleStart} size="lg" className="w-full md:w-64 h-14 text-lg rounded-2xl shadow-xl group">
          Start Learning
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
