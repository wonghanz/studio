
"use client"

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, Award, Target, Zap, Info, ShieldAlert, History, Calendar, ChevronRight } from 'lucide-react'
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

  const historyQuery = useMemo(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'users', user.uid, 'writingHistory'),
      orderBy('createdAt', 'desc')
    )
  }, [db, user])

  const { data: history, loading: historyLoading } = useCollection(historyQuery)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
      <Alert className="bg-blue-50/50 border-blue-200 text-blue-800 shadow-sm animate-in slide-in-from-top-2">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-xs font-bold uppercase tracking-tight">System Status: Demo Prototype</AlertTitle>
        <AlertDescription className="text-sm font-medium leading-relaxed opacity-90">
          This application is currently operating as a demonstration prototype. Backend services and analytics are under active development, and the statistics shown are for demonstration purposes only.
        </AlertDescription>
      </Alert>

      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground">Tracking your journey to proficiency.</p>
      </header>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="stats" className="gap-2">
            <TrendingUp className="w-4 h-4" /> Stats
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" /> Your Charts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Current Band', value: '6.5', icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Writing Avg', value: '6.0', icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'Speaking Avg', value: '6.5', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-100' },
              { label: 'Daily Streak', value: '12 Days', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
            ].map((stat) => (
              <Card key={stat.label} className="border-none shadow-sm">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
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
                  <CardDescription>Estimated band scores over the past 7 days</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600">MOCK DATA</Badge>
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

        <TabsContent value="history" className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-4">
             <div>
               <h2 className="text-xl font-bold">Writing History Log</h2>
               <p className="text-xs text-muted-foreground">Review your past attempts and AI feedback.</p>
             </div>
             <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 border-blue-200">
               {history?.length || 0} Records
             </Badge>
          </div>

          {historyLoading ? (
            <div className="flex justify-center p-12">
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((attempt) => (
                <Link key={attempt.id} href={`/progress/history/${attempt.id}`}>
                  <Card className="hover:shadow-md transition-all border-none shadow-sm cursor-pointer group active:scale-[0.99]">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <History className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="secondary" className="text-[8px] uppercase px-1.5 py-0">
                            {attempt.mode}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {attempt.createdAt ? format(new Date(attempt.createdAt), 'MMM d, h:mm a') : 'Recent'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm truncate">{attempt.title || 'Practice Essay'}</h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 italic">
                          {attempt.userText}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-lg font-black text-primary">{attempt.bandScore}</div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed py-16 flex flex-col items-center justify-center space-y-4 opacity-50">
              <History className="w-12 h-12 text-muted-foreground" />
              <div className="text-center">
                <p className="font-bold">No history yet</p>
                <p className="text-xs">Complete a writing task to start your log.</p>
              </div>
              <Link href="/writing">
                <Button variant="outline" size="sm">Go to Writing Mode</Button>
              </Link>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
