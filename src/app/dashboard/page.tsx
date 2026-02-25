
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, PenTool, Mic, BarChart, Calendar, ArrowRight, Star, Camera, Zap, History } from 'lucide-react'

export default function Dashboard() {
  const [userName, setUserName] = useState('Scholar')
  const [examTarget, setExamTarget] = useState('SPM')

  useEffect(() => {
    const savedTarget = localStorage.getItem('native_exam_target') || 'SPM'
    setExamTarget(savedTarget)
  }, [])

  const mainActions = [
    { title: 'Scene Guide', desc: 'Analyze real scenarios', icon: Camera, color: 'text-red-500', bg: 'bg-red-50', href: '/ar-mode', featured: true },
    { title: 'Daily Diary', desc: 'Today\'s pick', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', href: '/diary' },
    { title: 'Speaking', desc: 'Mock examination', icon: Mic, color: 'text-primary', bg: 'bg-primary/10', href: '/speaking' },
    { title: 'Writing', desc: 'Essay practice', icon: PenTool, color: 'text-accent', bg: 'bg-accent/10', href: '/writing' },
  ]

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {userName}! 👋</h1>
          <p className="text-muted-foreground mt-1">Ready for your {examTarget} journey today?</p>
        </div>
        <Link href="/settings">
          <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-secondary/80">
            Target: {examTarget}
          </Badge>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Daily Plan Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-primary text-primary-foreground shadow-lg border-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Calendar className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Your Daily Plan
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">Tasks remaining for today</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <Link href="/daily-plan">
              <Button variant="secondary" className="w-full">
                View My Tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Action Grid */}
        {mainActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href} className={action.featured ? "md:col-span-1" : ""}>
              <Card className={`hover:shadow-md transition-all active:scale-95 cursor-pointer h-full border-none shadow-sm relative overflow-hidden ${action.featured ? 'border-2 border-red-100' : ''}`}>
                {action.featured && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">NEW</div>
                )}
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}

        {/* Your Charts Card */}
        <Card className="hover:shadow-md transition-all active:scale-95 cursor-pointer border-none shadow-sm group bg-white">
          <Link href="/progress">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <History className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="font-semibold text-lg">Your Charts</h3>
              <p className="text-sm text-muted-foreground">Review writing history & feedback</p>
            </CardContent>
          </Link>
        </Card>

        {/* Progress Card */}
        <Card className="hover:shadow-md transition-all active:scale-95 cursor-pointer border-none shadow-sm group">
          <Link href="/progress">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">My Progress</h3>
              <p className="text-sm text-muted-foreground">View performance trends</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Quick Tip
        </h2>
        <Card className="bg-white/50 border-dashed">
          <CardContent className="p-4 flex gap-4 items-start">
             <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-accent" />
             </div>
             <p className="text-sm italic text-muted-foreground leading-relaxed">
              "Use the <strong>Scene Guide</strong> when you're out! Taking a photo of a real-life event helps you build vocabulary that you actually need in real conversations."
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
