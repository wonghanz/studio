
"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, ChevronLeft, Star, Flame } from 'lucide-react'
import { useUser, useFirestore, useDoc } from '@/firebase'

const demoCases = [
  {
    id: 'case-001',
    title: 'The Midnight Phantom',
    difficulty: 'B1 (Intermediate)',
    summary: 'A hit-and-run incident outside a busy night market. Witness reports are conflicting.',
    category: 'Accident Investigation',
    missions: 4
  },
  {
    id: 'case-002',
    title: 'The Vanishing Scholar',
    difficulty: 'B2 (Upper Intermediate)',
    summary: 'A top student at National University has disappeared from the library without a trace.',
    category: 'Missing Person',
    missions: 5
  },
  {
    id: 'case-003',
    title: 'Ash and Ember',
    difficulty: 'C1 (Advanced)',
    summary: 'A suspicious fire at an old chemical factory. Arson is suspected.',
    category: 'Arson Investigation',
    missions: 6
  }
]

export default function MysterySelectionPage() {
  const { user } = useUser()
  const db = useFirestore()
  const [userRank, setUserRank] = useState('Rookie')
  const [completedCases, setCompletedCases] = useState<string[]>([])

  // Fetch Unified Streak
  const streakRef = useMemo(() => user?.uid ? `/users/${user.uid}/writingStreaks/main` : null, [user])
  const { data: streakData } = useDoc(streakRef)

  useEffect(() => {
    const saved = localStorage.getItem('native_mystery_completed')
    if (saved) setCompletedCases(JSON.parse(saved))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/writing">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-primary">Mystery Case Files</h1>
            <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Solve through investigative writing</p>
          </div>
        </div>
        {streakData?.currentStreak > 0 && (
          <div className="flex flex-col items-end">
            <Badge variant="outline" className="gap-1 bg-orange-50 text-orange-600 border-orange-200 font-bold">
              <Flame className="w-3 h-3 fill-orange-500" /> {streakData.currentStreak} Day Streak
            </Badge>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 text-white border-none shadow-xl col-span-1 md:col-span-3">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Detective Status</p>
                <h2 className="text-2xl font-bold">{userRank}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Cases Closed</p>
              <p className="text-3xl font-black text-primary">{completedCases.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoCases.map((c) => (
          <Link key={c.id} href={`/writing/mystery/${c.id}`}>
            <Card className="h-full border-none shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden bg-white">
              <div className="h-2 w-full bg-zinc-100 relative">
                <div className="absolute top-0 left-0 h-full bg-primary transition-all" style={{ width: completedCases.includes(c.id) ? '100%' : '10%' }} />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                  {completedCases.includes(c.id) && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">{c.title}</CardTitle>
                <CardDescription className="text-xs">{c.difficulty}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {c.summary}
                </p>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-muted-foreground">{c.missions} Missions</span>
                 <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                    Investigate <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                 </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
