
"use client"

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, History, Zap, CheckCircle2, AlertCircle, RefreshCw, BookOpen, PenTool } from 'lucide-react'
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
    // Store original text in session or local storage for the editor to pick up
    localStorage.setItem('native_revision_source', attempt.userText)
    
    // Navigate back to the appropriate mode
    if (attempt.mode === 'mystery') {
      router.push(`/writing/mystery/${attempt.contentId}/${attempt.level}`)
    } else if (attempt.mode === 'journey') {
      router.push(`/writing/journey/${attempt.contentId}/${attempt.level}`)
    } else {
      router.push('/writing/practice')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Zap className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-muted-foreground">Retrieving your record...</p>
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
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
          <Card className="border-none shadow-lg bg-white">
            <CardHeader className="pb-2 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-primary" /> Your Submission
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {attempt.userText.split(/\s+/).length} Words
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed text-zinc-700 whitespace-pre-wrap italic">
                "{attempt.userText}"
              </p>
            </CardContent>
          </Card>

          {attempt.modelAnswer && (
            <Card className="border-none shadow-md bg-zinc-900 text-zinc-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                  <BookOpen className="w-4 h-4" /> Model Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic leading-relaxed opacity-80">{attempt.modelAnswer}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-accent bg-accent/5 shadow-md border-2">
            <CardHeader className="pb-2 text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Result</p>
              <div className="text-5xl font-black text-accent">{attempt.bandScore}</div>
            </CardHeader>
            <CardContent className="space-y-4">
               {attempt.strengths && attempt.strengths.length > 0 && (
                 <div>
                    <h4 className="text-[10px] font-bold uppercase text-accent mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Strengths
                    </h4>
                    <ul className="text-[10px] space-y-1">
                      {attempt.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                 </div>
               )}
               {attempt.weaknesses && attempt.weaknesses.length > 0 && (
                 <div>
                    <h4 className="text-[10px] font-bold uppercase text-destructive mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Weaknesses
                    </h4>
                    <ul className="text-[10px] space-y-1">
                      {attempt.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                 </div>
               )}
            </CardContent>
            <CardFooter className="pt-0">
               <Button onClick={handleRevise} className="w-full gap-2 bg-accent hover:bg-accent/90">
                 <RefreshCw className="w-4 h-4" /> Revise & Improve
               </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">{attempt.feedback}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
