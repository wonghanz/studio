"use client"

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, BookOpen, PenTool, Headphones, Loader2, RefreshCcw } from 'lucide-react'
import { aiDailyTaskPlanner, type AiDailyTaskPlannerOutput } from '@/ai/flows/ai-daily-task-planner'

export default function DailyPlanPage() {
  const [plan, setPlan] = useState<AiDailyTaskPlannerOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])

  const fetchPlan = async () => {
    setLoading(true)
    try {
      const examType = (localStorage.getItem('native_exam_target') as 'MUET' | 'SPM') || 'SPM'
      const result = await aiDailyTaskPlanner({
        targetExam: examType,
        userProgressSummary: "The student has a decent vocabulary but struggles with fluency in speaking and logical flow in writing. Reading comprehension is strong."
      })
      setPlan(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [])

  const toggleTask = (index: number) => {
    setCompletedTasks(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'Speaking': return Mic
      case 'Writing': return PenTool
      case 'Reading': return BookOpen
      case 'Listening': return Headphones
      default: return BookOpen
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'Speaking': return 'text-primary'
      case 'Writing': return 'text-accent'
      case 'Reading': return 'text-blue-500'
      case 'Listening': return 'text-purple-500'
      default: return 'text-primary'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Crafting your personalized study path...</p>
      </div>
    )
  }

  const progressValue = plan ? (completedTasks.length / plan.dailyTasks.length) * 100 : 0

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Today's Goals</h1>
          <p className="text-muted-foreground">Tailored for your current progress.</p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchPlan}>
          <RefreshCcw className="w-5 h-5" />
        </Button>
      </header>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Overall Progress</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plan?.dailyTasks.map((task, index) => {
          const Icon = getIcon(task.type)
          const isCompleted = completedTasks.includes(index)
          return (
            <Card 
              key={index} 
              className={`border-none shadow-sm transition-all ${isCompleted ? 'opacity-60' : 'hover:translate-x-1'}`}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="pt-1">
                  <Checkbox 
                    checked={isCompleted} 
                    onCheckedChange={() => toggleTask(index)}
                    className="w-6 h-6 rounded-md"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${getColor(task.type)}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${getColor(task.type)}`}>
                        {task.type}
                      </span>
                    </div>
                    {task.durationMinutes && (
                      <Badge variant="outline" className="text-[10px]">{task.durationMinutes}m</Badge>
                    )}
                  </div>
                  <h3 className={`font-semibold ${isCompleted ? 'line-through' : ''}`}>
                    {task.description}
                  </h3>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {progressValue === 100 && (
        <div className="text-center p-8 bg-accent/10 rounded-2xl animate-in zoom-in duration-500">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-xl font-bold text-accent">Fantastic Work!</h3>
          <p className="text-muted-foreground text-sm">You've cleared all your goals for today. Your skills are growing!</p>
        </div>
      )}
    </div>
  )
}
