"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Mic, Square, Loader2, BarChart, Sparkles, Trash2, Star } from 'lucide-react'
import { aiSpeakingExamination, type AiSpeakingExaminationOutput } from '@/ai/flows/ai-speaking-examination'

export default function SpeakingPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState<AiSpeakingExaminationOutput | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

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
        const examType = (localStorage.getItem('native_exam_target') as 'MUET' | 'SPM') || 'SPM'
        
        const result = await aiSpeakingExamination({
          audioDataUri: base64data,
          examType,
          topic: "Describe a memorable journey you have taken."
        })
        
        setFeedback(result)
        toast({ title: "Analysis complete!" })
        setIsProcessing(false)
      }
    } catch (error) {
      toast({ title: "Analysis failed", description: "Something went wrong.", variant: "destructive" })
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Speaking Examination</h1>
        <p className="text-muted-foreground">Practice your speaking skills with AI-powered feedback.</p>
      </header>

      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <div className="bg-primary/5 p-6 border-b text-center">
          <Badge className="mb-4 bg-primary">Topic of the Day</Badge>
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
              {isRecording ? "Recording... (Tap to stop)" : audioUrl ? "Recording captured!" : "Tap to start recording"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
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
                  Analyze with AI
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {feedback && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-accent bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider opacity-60">Estimated Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-accent">{feedback.bandScore}</div>
              </CardContent>
            </Card>
            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider opacity-60">Fluency Rank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={`h-2 flex-1 rounded-full ${s <= 4 ? "bg-primary" : "bg-primary/20"}`} />
                  ))}
                </div>
                <p className="text-xs mt-2 text-primary font-medium">Good Pacing</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Examiner's Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-bold text-sm mb-1">Fluency & Pronunciation</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feedback.fluencyTips}</p>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Coherence & Organization</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feedback.coherenceFeedback}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-zinc-900 text-zinc-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Star className="w-5 h-5" />
                Model Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic leading-relaxed opacity-80">"{feedback.modelAnswer}"</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
