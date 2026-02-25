
"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenTool, Shield, BookOpen, ChevronRight, Zap, Star } from 'lucide-react'

const writingModes = [
  {
    id: 'standard',
    title: 'Standard Practice',
    desc: 'Focus on traditional essay writing with detailed AI feedback.',
    icon: PenTool,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    href: '/writing/practice',
    tag: 'Classic'
  },
  {
    id: 'mystery',
    title: 'Mystery Case Files',
    desc: 'Solve fictional crimes by writing investigative reports.',
    icon: Shield,
    color: 'text-primary',
    bg: 'bg-primary/10',
    href: '/writing/mystery',
    tag: 'Detective'
  },
  {
    id: 'journey',
    title: 'Writing Journey',
    desc: 'Write your way through engaging everyday life stories.',
    icon: BookOpen,
    color: 'text-accent',
    bg: 'bg-accent/10',
    href: '/writing/journey',
    tag: 'Story Mode'
  }
]

export default function WritingSelectionPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-primary">Choose Your Mode</h1>
        <p className="text-muted-foreground font-medium">Pick a style that motivates you to write today.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {writingModes.map((mode) => {
          const Icon = mode.icon
          return (
            <Link key={mode.id} href={mode.href}>
              <Card className="hover:shadow-xl transition-all cursor-pointer group overflow-hidden border-none shadow-md bg-white">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className={`md:w-32 flex items-center justify-center p-8 ${mode.bg}`}>
                    <Icon className={`w-12 h-12 ${mode.color}`} />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">{mode.tag}</Badge>
                    </div>
                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{mode.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{mode.desc}</p>
                  </div>
                  <div className="p-6 flex items-center justify-end md:pr-8">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <section className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Star className="w-5 h-5 fill-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Global Streak</span>
          </div>
          <h2 className="text-2xl font-bold">Consistency is Key</h2>
          <p className="text-sm opacity-70 max-w-md">Writing just 150 words a day can improve your CEFR level significantly in just 3 months.</p>
        </div>
      </section>
    </div>
  )
}
