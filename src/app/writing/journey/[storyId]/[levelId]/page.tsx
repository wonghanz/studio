
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Loader2, Send, CheckCircle2, Info, Sparkles, BookOpen, History } from 'lucide-react'
import { aiJourneyEvaluation, type AiJourneyEvaluationOutput } from '@/ai/flows/ai-journey-evaluation'
import { useToast } from '@/hooks/use-toast'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'

const levelData = {
  'l1': { title: 'Setting the Scene', scenario: 'The sun is just rising over the paddy fields of Kedah. You pack your old backpack into the car. Describe the sights, sounds, and smells of this early morning start.', objectives: ['Use sensory details', 'Include at least 2 time-markers', 'Min. 80 words'], type: 'Description' },
  'l2': { title: 'The Breakdown', scenario: 'Steam is pouring from the engine. You are stranded on a quiet stretch of the highway. Describe the incident and your immediate reaction.', objectives: ['Use cause-effect language', 'Express emotion', 'Min. 100 words'], type: 'Problem' },
  'l3': { title: 'Roadside Wisdom', scenario: 'A local mechanic named Pak Mat helps you out. Write about the conversation and what he taught you about patience.', objectives: ['Use reported speech', 'Maintain a reflective tone', 'Min. 100 words'], type: 'Reflection' },
  'l4': { title: 'Arrival in KL', scenario: 'The city lights greet you. Summarize your journey, the mishap, and why this trip was more than just a drive.', objectives: ['Synthesize previous ideas', 'Use advanced connectors', 'Min. 150 words'], type: 'Full Essay' },
}

export default function JourneyWritingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()
  
  const storyId = params.storyId as string
  const levelId = params.levelId as string
  const level = levelData[levelId as keyof typeof levelData] || levelData['l1']
  
  const [text, setText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [result, setResult] = useState<AiJourneyEvaluationOutput | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const revisionSource = localStorage.getItem('native_revision_source')
    if (revisionSource) {
      setText(revisionSource)
      localStorage.removeItem('native_revision_source')
    } else {
      const draft = localStorage.getItem(`native_journey_draft_${storyId}_${levelId}`)
      if (draft) setText(draft)
    }
  }, [storyId, levelId])

  const saveDraft = () => {
    setIsSaving(true)
    localStorage.setItem(`native_journey_draft_${storyId}_${levelId}`, text)
    setTimeout(() => {
      setIsSaving(false)
      toast({ title: "Draft saved locally" })
    }, 500)
  }

  const handleSubmit = async () => {
    setIsEvaluating(true)
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'MUET' | 'SPM') || 'SPM'
      const response = await aiJourneyEvaluation({
        storyId,
        levelId,
        userText: text,
        levelTitle: level.title,
        examType
      })
      setResult(response)

      // Save to History
      if (user && db) {
        addDoc(collection(db, 'users', user.uid, 'writingHistory'), {
          userId: user.uid,
          mode: 'journey',
          contentId: storyId,
          level: levelId,
          title: `Journey: ${storyId} - ${level.title}`,
          userText: text,
          bandScore: response.bandScore,
          feedback: response.feedback,
          improvementHints: response.improvementHints,
          modelAnswer: response.modelAnswer,
          createdAt: new Date().toISOString()
        })
      }
      
      if (response.unlockNextLevel) {
        const saved = localStorage.getItem(`native_journey_progress_${storyId}`)
        let unlocked = saved ? JSON.parse(saved) : ['l1']
        const nextId = `l${parseInt(levelId.substring(1)) + 1}`
        if (!unlocked.includes(nextId)) unlocked.push(nextId)
        localStorage.setItem(`native_journey_progress_${storyId}`, JSON.stringify(unlocked))
        
        toast({ title: "Chapter Complete!", description: "You've progressed in your story." })
      }
    } catch (error) {
      toast({ title: "Evaluation failed", variant: "destructive" })
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{level.title}</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Story Level</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-lg overflow-hidden flex flex-col h-[500px]">
             <CardHeader className="bg-white py-3 border-b flex flex-row items-center justify-between">
               <span className="text-xs font-bold uppercase text-primary">Story Draft</span>
               <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={saveDraft}>
                   {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "Save Draft"}
                 </Button>
                 <Badge variant="secondary" className="text-[8px] bg-blue-50 text-blue-600">Archived</Badge>
               </div>
             </CardHeader>
             <CardContent className="flex-1 p-0">
               <Textarea 
                 className="w-full h-full p-8 border-none focus-visible:ring-0 text-lg leading-relaxed bg-white"
                 placeholder="Continue the story here..."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
               />
             </CardContent>
             <CardFooter className="border-t bg-zinc-50 p-4 flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Words: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
                <Button onClick={handleSubmit} disabled={isEvaluating || !text} className="gap-2 bg-primary hover:bg-primary/90">
                  {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Chapter
                </Button>
             </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Story Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {level.scenario}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-accent" /> Task Goals
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-2">
                {level.objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-medium p-1 border-b last:border-0">
                    <div className="w-3 h-3 rounded-full border border-accent/30 flex items-center justify-center" />
                    {obj}
                  </div>
                ))}
             </CardContent>
          </Card>

          {result && (
            <Card className={`animate-in slide-in-from-right-4 border-2 ${result.unlockNextLevel ? 'border-accent bg-accent/5' : 'border-destructive/20 bg-destructive/5'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className={result.unlockNextLevel ? 'bg-accent' : 'bg-destructive'}>
                    {result.unlockNextLevel ? 'Accepted' : 'Try Again'}
                  </Badge>
                  <span className="text-xl font-black">{result.bandScore}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs leading-relaxed font-medium">{result.feedback}</p>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8 gap-1" onClick={() => router.push(`/progress`)}>
                    <History className="w-3 h-3" /> History
                  </Button>
                  {result.unlockNextLevel && (
                    <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8" onClick={() => router.push(`/writing/journey/${storyId}`)}>
                        Story Board
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
