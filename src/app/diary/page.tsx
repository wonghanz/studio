"use client"

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Mic, PenTool, BookOpen, Headphones, ChevronRight, PlayCircle, Loader2, PauseCircle, RefreshCw, Zap } from 'lucide-react'
import { aiTts } from '@/ai/flows/ai-tts'
import { aiDiaryGenerator, type AiDiaryGeneratorOutput } from '@/ai/flows/ai-diary-generator'
import { useToast } from '@/hooks/use-toast'

export default function DiaryPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const [isGenerating, setIsGenerating] = useState(true)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [diary, setDiary] = useState<AiDiaryGeneratorOutput | null>(null)
  const [dateHeader, setDateHeader] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { toast } = useToast()

  const fetchDailyContent = async () => {
    setIsGenerating(true)
    setAudioUrl(null)
    setIsPlaying(false)
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'SPM' | 'MUET') || 'SPM'
      const result = await aiDiaryGenerator({ examType })
      setDiary(result)
      localStorage.setItem('last_diary_content', JSON.stringify(result))
    } catch (error) {
      toast({
        title: "Failed to load content",
        description: "Please check your connection.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    fetchDailyContent()
    // Stable date header to prevent hydration mismatch
    setDateHeader(new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
  }, [])

  const toggleAudio = async () => {
    if (!diary) return

    if (audioUrl) {
      if (isPlaying) {
        audioRef.current?.pause()
      } else {
        audioRef.current?.play()
      }
      setIsPlaying(!isPlaying)
      return
    }

    setIsLoadingAudio(true)
    try {
      const result = await aiTts({ text: diary.content })
      setAudioUrl(result.media)
      setIsPlaying(true)
      setTimeout(() => {
        audioRef.current?.play()
      }, 100)
    } catch (error) {
      toast({
        title: "Podcast generation failed",
        description: "Could not generate audio for this entry.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingAudio(false)
    }
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <Zap className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-muted-foreground animate-pulse font-medium">Scouring the web for today's pick...</p>
      </div>
    )
  }

  const backgroundImage = PlaceHolderImages.find(img => img.imageHint.includes(diary?.category.toLowerCase() || ''))?.imageUrl || PlaceHolderImages[3].imageUrl

  const actions = [
    { label: 'Quiz', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50', href: '/diary/questions' },
    { label: 'Podcast', icon: Headphones, color: 'text-purple-500', bg: 'bg-purple-50', onClick: toggleAudio },
    { label: 'Speak', icon: Mic, color: 'text-primary', bg: 'bg-primary/10', href: '/speaking' },
    { label: 'Write', icon: PenTool, color: 'text-accent', bg: 'bg-accent/10', href: '/writing' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 pb-24">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Today's Feed</h1>
            <p className="text-xs text-muted-foreground">{dateHeader}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDailyContent} className="rounded-full gap-2 text-xs">
          <RefreshCw className="w-3 h-3" /> New Story
        </Button>
      </header>

      {diary && (
        <>
          <Card className="border-none shadow-xl overflow-hidden bg-white">
            <div className="relative h-64 w-full">
              <Image
                src={backgroundImage}
                alt="Diary Cover"
                fill
                className="object-cover"
                data-ai-hint={diary.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
                <div className="space-y-1">
                  <Badge className="bg-primary/90 text-[10px] uppercase tracking-tighter">{diary.category}</Badge>
                  <h2 className="text-3xl font-bold leading-tight">{diary.title}</h2>
                  <p className="opacity-80 text-xs italic">Reported by {diary.author}</p>
                </div>
                <Button 
                  size="icon" 
                  onClick={toggleAudio}
                  disabled={isLoadingAudio}
                  className="rounded-full w-14 h-14 bg-white text-primary hover:bg-secondary shadow-lg active:scale-90 transition-all"
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isPlaying ? (
                    <PauseCircle className="w-10 h-10" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <PlayCircle className="w-10 h-10" />
                      <span className="text-[8px] font-bold mt-[-4px]">PODCAST</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {audioUrl && (
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={() => setIsPlaying(false)} 
                className="hidden" 
              />
            )}

            <CardContent className="p-8 space-y-8">
              <div className="prose prose-slate max-w-none">
                {diary.content.split('\n').map((paragraph, i) => (
                  <p key={i} className={`text-lg leading-relaxed text-zinc-700 ${i === 0 ? 'first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-primary' : ''}`}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t">
                {actions.map((action) => (
                  action.href ? (
                    <Button 
                      key={action.label} 
                      variant="ghost" 
                      className={`w-full h-auto flex-col gap-2 p-4 rounded-2xl ${action.bg} hover:bg-white border-2 border-transparent hover:border-border transition-all`}
                      asChild
                    >
                      <Link href={action.href}>
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                        <span className="font-semibold">{action.label}</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      key={action.label} 
                      variant="ghost" 
                      onClick={action.onClick}
                      className={`w-full h-auto flex-col gap-2 p-4 rounded-2xl ${action.bg} hover:bg-white border-2 border-transparent hover:border-border transition-all`}
                    >
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                      <span className="font-semibold">{action.label}</span>
                    </Button>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Keywords for Today
            </h3>
            <div className="flex flex-wrap gap-2">
              {diary.vocabulary.map((word) => (
                <Badge key={word} variant="secondary" className="px-4 py-2 text-sm font-medium bg-white/50 border-none shadow-sm hover:bg-accent hover:text-white transition-colors cursor-pointer">
                  {word}
                </Badge>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
