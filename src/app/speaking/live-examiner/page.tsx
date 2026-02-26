"use client"

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, UserCheck, Users, Sparkles, ShieldCheck, Clock, Zap } from 'lucide-react'

const examModes = [
  {
    id: 'task-a',
    title: 'MUET Task A',
    subtitle: 'Individual Presentation',
    desc: 'Prepare and deliver a 2-minute presentation on a formal academic topic.',
    icon: UserCheck,
    color: 'text-primary',
    bg: 'bg-primary/10',
    time: '2 Minutes prep, 2 Minutes speech',
    features: ['Examiner Follow-up', 'Formal Rubric']
  },
  {
    id: 'task-b',
    title: 'MUET Task B',
    subtitle: 'Group Discussion',
    desc: 'Simulate a group debate with 2 AI candidates. Defend your point and manage turn-taking.',
    icon: Users,
    color: 'text-accent',
    bg: 'bg-accent/10',
    time: '8-12 Minutes discussion',
    features: ['Candidate Interaction', 'Conflict Management']
  }
]

export default function LiveExaminerModeSelection() {
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
            Live Examiner Mode <ShieldCheck className="w-6 h-6 text-accent" />
          </h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Official MUET Simulation Engine</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examModes.map((mode) => {
          const Icon = mode.icon
          return (
            <Link key={mode.id} href={`/speaking/live-examiner/test?mode=${mode.id}`}>
              <Card className="hover:shadow-2xl transition-all cursor-pointer group overflow-hidden border-none shadow-md bg-white h-full flex flex-col">
                <CardHeader className={`${mode.bg} p-8 flex items-center justify-center`}>
                  <Icon className={`w-16 h-16 ${mode.color}`} />
                </CardHeader>
                <CardContent className="p-6 flex-1 space-y-4">
                  <div>
                    <Badge variant="outline" className="text-[10px] uppercase mb-1">{mode.subtitle}</Badge>
                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{mode.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{mode.desc}</p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Clock className="w-3 h-3" /> {mode.time}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mode.features.map(f => (
                        <Badge key={f} variant="secondary" className="text-[8px] bg-zinc-100">{f}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button className="w-full rounded-full gap-2">
                    Begin Examination <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <section className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="w-5 h-5 fill-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Examiner Context</span>
          </div>
          <h2 className="text-2xl font-bold">Rigorous & Realistic</h2>
          <p className="text-sm opacity-70 max-w-md leading-relaxed">
            The AI Examiner is trained on official Malaysian University English Test (MUET) criteria. It will listen to your points and ask dynamic follow-up questions to test your depth of understanding.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-medium opacity-80">
             <li className="flex items-center gap-2">✅ Adaptive follow-up questions</li>
             <li className="flex items-center gap-2">✅ Candidate interaction modeling</li>
             <li className="flex items-center gap-2">✅ Real-time fluency analysis</li>
             <li className="flex items-center gap-2">✅ Official 75-point score breakdown</li>
          </ul>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <UserCheck className="w-32 h-32" />
        </div>
      </section>
    </div>
  )
}
