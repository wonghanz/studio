
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Lock, BookOpen, CheckCircle2, Zap } from 'lucide-react'

const storyLevels = {
  'story-001': [
    { id: 'l1', title: 'Setting the Scene', type: 'Description', desc: 'Pack your bags and describe the early morning departure from Kedah.', status: 'unlocked' },
    { id: 'l2', title: 'The Breakdown', type: 'Problem', desc: 'An unexpected flat tire near Ipoh. Describe the incident and how you felt.', status: 'locked' },
    { id: 'l3', title: 'Roadside Wisdom', type: 'Reflection', desc: 'Reflect on a conversation with a helpful local mechanic.', status: 'locked' },
    { id: 'l4', title: 'Arrival in KL', type: 'Full Essay', desc: 'Arrive at the capital. Summarize the trip and lessons learned.', status: 'locked' },
  ],
}

export default function StoryBoardPage() {
  const params = useParams()
  const storyId = params.storyId as string
  const [unlocked, setUnlocked] = useState<string[]>(['l1'])
  
  const levels = storyLevels[storyId as keyof typeof storyLevels] || []

  useEffect(() => {
    const saved = localStorage.getItem(`native_journey_progress_${storyId}`)
    if (saved) setUnlocked(JSON.parse(saved))
  }, [storyId])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/writing/journey">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Story Progression</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Journey Chapters</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Active Chapters
          </h2>
          <div className="space-y-3">
            {levels.map((l, i) => {
              const isUnlocked = unlocked.includes(l.id)
              const isCompleted = unlocked.includes(levels[i+1]?.id)
              
              return (
                <Card key={l.id} className={`border-none shadow-sm transition-all ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:scale-[1.01]'}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-accent/10 text-accent' : isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isUnlocked ? <BookOpen className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{l.type}</span>
                        {isCompleted && <Badge className="text-[8px] h-4 bg-accent">Completed</Badge>}
                      </div>
                      <h3 className="font-bold">{l.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{l.desc}</p>
                    </div>
                    {isUnlocked && !isCompleted && (
                      <Link href={`/writing/journey/${storyId}/${l.id}`}>
                        <Button size="sm">Write</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-primary text-white">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Zap className="w-4 h-4" /> Journey Progress
               </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black mb-1">
                {Math.round((unlocked.length / levels.length) * 100)}%
              </div>
              <p className="text-[10px] opacity-60 leading-relaxed italic">
                Complete all chapters to master this story and earn a badge.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
