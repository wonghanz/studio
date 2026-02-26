
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, Loader2, Send, CheckCircle2, Siren, Zap, Search, ClipboardList,
  ArrowRight, Info, History
} from 'lucide-react'
import { aiMysteryEvaluation, type AiMysteryEvaluationOutput } from '@/ai/flows/ai-mystery-evaluation'
import { useToast } from '@/hooks/use-toast'
import { useUser, useFirestore } from '@/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { updateGlobalWritingStreak } from '@/lib/streak-service'

const missionData = {
  'm1': { 
    title: 'The Witness Email', 
    scenario: 'A key witness, Mr. Lim, has sent you a photo of the getaway car. He wants to meet at "Kopi Café" at 9 PM tonight. Reply to him formally.',
    muetFocus: 'Task 1: Formal Email',
    objectives: [
      { id: 'ack', label: 'Acknowledge Email', checked: false },
      { id: 'dec', label: 'Decline 9 PM Meeting', checked: false },
      { id: 'sug', label: 'Suggest Safer Place/Time', checked: false },
      { id: 'ask', label: 'Ask for License Plate', checked: false }
    ],
    wordLimit: 100,
    type: 'Email'
  },
  'm2': { 
    title: 'Pinning the Motive', 
    scenario: 'The Chief demands a preliminary theory on why accidents are increasing at the Night Market. Draft three strong Topic Sentences.',
    muetFocus: 'Task 2: Topic Sentences',
    objectives: [
      { id: 'cause1', label: 'Cause 1: Visibility', checked: false },
      { id: 'cause2', label: 'Cause 2: Illegal Parking', checked: false },
      { id: 'cause3', label: 'Cause 3: Reckless Driving', checked: false }
    ],
    type: 'Academic Report'
  },
  'm3': { 
    title: 'The Red String', 
    scenario: 'Connect your previous points. Link the causes of accidents into a cohesive body paragraph using advanced connectors.',
    muetFocus: 'Task 2: Cohesion',
    objectives: [
      { id: 'coh1', label: 'Use Addition Marker (Furthermore)', checked: false },
      { id: 'coh2', label: 'Use Result Marker (Consequently)', checked: false }
    ],
    type: 'Synthesis'
  },
  'm4': { 
    title: 'The Official Case File', 
    scenario: 'Case closing. Summarize findings and give a final recommendation to the City Council to prevent future accidents.',
    muetFocus: 'Task 2: Conclusion',
    objectives: [
      { id: 'syn', label: 'Synthesize Findings', checked: false },
      { id: 'rec', label: 'Recommend Action', checked: false }
    ],
    type: 'Executive Summary'
  }
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
  const [checklist, setChecklist] = useState(mission.objectives)
  const [toneAlert, setToneAlert] = useState<{message: string, suggestion: string} | null>(null)

  useEffect(() => {
    const textLower = text.toLowerCase();
    
    const newChecklist = checklist.map(obj => {
      let isFound = false;
      
      if (missionId === 'm1') {
        if (obj.id === 'ack') isFound = textLower.includes('acknowledge') || textLower.includes('thank') || textLower.includes('received');
        if (obj.id === 'dec') isFound = textLower.includes('unable') || textLower.includes('cannot') || textLower.includes('too late') || textLower.includes('decline');
        if (obj.id === 'sug') isFound = textLower.includes('suggest') || textLower.includes('instead') || textLower.includes('rather');
        if (obj.id === 'ask') isFound = textLower.includes('license') || textLower.includes('plate') || textLower.includes('number');
      }
      return { ...obj, checked: isFound };
    });
    
    if (JSON.stringify(newChecklist) !== JSON.stringify(checklist)) {
      setChecklist(newChecklist);
    }

    const slang = ['bro', 'thanks', 'late', 'thing', 'stuff', 'wanna', 'gonna'];
    const foundSlang = slang.find(s => textLower.includes(s));
    
    if (foundSlang && missionId === 'm1') {
      setToneAlert({
        message: "Tone Siren: Slang Detected!",
        suggestion: `Rookie, '${foundSlang}' won't do for official reports. Try 'Sir' or 'would like to'.`
      });
    } else {
      setToneAlert(null);
    }
  }, [text, missionId]);

  const handleSubmit = async () => {
    setIsEvaluating(true);
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'MUET' | 'SPM') || 'MUET';
      const response = await aiMysteryEvaluation({
        caseId,
        missionId,
        userText: text,
        missionType: mission.type,
        examType
      });
      setResult(response);
      
      if (user && db) {
        // 1. Record History
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
        });

        // 2. Update Unified Global Streak
        updateGlobalWritingStreak(db, user.uid);
      }

      if (response.unlockNextClue) {
        const saved = localStorage.getItem(`native_mystery_progress_${caseId}`);
        let unlocked = saved ? JSON.parse(saved) : ['m1'];
        const nextId = `m${parseInt(missionId.substring(1)) + 1}`;
        if (!unlocked.includes(nextId)) unlocked.push(nextId);
        localStorage.setItem(`native_mystery_progress_${caseId}`, JSON.stringify(unlocked));
        toast({ title: "Case Updated!", description: "Streak maintained. Intelligence gathered." });
      }
    } catch (error) {
      toast({ title: "Evaluation failed", variant: "destructive" });
    } finally {
      setIsEvaluating(false);
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const progressPercent = (checklist.filter(c => c.checked).length / checklist.length) * 100;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-black">{mission.title}</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
            <Zap className="w-3 h-3 text-accent" /> {mission.muetFocus}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {toneAlert && (
            <div className="bg-red-500 text-white p-4 rounded-2xl flex gap-3 items-center animate-bounce shadow-xl">
              <Siren className="w-6 h-6 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">{toneAlert.message}</p>
                <p className="opacity-90">{toneAlert.suggestion}</p>
              </div>
            </div>
          )}

          <Card className="border-none shadow-2xl overflow-hidden flex flex-col min-h-[500px] bg-white">
             <CardHeader className="bg-zinc-900 text-white py-4 flex flex-row items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                 </div>
                 <span className="text-xs font-bold uppercase tracking-wider">Investigative Report Draft</span>
               </div>
               <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {mission.type}
               </Badge>
             </CardHeader>
             <CardContent className="flex-1 p-0 relative">
               <Textarea 
                 className="w-full h-full min-h-[400px] p-10 border-none focus-visible:ring-0 text-lg leading-relaxed bg-transparent font-serif"
                 placeholder="Type your official findings here..."
                 value={text}
                 onChange={(e) => setText(e.target.value)}
               />
               
               <div className="absolute bottom-6 left-10 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Word Count: <span className={cn(mission.wordLimit && wordCount > mission.wordLimit ? 'text-red-500' : '')}>{wordCount}</span> {mission.wordLimit && `/ ${mission.wordLimit}`}
               </div>
             </CardContent>
             <CardFooter className="border-t bg-zinc-50 p-6 flex justify-between items-center">
                <div className="flex-1 max-w-[200px] mr-4">
                   <div className="flex justify-between text-[8px] font-bold uppercase mb-1 opacity-60">
                     <span>Mission Progress</span>
                     <span>{Math.round(progressPercent)}%</span>
                   </div>
                   <Progress value={progressPercent} className="h-1.5" />
                </div>
                <Button onClick={handleSubmit} disabled={isEvaluating || !text} className="gap-2 h-12 px-8 rounded-full shadow-lg">
                  {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Case File
                </Button>
             </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Info className="w-4 h-4" /> The Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {mission.scenario}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
             <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center gap-2 text-accent">
                 <ClipboardList className="w-4 h-4" /> Intent Checklist
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                {checklist.map((obj) => (
                  <div key={obj.id} className={cn(
                    "flex items-center gap-3 text-[11px] font-medium p-3 rounded-xl border transition-all",
                    obj.checked ? "bg-accent/10 border-accent/20 text-accent" : "bg-zinc-50 border-zinc-100 opacity-60"
                  )}>
                    {obj.checked ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2" />}
                    {obj.label}
                  </div>
                ))}
             </CardContent>
          </Card>

          {result && (
            <Card className={cn(
              "animate-in slide-in-from-right-4 border-2 shadow-2xl",
              result.unlockNextClue ? 'border-accent bg-accent/5' : 'border-destructive/20 bg-destructive/5'
            )}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className={result.unlockNextClue ? 'bg-accent' : 'bg-destructive'}>
                    {result.unlockNextClue ? 'Case Closed' : 'Rejected by Chief'}
                  </Badge>
                  <span className="text-2xl font-black text-primary">{result.bandScore}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/50 p-4 rounded-xl">
                  <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-2">Chief's Review</h4>
                  <p className="text-xs leading-relaxed font-medium italic">"{result.feedback}"</p>
                </div>
                
                {result.improvementHints.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Investigation Hints:</h4>
                    <ul className="text-[10px] space-y-1">
                      {result.improvementHints.map((h, i) => (
                        <li key={i} className="flex gap-1 items-start">
                          <ArrowRight className="w-3 h-3 text-primary mt-0.5" /> 
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-[10px] h-10 gap-1 rounded-xl" onClick={() => router.push(`/progress`)}>
                      <History className="w-4 h-4" /> History
                  </Button>
                  {result.unlockNextClue && (
                    <Button size="sm" className="flex-1 text-[10px] h-10 rounded-xl bg-accent" onClick={() => router.push(`/writing/mystery/${caseId}`)}>
                        Return to Case Board
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
