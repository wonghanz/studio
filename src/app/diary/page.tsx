"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Mic, PenTool, BookOpen, Headphones, ChevronRight, PlayCircle } from 'lucide-react'

export default function DiaryPage() {
  const [activeStep, setActiveStep] = useState('reading')

  const diaryContent = {
    title: "The Silent Forest",
    author: "Malaysian Wildlife Chronicles",
    content: "Deep within the heart of the Belum-Temengor Forest Complex, the morning mist clings to the giant Tualang trees like a heavy blanket. It was here that I first understood the true meaning of silence—not the absence of noise, but the presence of life waiting to be heard. As a conservationist, my daily entries often record the sightings of rare hornbills or the distant calls of gibbons, but today was different...",
    audioUrl: "#",
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Diary</h1>
          <p className="text-sm text-muted-foreground">October 24, 2023</p>
        </div>
      </header>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <div className="relative h-64 w-full">
          <Image
            src={PlaceHolderImages[3].imageUrl}
            alt="Diary Cover"
            fill
            className="object-cover"
            data-ai-hint="reading book"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
            <div>
              <Badge className="bg-accent mb-2">Featured Story</Badge>
              <h2 className="text-3xl font-bold">{diaryContent.title}</h2>
              <p className="opacity-80 text-sm">By {diaryContent.author}</p>
            </div>
            <Button size="icon" className="rounded-full w-12 h-12 bg-white text-primary hover:bg-secondary">
              <PlayCircle className="w-8 h-8" />
            </Button>
          </div>
        </div>

        <CardContent className="p-8 space-y-6">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg leading-relaxed text-zinc-700 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-primary">
              {diaryContent.content}
            </p>
            <p className="text-lg leading-relaxed text-zinc-700 mt-4">
              I found tracks of the Malayan tiger near the riverbank. They were fresh, etched clearly into the soft mud. The locals say the tiger is a spirit of the forest, a guardian of the balance. In my diary, I wrote: "We are but visitors in this ancient realm, and our survival depends on how well we listen to its secrets."
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t">
            {[
              { label: 'Read', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50', href: '/diary/questions' },
              { label: 'Listen', icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-50', href: '/listening' },
              { label: 'Speak', icon: Mic, color: 'text-primary', bg: 'bg-primary/10', href: '/speaking' },
              { label: 'Write', icon: PenTool, color: 'text-accent', bg: 'bg-accent/10', href: '/writing' },
            ].map((action) => (
              <Link key={action.label} href={action.href}>
                <Button variant="ghost" className={`w-full h-auto flex-col gap-2 p-4 rounded-2xl ${action.bg} hover:bg-white border-2 border-transparent hover:border-border transition-all`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                  <span className="font-semibold">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="font-bold text-lg">Vocabulary Focus</h3>
        <div className="flex flex-wrap gap-2">
          {['Conservationist', 'Etched', 'Hornbill', 'Mist', 'Gibbon'].map((word) => (
            <Badge key={word} variant="secondary" className="px-4 py-2 text-sm font-medium">
              {word}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
