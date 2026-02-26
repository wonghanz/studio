
"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Zap, CheckCircle2, Flame, Award, ArrowRight } from 'lucide-react'
import { useUser, useFirestore, useDoc } from '@/firebase'

const DEMO_QUESTS = [
  { id: 'q1', title: 'Quick Reaction', prompt: 'Describe your favorite Malaysian food in 3 sentences.', target: '30-50 words' },
  { id: 'q2', title: 'Improve the Sentence', prompt: 'Rewrite this sentence using formal academic vocabulary: "I think building more libraries is a good thing for students."', target: '50-80 words' },
  { id: 'q3', title: 'Mini Opinion', prompt: 'Should students be allowed to use mobile phones in class? Give one reason.', target: '80-120 words' }
]

export default function DailyQuestPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [completedIds, setCompletedIds] = useState<string[]>([])
  
  // Fetch Unified Global Streak
  const streakRef = useMemo(() => user?.uid ? `/users/${user.uid}/writingStreaks/main` : null, [user])
  const { data: streakData } = useDoc(streakRef)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`native_quest_completed_${today}`)
    if (saved) setCompletedIds(JSON.parse(saved))
  }, [])

  const progress = (completedIds.length / DEMO_QUESTS.length) * 100

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/writing">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-black tracking-tight text-primary">Daily Writing Quest</h1>
          <p className="text-muted-foreground font-medium text-xs uppercase tracking-widest">Build habits through bite-sized tasks</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-orange-600 shadow-sm">
            <Flame className="w-5 h-5 fill-orange-500" />
            <span className="font-bold">{streakData?.currentStreak || 0}-Day Streak</span>
          </div>
          <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1 mr-2">All writing counts!</span>
        </div>
      </header>

      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <CardContent className="p-8 space-y-4">
          <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <span>Today's Task Progress</span>
            <span className="text-primary">{completedIds.length} / {DEMO_QUESTS.length} Tasks</span>
          </div>
          <Progress value={progress} className="h-3" />
          {progress === 100 && (
            <div className="flex items-center gap-2 text-accent font-bold animate-bounce mt-2">
              <Award className="w-5 h-5" /> 
              Daily Quest Goal Complete! Proficiency XP Earned.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {DEMO_QUESTS.map((quest) => {
          const isDone = completedIds.includes(quest.id)
          return (
            <Link key={quest.id} href={`/writing/quest/${quest.id}`} className={isDone ? "pointer-events-none" : ""}>
              <Card className={`group border-none shadow-sm transition-all hover:shadow-md ${isDone ? 'bg-zinc-50 opacity-60' : 'bg-white hover:translate-x-1 cursor-pointer'}`}>
                <CardContent className="p-6 flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isDone ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors'}`}>
                    {isDone ? <CheckCircle2 className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">{quest.target}</span>
                      {isDone && <Badge variant="secondary" className="text-[8px] h-4 bg-accent">Done</Badge>}
                    </div>
                    <h3 className="font-bold text-lg">{quest.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{quest.prompt}</p>
                  </div>
                  {!isDone && (
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <section className="pt-8 space-y-4">
         <h2 className="text-xl font-bold flex items-center gap-2">
           <Award className="w-5 h-5 text-accent" />
           Your Milestones
         </h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { id: 'streak-3', label: '3-Day Fire', desc: 'Active Habit', icon: Flame, unlocked: (streakData?.currentStreak || 0) >= 3 },
             { id: 'streak-7', label: '7-Day Master', desc: 'Consistency Record', icon: Award, unlocked: (streakData?.currentStreak || 0) >= 7 },
             { id: 'writing-10', label: '10 Activities', desc: 'Dedicated Writer', icon: CheckCircle2, unlocked: false },
             { id: 'writing-50', label: '50 Activities', desc: 'Word Master', icon: Zap, unlocked: false },
           ].map((badge) => (
             <Card key={badge.id} className={`border-none shadow-sm text-center p-4 ${badge.unlocked ? 'bg-white' : 'opacity-40 grayscale'}`}>
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${badge.unlocked ? 'bg-accent/10 text-accent' : 'bg-zinc-100 text-zinc-400'}`}>
                  <badge.icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold">{badge.label}</h4>
                <p className="text-[10px] text-muted-foreground">{badge.desc}</p>
             </Card>
           ))}
         </div>
      </section>
    </div>
  )
}
