
"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Award, Target, Zap, Info, ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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
  const hasData = chartData.length > 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Formal Demo Declaration Banner */}
      <Alert className="bg-blue-50/50 border-blue-200 text-blue-800 shadow-sm animate-in slide-in-from-top-2">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-xs font-bold uppercase tracking-tight">System Status: Demo Prototype</AlertTitle>
        <AlertDescription className="text-sm font-medium leading-relaxed opacity-90">
          This application is currently operating as a demonstration prototype. Backend services and analytics are under active development, and the statistics shown are for demonstration purposes only.
        </AlertDescription>
      </Alert>

      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Learning Progress</h1>
        <p className="text-muted-foreground">Tracking your journey to proficiency.</p>
      </header>

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
          {hasData ? (
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
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
               <TrendingUp className="w-12 h-12 text-muted-foreground" />
               <p className="font-medium">No data yet – complete your first task to see progress</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Weakness Profile</h2>
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-6">
              {[
                { label: 'Grammar', score: 65, color: 'bg-red-400' },
                { label: 'Coherence', score: 85, color: 'bg-green-400' },
                { label: 'Vocabulary', score: 70, color: 'bg-yellow-400' },
                { label: 'Fluency', score: 90, color: 'bg-blue-400' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{item.label}</span>
                    <span className="opacity-60">{item.score}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Recent Achievements</h2>
          <div className="space-y-2">
            {[
              { title: 'Consistency King', date: 'Yesterday', icon: '🔥' },
              { title: 'Fluent Speaker', date: '2 days ago', icon: '🗣️' },
              { title: 'Essay Master', date: 'Oct 12', icon: '✍️' },
            ].map((ach) => (
              <Card key={ach.title} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{ach.title}</p>
                      <p className="text-[10px] text-muted-foreground">{ach.date}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Earned</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
