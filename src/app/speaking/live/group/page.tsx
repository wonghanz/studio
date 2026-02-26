
"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Mic, Square, Loader2, ChevronLeft, Users, BarChart, Sparkles, MessageSquare } from 'lucide-react'
import { aiLiveSpeakingEngine, type LiveSpeakingOutput } from '@/ai/flows/ai-live-speaking-engine'
import { aiTts } from '@/ai/flows/ai-tts'

const MUET_TOPICS = [
  "Should online learning replace physical classrooms entirely?",
  "The impact of tourism on local culture and traditions.",
  "Is high-speed rail a necessity for Malaysia's future development?",
  "How to promote healthy living among Malaysian youth."
]

export default function GroupDiscussionPage() {
  const [topic, setTopic] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string, speakerName?: string}[]>([])
  const [evaluation, setEvaluation] = useState<LiveSpeakingOutput['evaluation'] | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const startDiscussion = (selectedTopic: string) => {
    setTopic(selectedTopic)
    setHistory([{
      role: 'ai', 
      speakerName: 'Ahmad (Leader)', 
      text: `Welcome to our group discussion on "${selectedTopic}". I'm Ahmad, and Sara is also here with us. Let's hear everyone's thoughts. Who would like to start?`
    }])
  }

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          chunksRef.current = []
          processGroupAudio(blob)
        }
        mediaRecorderRef.current.start()
        setIsRecording(true)
      } catch (err) {
        toast({ title: "Mic access denied", variant: "destructive" })
      }
    }
  }

  const processGroupAudio = async (blob: Blob) => {
    setIsProcessing(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        const examType = 'MUET'
        
        const result = await aiLiveSpeakingEngine({
          mode: 'group',
          scenario: `MUET Task B Group Discussion on: ${topic}`,
          history: history.map(h => ({ role: h.role, text: h.text, speakerName: h.speakerName })),
          userAudioDataUri: base64data,
          examType
        })

        const newHistory = [
          ...history, 
          { role: 'user' as const, text: '(Contributing to discussion...)' }, 
          { role: 'ai' as const, text: result.aiReply, speakerName: result.aiSpeakerName }
        ]
        setHistory(newHistory)

        if (result.isSessionFinished) {
          setIsFinished(true)
          setEvaluation(result.evaluation || null)
        }

        const ttsResult = await aiTts({ text: result.aiReply })
        const audio = new Audio(ttsResult.media)
        audio.play()
      }
    } catch (error) {
      toast({ title: "Discussion error", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!topic) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <Link href="/speaking/live">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-6 h-6" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Group Discussion Simulation</h1>
        </header>
        <Card className="bg-primary/5 border-primary/20 p-6">
           <h3 className="font-bold flex items-center gap-2 text-primary mb-4">
             <MessageSquare className="w-5 h-5" /> Select MUET Task B Topic
           </h3>
           <div className="grid gap-3">
             {MUET_TOPICS.map((t, i) => (
               <Button key={i} variant="outline" className="justify-start h-auto py-4 px-6 text-left whitespace-normal hover:bg-white" onClick={() => startDiscussion(t)}>
                 {t}
               </Button>
             ))}
           </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col h-[calc(100vh-4rem)] pb-24">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTopic(null)}><ChevronLeft className="w-6 h-6" /></Button>
          <div className="max-w-[200px] md:max-w-md">
            <h1 className="text-lg font-bold truncate">Discussion Room</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black truncate">{topic}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Avatar className="w-8 h-8 border-2 border-primary">
             <AvatarImage src="https://picsum.photos/seed/ahmad/100" />
             <AvatarFallback>A</AvatarFallback>
           </Avatar>
           <Avatar className="w-8 h-8 border-2 border-accent">
             <AvatarImage src="https://picsum.photos/seed/sara/100" />
             <AvatarFallback>S</AvatarFallback>
           </Avatar>
        </div>
      </header>

      <ScrollArea className="flex-1 pr-4 mb-6">
        <div className="space-y-6">
          {history.map((h, i) => (
            <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col gap-1 max-w-[85%]">
                {h.speakerName && (
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${h.speakerName.includes('Ahmad') ? 'text-primary' : 'text-accent'}`}>
                    {h.speakerName}
                  </span>
                )}
                <div className={`p-4 rounded-2xl ${h.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-white shadow-sm border'}`}>
                  <p className="text-sm leading-relaxed">{h.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-secondary p-4 rounded-2xl flex gap-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs italic">Teammates are deliberating...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {isFinished && evaluation ? (
        <Card className="border-accent bg-accent/5 shadow-2xl animate-in slide-in-from-bottom-6">
          <CardHeader className="text-center">
            <Badge className="w-fit mx-auto bg-accent">Exam Breakdown</Badge>
            <CardTitle className="text-3xl font-black text-primary">{evaluation.bandScore}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-white/50 rounded-xl">
                  <p className="font-bold uppercase tracking-tighter text-muted-foreground mb-1">Turn Taking</p>
                  <p>{evaluation.fluencyFeedback}</p>
               </div>
               <div className="p-3 bg-white/50 rounded-xl">
                  <p className="font-bold uppercase tracking-tighter text-muted-foreground mb-1">Agree/Disagree</p>
                  <p>{evaluation.coherenceFeedback}</p>
               </div>
            </div>
            <Link href="/speaking/live" className="block">
              <Button className="w-full h-12 bg-primary">Exit Simulator</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border shadow-lg">
           <div className="relative">
              {isRecording && <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping" />}
              <Button 
                size="icon" 
                className={`w-20 h-20 rounded-full transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-zinc-900 hover:scale-105'}`}
                onClick={toggleRecording}
                disabled={isProcessing}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
             {isRecording ? 'Teammates are listening...' : 'Wait for your turn / Join discussion'}
           </p>
        </div>
      )}
    </div>
  )
}
