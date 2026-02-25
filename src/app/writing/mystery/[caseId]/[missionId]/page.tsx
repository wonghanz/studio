
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Loader2, Send, ShieldCheck, AlertCircle, Info, Sparkles, History } from 'lucide-react'
import { aiMysteryEvaluation, type AiMysteryEvaluationOutput } from '@/ai/flows/ai-mystery-evaluation'
import { useToast } from '@/hooks/use-toast'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'

const missionData = {
  'm1': { title: 'Crime Scene Description', scenario: 'You stand at the edge of the night market. The ground is wet. There are scattered stalls and blue paint chips on the curb. Describe what you see in at least 100 words using formal descriptive language.', objectives: ['Mention the curb', 'Describe the weather', 'Use at least 3 adjectives'], type: 'Description' },
  'm2': { title: 'Witness Interview', scenario: 'The bread vendor, Mr. Tan, saw a vehicle speeding away. Write a formal summary of his statement as if you were interviewing him.', objectives: ['Use reported speech', 'Include time markers', 'Maintain a neutral tone'], type: 'Interview' },
}

export default function MissionWritingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()
  
  const caseId = params.caseId as string
  const missionId = params.missionId as string
  const mission = missionData[missionId as keyof typeof missionData] || missionData['m1']
  
  const [text, setText] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [result, setResult] = useState<AiMysteryEvaluationOutput | null>(null)

  useEffect(() => {
    const revisionSource = localStorage.getItem('native_revision_source')
    if (revisionSource) {
      setText(revisionSource)
      localStorage.removeItem('native_revision_source')
    }
  }, [])

  const handleSubmit = async () => {
    setIsEvaluating(true)
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'MUET' | 'SPM') || 'SPM'
      const response = await aiMysteryEvaluation({
        caseId,
        missionId,
        userText: text,
        missionType: mission.type,
        examType
      })
      setResult(response)
      
      // Save to History
      if (user && db) {
        addDoc(collection(db, 'users', user.uid, 'writingHistory'), {
          userId: user.uid,
          mode: 'mystery',
          contentId: caseId,
          level: missionId,
          title: `Case: ${caseId} - ${mission.title}`,
          userText: text,
          bandScore: response.bandScore,
          feedback: response.feedback,
          improvementHints: response.improvementHints,
          modelAnswer: response.modelAnswer,
          createdAt: new Date().toISOString()
        })
      }

      if (response.unlockNextClue) {
        const saved = localStorage.getItem(`native_mystery_progress_${caseId}`)
        let unlocked = saved ? JSON.parse(saved) : ['m1']
        const nextId = `m${parseInt(missionId.substring(1)) + 1}`
        if (!unlocked.includes(nextId)) unlocked.push(nextId)
        localStorage.setItem(`native_mystery_progress_${caseId}`, JSON.stringify(unlocked))
        
        toast({ title: "Evidence Unlocked!", description: "Mission successful." })
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
          <h1 className="text-xl font-bold">{mission.title}</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Mystery Mission</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-none shadow-lg overflow-hidden flex flex-col h-[500px]">
             <CardHeader className="bg-zinc-900 text-white py-3">
               <div className="flex justify-between items-center">
                 <span className="text-xs font-bold uppercase">Detective Report</span>
                 <Badge variant="outline" className="text-[8px] border-zinc-700 text-zinc-400">Archived via Firestore</Badge>
               </div>
             </CardHeader>
             <CardContent className="flex-1 p-0">
               <Textarea 
                 className="w-full h-full p-8 border-none focus-visible:ring-0 text-lg leading-relaxed bg-zinc-50/50"
                 placeholder="Type your official investigative findings here..."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
               />
             </CardContent>
             <CardFooter className="border-t bg-white p-4 flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Words: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
                <Button onClick={handleSubmit} disabled={isEvaluating || !text} className="gap-2">
                  {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  File Report
                </Button>
             </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Scenario Context
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {mission.scenario}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-accent" /> Objectives
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-2">
                {mission.objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-medium p-1 border-b last:border-0">
                    <div className="w-3 h-3 rounded-sm border border-accent/30 flex items-center justify-center" />
                    {obj}
                  </div>
                ))}
             </CardContent>
          </Card>

          {result && (
            <Card className={`animate-in slide-in-from-right-4 border-2 ${result.unlockNextClue ? 'border-accent bg-accent/5' : 'border-destructive/20 bg-destructive/5'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className={result.unlockNextClue ? 'bg-accent' : 'bg-destructive'}>
                    {result.unlockNextClue ? 'Accepted' : 'Revision Required'}
                  </Badge>
                  <span className="text-xl font-black">{result.bandScore}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs leading-relaxed font-medium">{result.feedback}</p>
                
                {result.improvementHints.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Hints:</h4>
                    <ul className="text-[10px] space-y-1">
                      {result.improvementHints.map((h, i) => (
                        <li key={i} className="flex gap-1"><span>•</span> {h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8 gap-1" onClick={() => router.push(`/progress`)}>
                      <History className="w-3 h-3" /> History
                  </Button>
                  {result.unlockNextClue && (
                    <Button variant="outline" size="sm" className="flex-1 text-[10px] h-8" onClick={() => router.push(`/writing/mystery/${caseId}`)}>
                        Case Board
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
