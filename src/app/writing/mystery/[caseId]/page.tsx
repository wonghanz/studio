
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Lock, FileText, Search, Zap, CheckCircle2, MapPin } from 'lucide-react'

const caseMissions = {
  'case-001': [
    { id: 'm1', title: 'Crime Scene Description', type: 'Description', desc: 'Arrive at the market and document the visual evidence.', status: 'unlocked' },
    { id: 'm2', title: 'Witness Interview', type: 'Interview', desc: 'Record the statement of the bread vendor.', status: 'locked' },
    { id: 'm3', title: 'Preliminary Analysis', type: 'Analysis', desc: 'Connect the skid marks to the vehicle type.', status: 'locked' },
    { id: 'm4', title: 'Final Incident Report', type: 'Report', desc: 'Submit the full case summary to HQ.', status: 'locked' },
  ],
}

export default function CaseBoardPage() {
  const params = useParams()
  const caseId = params.caseId as string
  const [unlocked, setUnlocked] = useState<string[]>(['m1'])
  
  const missions = caseMissions[caseId as keyof typeof caseMissions] || []

  useEffect(() => {
    const saved = localStorage.getItem(`native_mystery_progress_${caseId}`)
    if (saved) setUnlocked(JSON.parse(saved))
  }, [caseId])

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/writing/mystery">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Case Board</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Investigative Sequence</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Active Missions
          </h2>
          <div className="space-y-3">
            {missions.map((m, i) => {
              const isUnlocked = unlocked.includes(m.id)
              const isCompleted = unlocked.includes(missions[i+1]?.id)
              
              return (
                <Card key={m.id} className={`border-none shadow-sm transition-all ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:scale-[1.01]'}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-accent/10 text-accent' : isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : isUnlocked ? <FileText className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{m.type}</span>
                        {isCompleted && <Badge className="text-[8px] h-4 bg-accent">Closed</Badge>}
                      </div>
                      <h3 className="font-bold">{m.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.desc}</p>
                    </div>
                    {isUnlocked && !isCompleted && (
                      <Link href={`/writing/mystery/${caseId}/${m.id}`}>
                        <Button size="sm">Start</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-zinc-900 text-white">
            <CardHeader className="pb-2">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-primary" /> Incident Locale
               </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                 <Search className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-[10px] mt-2 opacity-60 leading-relaxed italic">
                "Night market intersection, 11:45 PM. Heavy rain, limited visibility."
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" /> Clues Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               {unlocked.length > 1 ? (
                 <div className="p-2 bg-accent/5 rounded-lg border border-accent/10 text-[10px]">
                   <p className="font-bold text-accent">Evidence #01:</p>
                   <p>Shattered blue paint fragments found on curb.</p>
                 </div>
               ) : (
                 <p className="text-[10px] text-muted-foreground italic">No evidence collected yet. Complete the first mission to begin.</p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
