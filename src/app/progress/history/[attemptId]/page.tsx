
"use client"

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, History, Zap, CheckCircle2, AlertCircle, RefreshCw, BookOpen, PenTool, Award, Target } from 'lucide-react'
import { useUser, useFirestore, useDoc } from '@/firebase'
import { format } from 'date-fns'

export default function AttemptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params.attemptId as string
  const { user } = useUser()
  const db = useFirestore()

  const attemptRef = useMemo(() => {
    if (!db || !user || !attemptId) return null
    return `/users/${user.uid}/writingHistory/${attemptId}`
  }, [db, user, attemptId])

  const { data: attempt, loading } = useDoc(attemptRef)

  const handleRevise = () => {
    if (!attempt) return
    localStorage.setItem('native_revision_source', attempt.userText)
    
    if (attempt.mode === 'mystery') {
      router.push(`/writing/mystery/${attempt.contentId}/${attempt.level}`)
    } else if (attempt.mode === 'journey') {
      router.push(`/writing/journey/${attempt.contentId}/${attempt.level}`)
    } else if (attempt.mode === 'quest') {
      router.push(`/writing/quest/${attempt.contentId}`)
    } else {
      router.push('/writing/practice')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Zap className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase">Retrieving your record...</p>
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">Record not found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const isMuetScored = attempt.totalScore !== undefined;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{attempt.title || 'Writing Attempt'}</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
            <History className="w-3 h-3" /> 
            Archived {attempt.createdAt ? format(new Date(attempt.createdAt), 'MMM d, yyyy') : 'Recent'}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg bg-white overflow-hidden">
            <CardHeader className="pb-2 border-b bg-zinc-50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <PenTool className="w-3 h-3" /> Your Original Submission
                </CardTitle>
                <Badge variant="outline" className="text-[8px] uppercase tracking-widest">
                  {attempt.userText.split(/\s+/).length} Words
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <p className="text-lg leading-relaxed text-zinc-700 whitespace-pre-wrap italic font-serif">
                "{attempt.userText}"
              </p>
            </CardContent>
          </Card>

          {attempt.modelAnswer && (
            <Card className="border-none shadow-md bg-zinc-900 text-zinc-100 overflow-hidden">
              <CardHeader className="pb-2 border-b border-white/10 bg-white/5">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <BookOpen className="w-3 h-3" /> Model Band 5 Sample
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm italic leading-relaxed opacity-80 font-serif">"{attempt.modelAnswer}"</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-accent bg-accent/5 shadow-xl border-2 overflow-hidden">
            <CardHeader className="pb-4 text-center border-b border-accent/10 bg-white/50">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-2">Final Proficiency</p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-4xl font-black text-primary">{isMuetScored ? attempt.totalScore : attempt.bandScore}</div>
                {isMuetScored && <span className="text-xs font-bold opacity-40">/ 40</span>}
              </div>
              {isMuetScored && (
                 <div className="mt-2 inline-block px-3 py-1 bg-zinc-900 rounded-full text-white text-[10px] font-bold">
                    CEFR: {attempt.cefrLevel}
                 </div>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               {isMuetScored && (
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase opacity-60">Task Fulfilment</p>
                      <div className="text-sm font-black">{attempt.taskFulfilmentScore} / 20</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold uppercase opacity-60">Language & Org</p>
                      <div className="text-sm font-black">{attempt.languageOrganisationScore} / 20</div>
                    </div>
                 </div>
               )}

               <div className="space-y-4">
                  {attempt.strengths && attempt.strengths.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold uppercase text-accent mb-2 flex items-center gap-1 tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Key Strengths
                        </h4>
                        <ul className="text-[10px] space-y-1 font-medium">
                          {attempt.strengths.map((s: string, i: number) => <li key={i} className="flex gap-1"><span>•</span> {s}</li>)}
                        </ul>
                    </div>
                  )}
                  {attempt.improvementHints && attempt.improvementHints.length > 0 && (
                    <div>
                        <h4 className="text-[10px] font-bold uppercase text-red-500 mb-2 flex items-center gap-1 tracking-widest">
                          <Target className="w-3 h-3" /> Focus Areas
                        </h4>
                        <ul className="text-[10px] space-y-1 font-medium">
                          {attempt.improvementHints.map((w: string, i: number) => <li key={i} className="flex gap-1"><span>•</span> {w}</li>)}
                        </ul>
                    </div>
                  )}
               </div>

               <div className="bg-white/50 p-4 rounded-xl border border-accent/10">
                  <h4 className="text-[10px] font-bold mb-1 uppercase tracking-widest opacity-60">Examiner Context</h4>
                  <p className="text-[10px] leading-relaxed italic text-muted-foreground">"{attempt.feedback}"</p>
               </div>
            </CardContent>
            <CardFooter className="pt-0 p-6">
                 <Button onClick={handleRevise} className="w-full gap-2 bg-primary hover:bg-primary/90 rounded-full h-11 shadow-lg">
                   <RefreshCw className="w-4 h-4" /> Start Revision
                 </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
