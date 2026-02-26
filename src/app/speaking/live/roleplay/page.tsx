
"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { Mic, Square, Loader2, ChevronLeft, Send, BarChart, Sparkles, User, Bot, Volume2 } from 'lucide-react'
import { aiLiveSpeakingEngine, type LiveSpeakingOutput } from '@/ai/flows/ai-live-speaking-engine'
import { aiTts } from '@/ai/flows/ai-tts'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'

const scenarios = [
  { id: 'job-interview', title: 'Job Interview', description: 'Practice a formal interview for a marketing role.' },
  { id: 'cafe-order', title: 'Café Order', description: 'Order a complex coffee and deal with a mistake.' },
  { id: 'complaint', title: 'Customer Complaint', description: 'Complain about a faulty electronic item.' },
]

export default function RoleplayPage() {
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarios[0] | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string}[]>([])
  const [evaluation, setEvaluation] = useState<LiveSpeakingOutput['evaluation'] | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const startSession = (scenario: typeof scenarios[0]) => {
    setSelectedScenario(scenario)
    setHistory([{role: 'ai', text: `Hi there! I'm ready for our ${scenario.title} roleplay. Shall we begin? You can start whenever you're ready.`}])
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
    setIsProcessing(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        const examType = (localStorage.getItem('native_exam_target') as 'SPM' | 'MUET') || 'MUET'
        
        // Temporarily add a placeholder for user's text (Gemini will actually transcribe and reply)
        const result = await aiLiveSpeakingEngine({
          mode: 'roleplay',
          scenario: selectedScenario?.description,
          history: history.map(h => ({ role: h.role, text: h.text })),
          userAudioDataUri: base64data,
          examType
        })

        const newHistory = [...history, { role: 'user' as const, text: '(Transcribed from audio...)' }, { role: 'ai' as const, text: result.aiReply }]
        setHistory(newHistory)

        if (result.isSessionFinished) {
          setIsFinished(true)
          setEvaluation(result.evaluation || null)
          if (user && db) {
            addDoc(collection(db, 'users', user.uid, 'speakingSessions'), {
              userId: user.uid,
              mode: 'roleplay',
              topic: selectedScenario?.title,
              durationSeconds: newHistory.length * 15, // Approx
              bandScore: result.evaluation?.bandScore,
              feedback: result.evaluation?.fluencyFeedback,
              createdAt: new Date().toISOString()
            })
          }
        }

        // Play AI reply
        const ttsResult = await aiTts({ text: result.aiReply })
        const audio = new Audio(ttsResult.media)
        audio.play()
      }
    } catch (error) {
      toast({ title: "Analysis failed", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!selectedScenario) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
        <header className="flex items-center gap-4">
          <Link href="/speaking/live">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-6 h-6" /></Button>
          </Link>
          <h1 className="text-2xl font-bold">Choose a Roleplay</h1>
        </header>
        <div className="grid gap-4">
          {scenarios.map(s => (
            <Card key={s.id} className="hover:border-primary cursor-pointer transition-colors" onClick={() => startSession(s)}>
              <CardHeader>
                <CardTitle className="text-lg">{s.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem)] pb-24">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setSelectedScenario(null)}><ChevronLeft className="w-6 h-6" /></Button>
          <h1 className="text-xl font-bold">{selectedScenario.title}</h1>
        </div>
        <Badge variant="outline">Live Simulation</Badge>
      </header>

      <ScrollArea className="flex-1 pr-4 mb-6">
        <div className="space-y-4">
          {history.map((h, i) => (
            <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl flex gap-3 ${h.role === 'user' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                {h.role === 'ai' && <Bot className="w-5 h-5 shrink-0" />}
                <p className="text-sm leading-relaxed">{h.text}</p>
                {h.role === 'user' && <User className="w-5 h-5 shrink-0" />}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-secondary p-4 rounded-2xl flex gap-2 items-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs italic">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {isFinished && evaluation ? (
        <Card className="border-accent bg-accent/5 animate-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" /> Session Evaluation</CardTitle>
              <Badge className="text-lg px-4">{evaluation.bandScore}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xs space-y-2">
              <p><strong>Fluency:</strong> {evaluation.fluencyFeedback}</p>
              <p><strong>Coherence:</strong> {evaluation.coherenceFeedback}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase opacity-60">Better ways to respond:</p>
              {evaluation.betterResponses?.map((r, i) => (
                <p key={i} className="text-[10px] italic text-primary">"{r}"</p>
              ))}
            </div>
            <Link href="/speaking/live" className="block">
              <Button className="w-full">End Session</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center items-center flex-col gap-4">
           <div className="relative">
              {isRecording && <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping" />}
              <Button 
                size="icon" 
                className={`w-20 h-20 rounded-full shadow-2xl transition-all ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90'}`}
                onClick={toggleRecording}
                disabled={isProcessing}
              >
                {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
           </div>
           <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
             {isRecording ? 'Tap to finish speaking' : 'Tap to speak'}
           </p>
        </div>
      )}
    </div>
  )
}
