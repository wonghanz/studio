
"use client"

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Award, Target, Zap, Info, ShieldAlert, History, Calendar, ChevronRight, Mic, PenTool } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUser, useFirestore, useCollection } from '@/firebase'
import { collection, query, orderBy } from 'firebase/firestore'
import Link from 'next/link'
import { format } from 'date-fns'

const chartData = [
  { day: 'Mon', speaking: 4.5, writing: 5.0 },
  { day: 'Tue', speaking: 4.8, writing: 5.2 },
  { day: 'Wed', speaking: 5.2, writing: 5.5 },
  { day: 'Thu', speaking: 5.5, writing: 5.4 },
  { day: 'Fri', speaking: 5.8, writing: 5.9 },
  { day: 'Sat', speaking: 6.2, writing: 6.0 },
  { day: 'Sun', speaking: 6.5, writing: 6.2 },
]

const chartConfig = {
  speaking: { label: 'Speaking', color: 'hsl(var(--primary))' },
  writing: { label: 'Writing', color: 'hsl(var(--accent))' },
}

export default function ProgressPage() {
  const { user } = useUser()
  const db = useFirestore()

  const writingQuery = useMemo(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'users', user.uid, 'writingHistory'),
      orderBy('createdAt', 'desc')
    )
  }, [db, user])

  const speakingQuery = useMemo(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'users', user.uid, 'speakingSessions'),
      orderBy('createdAt', 'desc')
    )
  }, [db, user])

  const { data: writingHistory, loading: writingLoading } = useCollection(writingQuery)
  const { data: speakingHistory, loading: speakingLoading } = useCollection(speakingQuery)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
      <Alert className="bg-blue-50/50 border-blue-200 text-blue-800 shadow-sm animate-in slide-in-from-top-2">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-xs font-bold uppercase tracking-tight">System Status: Demo Prototype</AlertTitle>
        <AlertDescription className="text-sm font-medium leading-relaxed opacity-90">
          This is a demo version for backend progress and system demonstration purposes only. Analytics and historical records are synchronized with your Firestore data.
        </AlertDescription>
      </Alert>

      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground">Tracking your journey across all English skills.</p>
      </header>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="stats" className="gap-2">
            <TrendingUp className="w-4 h-4" /> Performance
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" /> Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Writing Avg', value: writingHistory?.length ? '6.0' : '-', icon: PenTool, color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'Speaking Avg', value: speakingHistory?.length ? (speakingHistory[0]?.cefrLevel || 'Band 5') : '-', icon: Mic, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Recent CEFR', value: writingHistory?.[0]?.cefrLevel || speakingHistory?.[0]?.cefrLevel || '-', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' },
              { label: 'Activities', value: (writingHistory?.length || 0) + (speakingHistory?.length || 0), icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100' },
            ].map((stat) => (
              <Card key={stat.label} className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-md overflow-hidden relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Skill Performance Trends</CardTitle>
                  <CardDescription>Visualizing your improvement across core modules</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600">DEMO TRENDS</Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis domain={[0, 9]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="speaking" stroke="var(--color-speaking)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="writing" stroke="var(--color-writing)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-8 animate-in fade-in duration-500">
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <PenTool className="w-5 h-5 text-accent" /> Writing History
              </h2>
              <Badge variant="secondary">{writingHistory?.length || 0} Records</Badge>
            </div>
            <div className="space-y-3">
              {writingLoading ? (
                <div className="flex justify-center p-8"><Zap className="w-6 h-6 animate-spin text-primary" /></div>
              ) : writingHistory?.length ? (
                writingHistory.map((item) => (
                  <Link key={item.id} href={`/progress/history/${item.id}`}>
                    <Card className="hover:shadow-md transition-all border-none shadow-sm cursor-pointer group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <PenTool className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{item.mode}</p>
                            <h3 className="font-bold text-sm">{item.title || 'Essay Practice'}</h3>
                            <p className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">{item.userText}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-primary">{item.bandScore}</div>
                          <p className="text-[8px] text-muted-foreground uppercase">{format(new Date(item.createdAt), 'MMM d, h:mm a')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-xl">No writing attempts yet.</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mic className="w-5 h-5 text-primary" /> Speaking Sessions
              </h2>
              <Badge variant="secondary">{speakingHistory?.length || 0} Records</Badge>
            </div>
            <div className="space-y-3">
              {speakingLoading ? (
                <div className="flex justify-center p-8"><Zap className="w-6 h-6 animate-spin text-primary" /></div>
              ) : speakingHistory?.length ? (
                speakingHistory.map((item) => (
                  <Card key={item.id} className="border-none shadow-sm group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{item.mode}</p>
                          <h3 className="font-bold text-sm">{item.topic || 'Speaking Practice'}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[8px] py-0">{item.cefrLevel}</Badge>
                            <Badge variant="outline" className="text-[8px] py-0">{item.totalScore}/75</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-muted-foreground uppercase mb-1">{format(new Date(item.createdAt), 'MMM d, h:mm a')}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic p-4 border border-dashed rounded-xl">No speaking sessions yet.</p>
              )}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
