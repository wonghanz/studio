
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Lock, FileText, Search, Zap, CheckCircle2, MapPin, Mail, ClipboardCheck, Link as LinkIcon, FileCheck } from 'lucide-react'

const caseMissions = {
  'case-001': [
    { 
      id: 'm1', 
      title: 'The Witness Email', 
      type: 'MUET Task 1', 
      desc: 'Reply to a key witness email. Acknowledge evidence and suggest a secure meeting.', 
      icon: Mail,
      status: 'unlocked' 
    },
    { 
      id: 'm2', 
      title: 'Pinning the Motive', 
      type: 'MUET Task 2', 
      desc: 'Draft strong topic sentences for the Chief regarding accident causes.', 
      icon: ClipboardCheck,
      status: 'locked' 
    },
    { 
      id: 'm3', 
      title: 'The Red String', 
      type: 'MUET Task 2', 
      desc: 'Connect your investigative points using advanced discourse markers.', 
      icon: LinkIcon,
      status: 'locked' 
    },
    { 
      id: 'm4', 
      title: 'The Official Case File', 
      type: 'MUET Task 2', 
      desc: 'Submit the final synthesized report and recommendations to Council.', 
      icon: FileCheck,
      status: 'locked' 
    },
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
          <h1 className="text-3xl font-black text-primary">Case Board</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Investigative Sequence (MUET Alignment)</p>
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
              const Icon = m.icon;
              
              return (
                <Card key={m.id} className={`border-none shadow-sm transition-all ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:scale-[1.01] hover:shadow-md'}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-accent/10 text-accent' : isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {isCompleted ? <CheckCircle2 className="w-7 h-7" /> : <Icon className="w-7 h-7" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 text-primary">{m.type}</span>
                        {isCompleted && <Badge className="text-[8px] h-4 bg-accent">Closed</Badge>}
                        {!isUnlocked && <Lock className="w-3 h-3 opacity-40" />}
                      </div>
                      <h3 className="font-bold text-lg leading-tight">{m.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{m.desc}</p>
                    </div>
                    {isUnlocked && !isCompleted && (
                      <Link href={`/writing/mystery/${caseId}/${m.id}`}>
                        <Button size="sm" className="rounded-full px-6">Investigate</Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-zinc-900 text-white overflow-hidden">
            <CardHeader className="pb-2 bg-primary/20">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-primary" /> Incident Locale
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 relative group overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxuZW9uJTIwbWFya2V0fGVufDB8fHx8MTc3MTk0NjMzMnww&ixlib=rb-4.1.0&q=80&w=1080" 
                   className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                   alt="Scene"
                 />
                 <Search className="w-8 h-8 opacity-50 absolute" />
              </div>
              <p className="text-[10px] mt-4 opacity-70 leading-relaxed italic text-zinc-300">
                "Night market intersection, 11:45 PM. Heavy rain, limited visibility. Suspect vehicle fled towards Federal Highway."
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-accent">
                <Zap className="w-4 h-4" /> Evidence Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               {unlocked.length > 1 ? (
                 <div className="space-y-2">
                    <div className="p-3 bg-accent/5 rounded-xl border border-accent/10 text-[10px] animate-in slide-in-from-top-2">
                      <p className="font-bold text-accent mb-1">Evidence #01: Paint Fragments</p>
                      <p className="text-zinc-600">Shattered blue paint found on south curb. High-velocity impact suspected.</p>
                    </div>
                    {unlocked.length > 2 && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[10px] animate-in slide-in-from-top-2">
                        <p className="font-bold text-blue-600 mb-1">Evidence #02: Witness Statement</p>
                        <p className="text-zinc-600">Mr. Lim confirms a silver sedan with faulty brake lights.</p>
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center py-6 text-center opacity-40">
                   <FileText className="w-10 h-10 mb-2" />
                   <p className="text-[10px] font-bold">No evidence found.<br/>Complete Mission 1.</p>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
