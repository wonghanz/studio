
"use client"

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, MessageSquare, RotateCw, Users, Sparkles, Mic } from 'lucide-react'

const liveModes = [
  {
    id: 'roleplay',
    title: 'Roleplay Rooms',
    desc: 'Simulate real-life conversations like interviews or café orders.',
    icon: MessageSquare,
    color: 'text-primary',
    bg: 'bg-primary/10',
    href: '/speaking/live/roleplay',
    tag: 'Interactive'
  },
  {
    id: 'spin',
    title: 'Spin-the-Topic',
    desc: 'Get a random topic and constraint. 60 seconds to shine.',
    icon: RotateCw,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    href: '/speaking/live/spin',
    tag: 'Quick Fire'
  },
  {
    id: 'group',
    title: 'MUET Group Discussion',
    desc: 'Practice turn-taking and debating with AI teammates (Task B).',
    icon: Users,
    color: 'text-accent',
    bg: 'bg-accent/10',
    href: '/speaking/live/group',
    tag: 'Exam Focused'
  }
]

export default function LiveSpeakingModePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/speaking">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-primary flex items-center gap-2">
            Live Speaking <Sparkles className="w-6 h-6 text-accent" />
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Real-time AI Simulation</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {liveModes.map((mode) => {
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
                      <Mic className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="bg-zinc-900 text-white rounded-3xl p-8 border-none shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h3 className="text-xl font-bold">Why Live Mode?</h3>
          <p className="text-sm opacity-70 max-w-md leading-relaxed">
            Confidence isn't built in a lab; it's built in conversation. Live Mode simulates the pressure and flow of real-world English without the social anxiety.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-medium opacity-80">
             <li className="flex items-center gap-2">✅ Real-time turn-taking</li>
             <li className="flex items-center gap-2">✅ Instant AI Feedback</li>
             <li className="flex items-center gap-2">✅ Pronunciation checks</li>
             <li className="flex items-center gap-2">✅ Exam-ready scenarios</li>
          </ul>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Users className="w-32 h-32" />
        </div>
      </Card>
    </div>
  )
}
