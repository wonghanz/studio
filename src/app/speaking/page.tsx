
"use client"

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Mic, Square, Loader2, BarChart, Sparkles, Trash2, 
  Star, Zap, ChevronRight, MessageSquare, Play, 
  RotateCcw, CheckCircle2, Target, Headphones, UserCheck
} from 'lucide-react'
import { aiSpeakingExamination, type AiSpeakingExaminationOutput } from '@/ai/flows/ai-speaking-examination'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function SpeakingPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<AiSpeakingExaminationOutput | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        chunksRef.current = []
      }
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setFeedback(null)
    } catch (err) {
      toast({ title: "Microphone Access Denied", description: "Please enable mic access.", variant: "destructive" })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const deleteRecording = () => {
    setAudioUrl(null)
    setFeedback(null)
  }

  const analyzeSpeech = async () => {
    if (!audioUrl) return
    setIsProcessing(true)

    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        const examType = (localStorage.getItem('native_exam_target') as 'SPM' | 'MUET') || 'MUET'
        const topic = "Describe a memorable journey you have taken."
        
        const result = await aiSpeakingExamination({
          audioDataUri: base64data,
          examType,
          topic
        })
        
        setFeedback(result)

        // Save to Firestore
        if (user && db) {
          addDoc(collection(db, 'users', user.uid, 'speakingSessions'), {
            userId: user.uid,
            mode: 'standard',
            topic,
            audioUrl: audioUrl,
            transcript: result.transcript,
            taskScore: result.taskFulfilmentScore,
            languageScore: result.languageScore,
            fluencyScore: result.fluencyConfidenceScore,
            totalScore: result.totalScore,
            cefrLevel: result.cefrLevel,
            feedback: result.feedbackPoints.join('. '),
            createdAt: new Date().toISOString()
          })
        }

        toast({ title: "Analysis complete!" })
        setIsProcessing(false)
      }
    } catch (error) {
      toast({ title: "Analysis failed", description: "Something went wrong.", variant: "destructive" })
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-primary">Speaking Center</h1>
        <p className="text-muted-foreground font-medium">Build confidence through official MUET criteria analysis.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/speaking/live-examiner">
          <Card className="bg-zinc-900 text-white border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <UserCheck className="w-32 h-32" />
            </div>
            <CardContent className="p-8 space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-white uppercase font-bold text-[10px]">New Feature</Badge>
                <Sparkles className="w-4 h-4 text-accent fill-accent" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-primary">Live Examiner Mode</h2>
                <p className="text-sm opacity-80 mt-1 max-w-md italic">"Simulate a real MUET test with dynamic follow-ups."</p>
              </div>
              <Button variant="secondary" className="rounded-full px-8 gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
                Start Test <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/speaking/live">
          <Card className="bg-primary text-white border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-32 h-32" />
            </div>
            <CardContent className="p-8 space-y-4 relative z-10">
              <div className="flex items-center gap-2">
                <Badge className="bg-white text-primary uppercase font-bold text-[10px]">Casual Practice</Badge>
              </div>
              <div>
                <h2 className="text-3xl font-black">Roleplay & Mini-Games</h2>
                <p className="text-sm opacity-80 mt-1 max-w-md">Practice real-time conversation in café, interviews, and topic spins.</p>
              </div>
              <Button variant="secondary" className="rounded-full px-8 gap-2 group-hover:bg-white transition-colors">
                Practice Mode <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-lg bg-white overflow-hidden h-fit">
          <div className="bg-secondary/20 p-6 border-b text-center">
            <Badge className="mb-4 bg-primary">Daily Mock Topic</Badge>
            <h2 className="text-xl font-semibold italic text-primary">"Describe a memorable journey you have taken."</h2>
          </div>
          
          <CardContent className="p-8 flex flex-col items-center space-y-8">
            <div className="relative">
              {isRecording && (
                <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping" />
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? "bg-red-500 scale-110" : "bg-primary hover:scale-105"
                } text-white shadow-xl relative z-10`}
              >
                {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            <div className="text-center">
              <p className="font-medium text-lg">
                {isRecording ? "Recording... (Tap to stop)" : audioUrl ? "Recording captured!" : "Standard Mock Exam"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aim for 1-2 minutes of speech.
              </p>
            </div>

            {audioUrl && (
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <audio src={audioUrl} controls className="w-full h-10" />
                <div className="flex gap-4">
                  <Button variant="outline" onClick={deleteRecording} className="flex-1">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                  <Button onClick={analyzeSpeech} disabled={isProcessing} className="flex-1 bg-accent hover:bg-accent/90">
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Analyze Mock
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {feedback ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-accent bg-accent/5 shadow-xl border-2 overflow-hidden">
                <CardHeader className="pb-4 border-b border-accent/10 bg-white/50 text-center">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="default" className="bg-accent uppercase text-[10px]">MUET Speaking</Badge>
                    <div className="text-right">
                       <span className="text-3xl font-black text-primary">{feedback.totalScore}</span>
                       <span className="text-xs font-bold text-muted-foreground ml-1">/ 75</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-2 bg-zinc-900 rounded-lg text-white">
                    <Star className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-xl font-black tracking-tighter">CEFR: {feedback.cefrLevel}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                          <span>Task Fulfilment</span>
                          <span>{feedback.taskFulfilmentScore} / 25</span>
                        </div>
                        <Progress value={(feedback.taskFulfilmentScore / 25) * 100} className="h-1 bg-primary/20" />
                     </div>
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                          <span>Language proficiency</span>
                          <span>{feedback.languageScore} / 25</span>
                        </div>
                        <Progress value={(feedback.languageScore / 25) * 100} className="h-1 bg-accent/20" />
                     </div>
                     <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase opacity-60">
                          <span>Fluency & Confidence</span>
                          <span>{feedback.fluencyConfidenceScore} / 25</span>
                        </div>
                        <Progress value={(feedback.fluencyConfidenceScore / 25) * 100} className="h-1 bg-orange-200" />
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-2">Examiner Points</h4>
                    <ul className="text-xs space-y-2">
                      {feedback.feedbackPoints.map((p, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/80 p-4 rounded-xl border border-accent/10">
                    <h4 className="text-[10px] font-bold flex items-center gap-2 mb-2 text-orange-600 uppercase">
                      <Headphones className="w-3 h-3" /> Pronunciation Tips
                    </h4>
                    <p className="text-[10px] leading-relaxed italic text-muted-foreground">{feedback.pronunciationTips}</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-zinc-900 text-white flex flex-col p-6 gap-4">
                   <div className="w-full">
                      <h4 className="text-[10px] font-bold flex items-center gap-2 mb-2 text-primary uppercase">
                        <Star className="h-3 w-3" /> Model Answer
                      </h4>
                      <p className="text-[10px] leading-relaxed opacity-80 italic">"{feedback.modelAnswer}"</p>
                   </div>
                   <Button variant="outline" className="w-full gap-2 border-white/20 hover:bg-white/10 text-white rounded-full h-11" onClick={deleteRecording}>
                      <RotateCcw className="w-4 h-4" /> Retry Speaking
                   </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
             <Card className="border-dashed py-16 flex flex-col items-center justify-center space-y-4 opacity-50 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Mic className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold">Ready for Analysis</p>
                  <p className="text-xs px-8">Record your response to the daily topic to receive a detailed MUET-style evaluation.</p>
                </div>
             </Card>
          )}
        </div>
      </div>
    </div>
  )
}
