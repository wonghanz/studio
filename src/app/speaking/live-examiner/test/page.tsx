
"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { 
  Mic, Square, Loader2, ChevronLeft, Bot, User, 
  Sparkles, Star, Target, CheckCircle2, History,
  Volume2, TrendingUp, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react'
import { aiLiveExaminer, type LiveExaminerOutput } from '@/ai/flows/ai-live-examiner'
import { aiTts } from '@/ai/flows/ai-tts'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'

const TOPICS = [
  "Should online reviews be trusted for major purchases?",
  "The role of social media in modern political campaigns.",
  "Is high-speed rail a necessity for Malaysia's future development?",
  "How to promote healthy living among Malaysian youth.",
  "The impact of tourism on local culture and traditions."
]

export default function ExaminerTestPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode') as 'task-a' | 'task-b' || 'task-a'
  
  const [topic, setTopic] = useState<string | null>(null)
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string, speakerName?: string}[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [evaluation, setEvaluation] = useState<LiveExaminerOutput['evaluation'] | null>(null)
  const [turnCount, setTurnCount] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  useEffect(() => {
    // Select topic on client side only to avoid hydration mismatch
    setTopic(TOPICS[Math.floor(Math.random() * TOPICS.length)])
  }, [])

  useEffect(() => {
    if (!topic) return

    // Initial intro
    const intro = mode === 'task-a' 
      ? `Welcome to your individual presentation. Your topic is: "${topic}". You have one minute to organize your thoughts, then you may begin.`
      : `Good morning everyone. Welcome to the group discussion. Our topic today is "${topic}". Candidate A, would you like to start?`
    
    setHistory([{ role: 'ai', text: intro, speakerName: 'Head Examiner' }])
    speak(intro)
  }, [mode, topic])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const speak = async (text: string) => {
    try {
      const res = await aiTts({ text })
      const audio = new Audio(res.media)
      audio.play()
    } catch (e) {
      console.error("TTS Failed", e)
    }
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
          processAudio(blob)
        }
        mediaRecorderRef.current.start()
        setIsRecording(true)
      } catch (err) {
        toast({ title: "Mic access denied", variant: "destructive" })
      }
    }
  }

  const processAudio = async (blob: Blob) => {
    if (!topic) return
    setIsProcessing(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        
        const result = await aiLiveExaminer({
          mode,
          topic,
          history: history.map(h => ({ role: h.role, text: h.text, speakerName: h.speakerName })),
          userAudioDataUri: base64data,
          turnCount: turnCount + 1
        })

        const newHistory = [
          ...history, 
          { role: 'user' as const, text: '(Student speaking...)' }, 
          { role: 'ai' as const, text: result.aiReply, speakerName: result.aiSpeakerName || 'Head Examiner' }
        ]
        setHistory(newHistory)
        setTurnCount(prev => prev + 1)

        if (result.isTestFinished && result.evaluation) {
          setIsFinished(true)
          setEvaluation(result.evaluation)
          if (user && db) {
            addDoc(collection(db, 'users', user.uid, 'speakingSessions'), {
              userId: user.uid,
              mode: 'examiner',
              topic,
              transcript: result.evaluation.transcript,
              taskScore: result.evaluation.taskScore,
              languageScore: result.evaluation.languageScore,
              fluencyScore: result.evaluation.fluencyScore,
              totalScore: result.evaluation.totalScore,
              cefrLevel: result.evaluation.cefrLevel,
              feedback: result.evaluation.improvementTips.join('. '),
              createdAt: new Date().toISOString()
            })
          }
        } else {
          speak(result.aiReply)
        }
      }
    } catch (error) {
      toast({ title: "Examiner system error", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)] pb-24 space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/speaking/live-examiner')}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-black text-primary">Examination Hall</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate max-w-[250px]">
              {mode === 'task-a' ? 'Individual' : 'Group'} Simulation
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-primary text-primary font-black px-4 py-1">
          {isFinished ? 'TEST CONCLUDED' : 'LIVE TEST IN PROGRESS'}
        </Badge>
      </header>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-6">
          <Card className="border-dashed border-2 bg-secondary/10 p-6 text-center">
             <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground mb-2 block">Assigned Topic</span>
             <h3 className="text-lg font-bold italic text-zinc-700">
               {topic ? `"${topic}"` : "Initializing exam topic..."}
             </h3>
          </Card>

          {history.map((h, i) => (
            <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex flex-col gap-1 max-w-[85%]">
                {h.speakerName && (
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${h.speakerName.includes('Examiner') ? 'text-primary' : 'text-accent'}`}>
                    {h.speakerName}
                  </span>
                )}
                <div className={`p-4 rounded-2xl ${h.role === 'user' ? 'bg-zinc-900 text-white' : 'bg-white shadow-sm border'}`}>
                  <p className="text-sm leading-relaxed">{h.text}</p>
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-primary/5 p-4 rounded-2xl flex gap-3 items-center border border-primary/10">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs font-bold text-primary italic uppercase tracking-widest">Examiner is analyzing...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {isFinished && evaluation ? (
        <Card className="border-accent bg-accent/5 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="text-center pb-4 border-b bg-white/50">
            <Badge className="w-fit mx-auto bg-primary mb-2">Final Examination Score</Badge>
            <div className="flex items-center justify-center gap-4">
               <div className="text-5xl font-black text-primary">{evaluation.totalScore}</div>
               <div className="text-left">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Band</p>
                  <p className="text-xl font-black text-accent">{evaluation.cefrLevel}</p>
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-2">
               {[
                 { label: 'Task', val: evaluation.taskScore },
                 { label: 'Lang', val: evaluation.languageScore },
                 { label: 'Fluency', val: evaluation.fluencyScore }
               ].map(s => (
                 <div key={s.label} className="bg-white/80 p-3 rounded-xl text-center border">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">{s.label}</p>
                    <p className="text-sm font-black">{s.val}/25</p>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-accent flex items-center gap-1"><Star className="w-3 h-3" /> Strengths</h4>
                  <ul className="text-[10px] space-y-1 font-medium text-zinc-600">
                    {evaluation.strengths.map((s, i) => <li key={i} className="flex gap-1">• {s}</li>)}
                  </ul>
               </div>
               <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Improvement</h4>
                  <ul className="text-[10px] space-y-1 font-medium text-zinc-600">
                    {evaluation.improvementTips.map((s, i) => <li key={i} className="flex gap-1">• {s}</li>)}
                  </ul>
               </div>
            </div>

            <div className="bg-zinc-900 text-white p-4 rounded-2xl">
               <h4 className="text-[10px] font-black uppercase text-primary mb-2">Model High-Band Sample</h4>
               <p className="text-[10px] italic leading-relaxed opacity-80 font-serif">"{evaluation.modelResponse}"</p>
            </div>
          </CardContent>
          <CardFooter className="pt-0 p-6 flex gap-3">
             <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => router.push('/progress')}>
                <History className="w-4 h-4 mr-2" /> View Trends
             </Button>
             <Button className="flex-1 rounded-xl h-12 bg-primary" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" /> Retry Exam
             </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="flex flex-col items-center gap-4 bg-white/95 backdrop-blur-xl p-8 rounded-3xl border shadow-2xl">
           <div className="w-full flex justify-between items-center mb-2 px-4">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-300'}`} />
                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                    {isRecording ? 'Recording Audio' : 'Standby'}
                 </span>
              </div>
              <div className="flex items-center gap-1">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className={`w-1 h-4 rounded-full bg-primary/20 ${isRecording ? 'animate-bounce' : ''}`} style={{ animationDelay: `${i * 0.1}s` }} />
                 ))}
              </div>
           </div>

           <div className="relative">
              {isRecording && <div className="absolute -inset-6 bg-red-500/10 rounded-full animate-ping" />}
              <Button 
                size="icon" 
                className={`w-24 h-24 rounded-full transition-all shadow-xl ${isRecording ? 'bg-red-500 scale-110' : 'bg-zinc-900 hover:scale-105'}`}
                onClick={toggleRecording}
                disabled={isProcessing}
              >
                {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </Button>
           </div>
           
           <div className="text-center">
              <p className="text-sm font-black tracking-tight">
                {isRecording ? 'TAP TO STOP SPEAKING' : 'TAP TO RESPOND TO EXAMINER'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                Turn {turnCount + 1} of 2 (Follow-up sequence)
              </p>
           </div>
        </div>
      )}
    </div>
  )
}
