
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from 'recharts'
import { Mic, PenTool, BookOpen, Headphones, ArrowRight, CheckCircle2, Info } from 'lucide-react'

const demoTrendData = [
  { week: 'W1', speaking: 4.5, writing: 4.0 },
  { week: 'W2', speaking: 5.0, writing: 4.5 },
  { week: 'W3', speaking: 5.5, writing: 5.0 },
  { week: 'W4', speaking: 6.0, writing: 5.8 },
]

const demoAccuracyData = [
  { subject: 'Reading', value: 85 },
  { subject: 'Listening', value: 72 },
]

export default function IntroPage() {
  const router = useRouter()

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
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary">NATIVE</h1>
        <p className="text-sm font-medium text-muted-foreground opacity-70 tracking-widest uppercase">
          National AI for Targeted In-situ Vocabulary & English
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          NATIVE is an AI-powered English learning app designed to help MUET and SPM candidates improve speaking, writing, reading, and listening skills through examiner-style feedback and daily story-based practice.
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
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Skill Band Trends (Mock)</CardTitle>
            </CardHeader>
            <CardContent className="h-48 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="week" hide />
                  <YAxis domain={[0, 9]} hide />
                  <Line type="monotone" dataKey="speaking" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="writing" stroke="hsl(var(--accent))" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-[10px] font-bold mt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-primary rounded-full"/> Speaking</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-accent rounded-full"/> Writing</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Accuracy (%)</CardTitle>
            </CardHeader>
            <CardContent className="h-24 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoAccuracyData} layout="vertical" margin={{ left: -40 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="subject" hide />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>Reading: 85%</span>
                <span>Listening: 72%</span>
              </div>
            </CardContent>
          </Card>
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
