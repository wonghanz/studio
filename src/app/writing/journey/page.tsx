
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ChevronLeft, Star, MapPin, GraduationCap, Rocket } from 'lucide-react'

const journeyStories = [
  {
    id: 'story-001',
    title: 'The Great Road Trip',
    difficulty: 'B1 (Intermediate)',
    summary: 'Travel from Kedah to Kuala Lumpur. Document the scenery, a roadside mishap, and city reflections.',
    category: 'Travel & Culture',
    levels: 4,
    icon: MapPin
  },
  {
    id: 'story-002',
    title: 'Campus Chronicles',
    difficulty: 'B2 (Upper Intermediate)',
    summary: 'Navigating your first week at National University. From orientation to finding your tribe.',
    category: 'Education',
    levels: 4,
    icon: GraduationCap
  },
  {
    id: 'story-003',
    title: 'Founder\'s Path',
    difficulty: 'C1 (Advanced)',
    summary: 'Start a tech startup in Cyberjaya. Pitch your idea, handle failure, and scale to global markets.',
    category: 'Business & Tech',
    levels: 4,
    icon: Rocket
  }
]

export default function JourneySelectionPage() {
  const [completedStories, setCompletedStories] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('native_journey_completed')
    if (saved) setCompletedStories(JSON.parse(saved))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/writing">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Writing Journey</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Life Stories</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journeyStories.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.id} href={`/writing/journey/${s.id}`}>
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden bg-white">
                <div className={`h-24 flex items-center justify-center bg-zinc-50 group-hover:bg-primary/5 transition-colors`}>
                  <Icon className="w-10 h-10 text-primary opacity-40 group-hover:opacity-100 transition-all" />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                    {completedStories.includes(s.id) && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{s.title}</CardTitle>
                  <CardDescription className="text-xs">{s.difficulty}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {s.summary}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground">{s.levels} Chapters</span>
                  <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                    Begin <ChevronLeft className="w-4 h-4 rotate-180 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
