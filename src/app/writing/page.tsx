"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, Send, CheckCircle2, AlertCircle, PenTool } from 'lucide-react'
import { aiWritingFeedback, type AiWritingFeedbackOutput } from '@/ai/flows/ai-writing-feedback'

export default function WritingPage() {
  const [essay, setEssay] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [feedback, setFeedback] = useState<AiWritingFeedbackOutput | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const draft = localStorage.getItem('native_writing_draft')
    if (draft) setEssay(draft)
  }, [])

  const saveDraft = () => {
    setIsSaving(true)
    localStorage.setItem('native_writing_draft', essay)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }

  const handleSubmit = async () => {
    if (essay.length < 50) {
      toast({
        title: "Essay too short",
        description: "Please write at least 50 words for a meaningful evaluation.",
        variant: "destructive"
      })
      return
    }

    setIsEvaluating(true)
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'MUET' | 'SPM') || 'SPM'
      const result = await aiWritingFeedback({ essayText: essay, examType })
      setFeedback(result)
      toast({ title: "Evaluation complete!", description: "Check your feedback below." })
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
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Writing Practice</h1>
        <p className="text-muted-foreground">Draft your essays offline. Submit for AI feedback online.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-sm h-[500px] flex flex-col">
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
                className="w-full h-full p-6 border-none focus-visible:ring-0 resize-none text-lg leading-relaxed rounded-none"
                placeholder="Start writing your essay here..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
              />
            </CardContent>
            <CardFooter className="bg-secondary/20 p-4 border-t flex justify-between">
              <div className="text-xs text-muted-foreground font-medium">
                Word Count: {essay.trim() ? essay.trim().split(/\s+/).length : 0}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={saveDraft} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Draft
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={isEvaluating || !essay}>
                  {isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Evaluate
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                "Some people believe that technology has made the world a better place to live, while others disagree. Discuss both views and give your opinion."
              </p>
            </CardContent>
          </Card>

          {feedback ? (
            <Card className="border-accent shadow-md bg-accent/5 animate-in slide-in-from-right-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default" className="bg-accent">Evaluation</Badge>
                  <span className="text-2xl font-bold text-accent">{feedback.score}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[400px] overflow-auto pr-2">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Strengths
                  </h4>
                  <ul className="text-xs space-y-1">
                    {feedback.strengths.map((s, i) => (
                      <li key={i} className="list-disc ml-4">{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Weaknesses
                  </h4>
                  <ul className="text-xs space-y-1">
                    {feedback.weaknesses.map((w, i) => (
                      <li key={i} className="list-disc ml-4">{w}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2">
                  <h4 className="text-sm font-bold mb-1">Feedback</h4>
                  <p className="text-xs leading-relaxed opacity-80">{feedback.feedback}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <PenTool className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm">Submit your essay to see AI evaluation results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
