
"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, PenTool, Mic, BarChart, Calendar, ArrowRight, Star, Camera, Zap, Flame, Award, TrendingUp } from 'lucide-react'
import { useUser, useFirestore, useDoc } from '@/firebase'

export default function Dashboard() {
  const { user } = useUser()
  const db = useFirestore()
  const [userName, setUserName] = useState('Scholar')
  const [examTarget, setExamTarget] = useState('SPM')
  const [questProgress, setQuestProgress] = useState(0)

  // Fetch Global Unified Streak
  const streakRef = useMemo(() => user?.uid ? `/users/${user.uid}/writingStreaks/main` : null, [user])
  const { data: streakData } = useDoc(streakRef)

  useEffect(() => {
    const savedTarget = localStorage.getItem('native_exam_target') || 'SPM'
    setExamTarget(savedTarget)
    
    // Fetch today's quest progress from local storage for instant feedback
    const today = new Date().toISOString().split('T')[0]
    const savedQuest = localStorage.getItem(`native_quest_completed_${today}`)
    if (savedQuest) {
      setQuestProgress(JSON.parse(savedQuest).length)
    }
  }, [])

  const mainActions = [
    { title: 'Writing Quest', desc: 'Daily mini-tasks', icon: Award, color: 'text-orange-500', bg: 'bg-orange-50', href: '/writing/quest', featured: true },
    { title: 'Scene Guide', desc: 'Analyze real scenarios', icon: Camera, color: 'text-red-500', bg: 'bg-red-50', href: '/ar-mode' },
    { title: 'Daily Diary', desc: 'Today\'s pick', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', href: '/diary' },
    { title: 'Speaking', desc: 'Mock examination', icon: Mic, color: 'text-primary', bg: 'bg-primary/10', href: '/speaking' },
    { title: 'Writing', desc: 'Essay practice', icon: PenTool, color: 'text-accent', bg: 'bg-accent/10', href: '/writing' },
  ]

  const hasWrittenToday = streakData?.lastActivityDate === new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hi, {userName}! 👋</h1>
          <p className="text-muted-foreground mt-1">Ready for your {examTarget} journey today?</p>
        </div>
        <div className="flex gap-2">
          {streakData?.currentStreak > 0 && (
            <div className="flex flex-col items-end">
              <Badge variant="outline" className="px-3 py-1 bg-orange-50 text-orange-600 border-orange-200 flex gap-1 items-center font-bold">
                <Flame className="w-3 h-3 fill-orange-500" /> {streakData.currentStreak} Day Streak
              </Badge>
              {streakData.longestStreak > streakData.currentStreak && (
                <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">Record: {streakData.longestStreak}</span>
              )}
            </div>
          )}
          <Link href="/settings">
            <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-secondary/80 h-fit">
              Target: {examTarget}
            </Badge>
          </Link>
        </div>
      </header>

      {!hasWrittenToday && (
        <Card className="bg-orange-50 border-orange-100 shadow-sm animate-in slide-in-from-top-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-orange-800">Keep your streak alive!</p>
                <p className="text-xs text-orange-600">Complete any writing activity today to reach { (streakData?.currentStreak || 0) + 1 } days.</p>
              </div>
            </div>
            <Link href="/writing/quest">
              <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 bg-white hover:bg-orange-50">Quick Quest</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Writing Quest Progress Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 border-none shadow-lg bg-white overflow-hidden group">
           <CardHeader className="pb-2">
             <div className="flex justify-between items-center mb-1">
               <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                 <Zap className="w-4 h-4 text-orange-500" /> Daily Writing Quest
               </CardTitle>
               <span className="text-[10px] font-black text-primary">{questProgress}/3 Completed</span>
             </div>
             <Progress value={(questProgress/3)*100} className="h-2 bg-orange-100" />
           </CardHeader>
           <CardContent>
             <Link href="/writing/quest">
               <Button variant="secondary" className="w-full mt-2 h-10 group-hover:bg-primary group-hover:text-white transition-all">
                  Finish Quests
                  <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
             </Link>
           </CardContent>
        </Card>

        {/* Action Grid */}
        {mainActions.map((action) => {
          if (action.title === 'Writing Quest' && action.featured) return null;
          const Icon = action.icon
          return (
            <Link key={action.title} href={action.href}>
              <Card className={`hover:shadow-md transition-all active:scale-95 cursor-pointer h-full border-none shadow-sm relative overflow-hidden`}>
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

        {/* Progress Card */}
        <Card className="hover:shadow-md transition-all active:scale-95 cursor-pointer border-none shadow-sm group">
          <Link href="/progress">
            <CardContent className="pt-6">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">My Performance</h3>
              <p className="text-sm text-muted-foreground">View trends and history</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Pro Tip
        </h2>
        <Card className="bg-white/50 border-dashed">
          <CardContent className="p-4 flex gap-4 items-start">
             <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-accent" />
             </div>
             <p className="text-sm italic text-muted-foreground leading-relaxed">
              "Unified Consistency: Any writing activity—be it a <strong>Daily Quest</strong>, a <strong>Mystery Case</strong>, or a <strong>Revision</strong>—counts towards your consistency streak."
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
