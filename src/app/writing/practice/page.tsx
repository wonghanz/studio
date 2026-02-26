
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Send, CheckCircle2, AlertCircle, PenTool, Search, ChevronLeft, History, Award, BookOpen, Target } from 'lucide-react'
import { aiWritingFeedback, type AiWritingFeedbackOutput } from '@/ai/flows/ai-writing-feedback'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { updateGlobalWritingStreak } from '@/lib/streak-service'

export default function StandardPracticePage() {
  const [essay, setEssay] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [feedback, setFeedback] = useState<AiWritingFeedbackOutput | null>(null)
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  useEffect(() => {
    const revisionSource = localStorage.getItem('native_revision_source')
    if (revisionSource) {
      setEssay(revisionSource)
      localStorage.removeItem('native_revision_source')
      toast({ title: "Revision started", description: "Your original draft has been loaded." })
    } else {
      const draft = localStorage.getItem('native_writing_draft')
      if (draft) setEssay(draft)
    }
  }, [toast])

  const saveDraft = () => {
    setIsSaving(true)
    localStorage.setItem('native_writing_draft', essay)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }

  const handleSubmit = async () => {
    const wordCount = essay.trim().split(/\s+/).length
    if (wordCount < 50) {
      toast({
        title: "Essay too short",
        description: "Please write at least 50 words for a meaningful evaluation.",
        variant: "destructive"
      })
      return
    }

    setIsEvaluating(true)
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'MUET' | 'SPM') || 'MUET'
      const result = await aiWritingFeedback({ essayText: essay, examType })
      setFeedback(result)
      
      if (user && db) {
        // 1. Record History
        addDoc(collection(db, 'users', user.uid, 'writingHistory'), {
          userId: user.uid,
          mode: 'standard',
          title: 'Standard Practice Essay',
          userText: essay,
          bandScore: result.cefrLevel,
          taskFulfilmentScore: result.taskFulfilmentScore,
          languageOrganisationScore: result.languageOrganisationScore,
          totalScore: result.totalScore,
          cefrLevel: result.cefrLevel,
          feedback: result.feedback,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          improvementHints: result.improvementTips,
          modelAnswer: result.modelBand5Sample,
          createdAt: new Date().toISOString()
        })

        // 2. Update Unified Global Streak
        updateGlobalWritingStreak(db, user.uid);
      }

      toast({ title: "Evaluation complete!", description: "Streak maintained. Check your feedback." })
    } catch (error) {
      toast({
        title: "Evaluation failed",
        description: "Please check your connection and try again.",
        variant: "destructive"
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/writing">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">MUET Standard Practice</h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Official Rubric Scoring</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-sm h-[600px] flex flex-col bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Draft Editor</CardTitle>
              {lastSaved && (
                <span className="text-[10px] text-muted-foreground">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Textarea
                className="w-full h-full p-10 border-none focus-visible:ring-0 resize-none text-lg leading-relaxed rounded-none bg-transparent"
                placeholder="Start writing your essay here..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
              />
            </CardContent>
            <CardFooter className="bg-zinc-50 p-6 border-t flex justify-between items-center">
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Word Count: {essay.trim() ? essay.trim().split(/\s+/).length : 0}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveDraft} disabled={isSaving} className="rounded-full">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Draft
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={isEvaluating || !essay} className="rounded-full px-8">
                  {isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Evaluate
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-md bg-white border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                <Search className="w-4 h-4" /> Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                "Modern technology has made communication easier but at the cost of face-to-face interaction. To what extent do you agree with this statement? Discuss with relevant examples."
              </p>
            </CardContent>
          </Card>

          {feedback ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
               <Card className="border-accent bg-accent/5 shadow-xl border-2 overflow-hidden">
                <CardHeader className="pb-4 border-b border-accent/10 bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="bg-accent uppercase text-[10px]">MUET Result</Badge>
                    <div className="text-right">
                       <span className="text-3xl font-black text-primary">{feedback.totalScore}</span>
                       <span className="text-xs font-bold text-muted-foreground ml-1">/ 40</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-2 bg-zinc-900 rounded-lg text-white">
                    <Award className="w-4 h-4 mr-2 text-primary" />
                    <span className="text-xl font-black tracking-tighter">CEFR: {feedback.cefrLevel}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase opacity-60">Task Fulfilment</p>
                        <div className="text-lg font-black">{feedback.taskFulfilmentScore} / 20</div>
                        <Progress value={(feedback.taskFulfilmentScore / 20) * 100} className="h-1" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase opacity-60">Language & Org</p>
                        <div className="text-lg font-black">{feedback.languageOrganisationScore} / 20</div>
                        <Progress value={(feedback.languageOrganisationScore / 20) * 100} className="h-1" />
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold flex items-center gap-2 mb-2 text-accent uppercase tracking-widest">
                        <CheckCircle2 className="h-3 w-3" /> Strengths
                      </h4>
                      <ul className="text-[10px] space-y-1 font-medium">
                        {feedback.strengths.map((s, i) => (
                          <li key={i} className="flex gap-2"><span>•</span> {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold flex items-center gap-2 mb-2 text-red-500 uppercase tracking-widest">
                        <Target className="h-3 w-3" /> Areas to Improve
                      </h4>
                      <ul className="text-[10px] space-y-1 font-medium">
                        {feedback.weaknesses.map((w, i) => (
                          <li key={i} className="flex gap-2"><span>•</span> {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white/80 p-4 rounded-xl border border-accent/10">
                    <h4 className="text-[10px] font-bold mb-2 uppercase tracking-widest">Expert Feedback</h4>
                    <p className="text-[10px] leading-relaxed italic text-muted-foreground">"{feedback.feedback}"</p>
                  </div>
                </CardContent>
                <CardFooter className="bg-zinc-900 text-white flex flex-col p-6 gap-4">
                   <div className="w-full">
                      <h4 className="text-[10px] font-bold flex items-center gap-2 mb-2 text-primary uppercase">
                        <BookOpen className="h-3 w-3" /> Model Band 5 Sample
                      </h4>
                      <p className="text-[10px] leading-relaxed opacity-80 italic">"{feedback.modelBand5Sample}"</p>
                   </div>
                   <Link href="/progress" className="w-full">
                     <Button variant="outline" size="sm" className="w-full gap-2 border-white/20 hover:bg-white/10 text-white rounded-full">
                        <History className="w-4 h-4" /> View Full History
                     </Button>
                   </Link>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-4 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <PenTool className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ready to Evaluate</p>
              <p className="text-xs">Submit your essay to see your MUET breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
