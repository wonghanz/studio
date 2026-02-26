
"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Shield, BookOpen, ChevronRight, Zap, Star, History, Award, Flame } from 'lucide-react'
import { useUser, useFirestore, useDoc } from '@/firebase'

const writingModes = [
  {
    id: 'quest',
    title: 'Daily Writing Quest',
    desc: '3 bite-sized tasks to build your daily habit.',
    icon: Award,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    href: '/writing/quest',
    tag: 'Daily Habit'
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
  const { user } = useUser()
  const db = useFirestore()
  const [questProgress, setQuestProgress] = useState(0)

  // Fetch Streak
  const streakRef = useMemo(() => user?.uid ? `/users/${user.uid}/writingStreaks/main` : null, [user])
  const { data: streakData } = useDoc(streakRef)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`native_quest_completed_${today}`)
    if (saved) setQuestProgress(JSON.parse(saved).length)
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-primary">Choose Your Mode</h1>
          <p className="text-muted-foreground font-medium">Pick a style that motivates you to write today.</p>
        </div>
        <div className="flex gap-2">
           {streakData?.currentStreak > 0 && (
             <Badge variant="outline" className="gap-1 bg-orange-50 text-orange-600 border-orange-200">
               <Flame className="w-3 h-3 fill-orange-500" /> {streakData.currentStreak}
             </Badge>
           )}
           <Link href="/progress">
              <Button variant="outline" size="sm" className="gap-2">
                <History className="w-4 h-4" /> History
              </Button>
           </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {writingModes.map((mode) => {
          const Icon = mode.icon
          const isQuest = mode.id === 'quest'
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
                      {isQuest && questProgress === 3 && (
                        <Badge className="bg-accent text-[8px]">COMPLETE</Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{mode.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{mode.desc}</p>
                    {isQuest && (
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                          <span>Quest Progress</span>
                          <span>{questProgress}/3</span>
                        </div>
                        <Progress value={(questProgress/3)*100} className="h-1 bg-orange-100" />
                      </div>
                    )}
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
          <Flame className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Star className="w-5 h-5 fill-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Consistency is Key</span>
          </div>
          <h2 className="text-2xl font-bold">Improve Your Proficiency</h2>
          <p className="text-sm opacity-70 max-w-md">Writing just 3 short quest tasks a day helps you maintain your <strong>{streakData?.currentStreak || 0}-day streak</strong> and unlocks exclusive badges.</p>
        </div>
      </section>
    </div>
  )
}
