
"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { RotateCw, Mic, Square, Loader2, ChevronLeft, Sparkles, Trophy, Zap } from 'lucide-react'
import { aiSpeakingSpinEvaluation, type SpeakingSpinOutput } from '@/ai/flows/ai-speaking-spin-evaluation'

const topics = [
  "Your childhood dream job.",
  "The best holiday you've ever had.",
  "How social media impacts education.",
  "The importance of teamwork in sports.",
  "A technology you can't live without."
]

const constraints = [
  "Use at least two discourse markers (e.g., furthermore, however).",
  "Provide one specific real-life example.",
  "Maintain a formal academic tone throughout.",
  "Include a strong opening statement.",
  "Avoid using 'um' or 'ah' fillers."
]

export default function SpinTheTopicPage() {
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentTopic, setCurrentTopic] = useState<string | null>(null)
  const [currentConstraint, setCurrentConstraint] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [result, setResult] = useState<SpeakingSpinOutput | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  const spin = () => {
    setIsSpinning(true)
    setResult(null)
    setCurrentTopic(null)
    setCurrentConstraint(null)
    
    setTimeout(() => {
      setCurrentTopic(topics[Math.floor(Math.random() * topics.length)])
      setCurrentConstraint(constraints[Math.floor(Math.random() * constraints.length)])
      setIsSpinning(false)
      setTimeLeft(60)
    }, 1500)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        evaluateSpeech(blob)
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      toast({ title: "Mic access denied", variant: "destructive" })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const evaluateSpeech = async (blob: Blob) => {
    setIsEvaluating(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        const examType = (localStorage.getItem('native_exam_target') as 'SPM' | 'MUET') || 'MUET'
        
        const res = await aiSpeakingSpinEvaluation({
          topic: currentTopic!,
          constraint: currentConstraint!,
          audioDataUri: base64data,
          examType
        })
        setResult(res)
      }
    } catch (error) {
      toast({ title: "Evaluation failed", variant: "destructive" })
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/speaking/live">
          <Button variant="ghost" size="icon"><ChevronLeft className="w-6 h-6" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Spin-the-Topic</h1>
      </header>

      <div className="flex flex-col items-center gap-8">
        <div className="relative group">
          <div className={`w-32 h-32 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-2xl transition-all ${isSpinning ? 'animate-spin' : 'hover:scale-105 active:scale-95'}`}>
             <RotateCw className="w-12 h-12" />
          </div>
          {!currentTopic && !isSpinning && (
            <Button onClick={spin} className="mt-6 rounded-full px-8 bg-orange-500 hover:bg-orange-600">Spin for Today's Topic</Button>
          )}
        </div>

        {isSpinning && <p className="text-lg font-bold animate-pulse text-orange-500">Choosing your challenge...</p>}

        {currentTopic && !isSpinning && (
          <div className="w-full space-y-6 animate-in zoom-in duration-300">
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader className="text-center">
                <Badge className="w-fit mx-auto mb-2 bg-orange-500">The Topic</Badge>
                <CardTitle className="text-xl">"{currentTopic}"</CardTitle>
              </CardHeader>
              <CardContent className="text-center border-t border-orange-100 pt-6">
                 <Badge variant="outline" className="mb-2 border-orange-500 text-orange-600">The Constraint</Badge>
                 <p className="text-sm font-medium italic opacity-80">{currentConstraint}</p>
              </CardContent>
            </Card>

            {!result && (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-xs space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase">
                     <span>Time Remaining</span>
                     <span className={timeLeft < 10 ? 'text-red-500 animate-pulse' : ''}>{timeLeft}s</span>
                   </div>
                   <Progress value={(timeLeft/60)*100} className="h-2 bg-orange-100" />
                </div>

                <Button 
                  size="icon" 
                  className={`w-20 h-20 rounded-full shadow-xl transition-all ${isRecording ? 'bg-red-500 scale-110' : 'bg-primary'}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isEvaluating}
                >
                  {isRecording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </Button>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                   {isRecording ? 'Recording... Tap to Finish' : 'Start 60s Practice'}
                </p>
              </div>
            )}
          </div>
        )}

        {isEvaluating && (
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
             <p className="text-sm font-medium">Examiner is listening...</p>
          </div>
        )}

        {result && (
          <Card className="w-full border-accent bg-accent/5 animate-in slide-in-from-bottom-6">
             <CardHeader className="text-center pb-4 border-b border-accent/10">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Trophy className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-2xl font-black text-accent">{result.bandScore}</CardTitle>
                <div className="flex justify-center mt-2">
                  <Badge className={result.metConstraint ? 'bg-accent' : 'bg-destructive'}>
                    {result.metConstraint ? 'Constraint Met ✅' : 'Constraint Missed ❌'}
                  </Badge>
                </div>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <p className="text-sm italic leading-relaxed text-zinc-700">"{result.feedback}"</p>
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-accent tracking-widest">Examiner's Tips:</p>
                   {result.tips.map((tip, i) => (
                     <div key={i} className="flex gap-2 text-xs items-start">
                        <Zap className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                     </div>
                   ))}
                </div>
                <Button variant="outline" className="w-full" onClick={spin}>Try Another Topic</Button>
             </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
