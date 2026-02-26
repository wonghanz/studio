
"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Send, Loader2, CheckCircle2, Info, Save } from 'lucide-react'
import { aiQuestEvaluation, type AiQuestEvaluationOutput } from '@/ai/flows/ai-quest-evaluation'
import { useToast } from '@/hooks/use-toast'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { updateGlobalWritingStreak } from '@/lib/streak-service'

const QUEST_DATA = {
  'q1': { title: 'Quick Reaction', prompt: 'Describe your favorite Malaysian food in 3 sentences.', target: '30-50 words' },
  'q2': { title: 'Improve the Sentence', prompt: 'Rewrite this sentence using formal academic vocabulary: "I think building more libraries is a good thing for students."', target: '50-80 words' },
  'q3': { title: 'Mini Opinion', prompt: 'Should students be allowed to use mobile phones in class? Give one reason.', target: '80-120 words' }
}

export default function QuestTaskPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()
  const taskId = params.taskId as string
  const quest = QUEST_DATA[taskId as keyof typeof QUEST_DATA] || QUEST_DATA['q1']

  const [text, setText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<AiQuestEvaluationOutput | null>(null)

  useEffect(() => {
    const draft = localStorage.getItem(`native_quest_draft_${taskId}`)
    if (draft) setText(draft)
  }, [taskId])

  const saveDraft = () => {
    setIsSaving(true)
    localStorage.setItem(`native_quest_draft_${taskId}`, text)
    setTimeout(() => {
      setIsSaving(false)
      toast({ title: "Draft saved locally" })
    }, 500)
  }

  const handleSubmit = async () => {
    setIsEvaluating(true)
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'SPM' | 'MUET') || 'SPM'
      const response = await aiQuestEvaluation({
        questTitle: quest.title,
        prompt: quest.prompt,
        userText: text,
        wordTarget: quest.target,
        examType
      })
      setResult(response)

      if (response.isCompleted) {
        // Track locally for today's quest list UI
        const today = new Date().toISOString().split('T')[0]
        const saved = localStorage.getItem(`native_quest_completed_${today}`)
        let completed = saved ? JSON.parse(saved) : []
        if (!completed.includes(taskId)) completed.push(taskId)
        localStorage.setItem(`native_quest_completed_${today}`, JSON.stringify(completed))

        if (user && db) {
          // 1. Record History
          addDoc(collection(db, 'users', user.uid, 'writingHistory'), {
            userId: user.uid,
            mode: 'quest',
            contentId: taskId,
            title: `Quest: ${quest.title}`,
            userText: text,
            bandScore: response.bandScore,
            feedback: response.feedback,
            improvementHints: response.improvementTips,
            createdAt: new Date().toISOString()
          })

          // 2. Update Unified Global Streak
          updateGlobalWritingStreak(db, user.uid);
        }
        
        toast({ title: "Quest Task Completed!", description: "Keep your streak alive!" })
      }
    } catch (error) {
      toast({ title: "Evaluation failed", variant: "destructive" })
    } finally {
      setIsEvaluating(false)
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{quest.title}</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Daily Task</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-lg overflow-hidden flex flex-col min-h-[400px]">
             <CardHeader className="bg-white py-3 border-b flex flex-row items-center justify-between">
               <span className="text-xs font-bold uppercase text-primary">Response Draft</span>
               <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={saveDraft}>
                   {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "Save Draft"}
                 </Button>
               </div>
             </CardHeader>
             <CardContent className="flex-1 p-0">
               <Textarea 
                 className="w-full h-full p-8 border-none focus-visible:ring-0 text-lg leading-relaxed bg-white"
                 placeholder="Write your response here..."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
               />
             </CardContent>
             <CardFooter className="border-t bg-zinc-50 p-4 flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Words: {wordCount}</span>
                <Button onClick={handleSubmit} disabled={isEvaluating || !text} className="gap-2 bg-primary hover:bg-primary/90">
                  {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Task
                </Button>
             </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> Task Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {quest.prompt}
              </p>
              <Badge variant="outline" className="mt-4 text-[10px]">{quest.target} words</Badge>
            </CardContent>
          </Card>

          {result && (
            <Card className={`animate-in slide-in-from-right-4 border-2 ${result.isCompleted ? 'border-accent bg-accent/5' : 'border-destructive/20 bg-destructive/5'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className={result.isCompleted ? 'bg-accent' : 'bg-destructive'}>
                    {result.isCompleted ? 'Task Done' : 'Improvement Needed'}
                  </Badge>
                  <span className="text-xl font-black">{result.bandScore}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs leading-relaxed font-medium">"{result.feedback}"</p>
                
                <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Coach Tips:</h4>
                    <ul className="text-[10px] space-y-1">
                      {result.improvementTips.map((tip, i) => (
                        <li key={i} className="flex gap-1 items-start">
                          <CheckCircle2 className="w-3 h-3 text-accent mt-0.5" /> 
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                </div>

                <Button variant="outline" size="sm" className="w-full text-[10px] h-8 gap-1" onClick={() => router.push(`/writing/quest`)}>
                   Back to Quests
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
