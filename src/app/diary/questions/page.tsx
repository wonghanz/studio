
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, ChevronLeft, CheckCircle2, XCircle, Trophy } from 'lucide-react'
import { aiReadingComprehension, type AiReadingComprehensionOutput } from '@/ai/flows/ai-reading-comprehension'

export default function DiaryQuestionsPage() {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<AiReadingComprehensionOutput['questions']>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  const storyText = `Deep within the heart of the Belum-Temengor Forest Complex, the morning mist clings to the giant Tualang trees like a heavy blanket. It was here that I first understood the true meaning of silence—not the absence of noise, but the presence of life waiting to be heard. As a conservationist, my daily entries often record the sightings of rare hornbills or the distant calls of gibbons, but today was different. I found tracks of the Malayan tiger near the riverbank. They were fresh, etched clearly into the soft mud. The locals say the tiger is a spirit of the forest, a guardian of the balance. In my diary, I wrote: "We are but visitors in this ancient realm, and our survival depends on how well we listen to its secrets."`

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const examType = (localStorage.getItem('native_exam_target') as 'SPM' | 'MUET') || 'SPM'
        const result = await aiReadingComprehension({ storyText, examType })
        setQuestions(result.questions)
      } catch (error) {
        console.error("Failed to load questions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleNext = () => {
    if (selectedAnswer === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1)
    }
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Generating comprehension questions...</p>
      </div>
    )
  }

  if (quizComplete) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-8 animate-in zoom-in duration-500">
        <Card className="border-none shadow-2xl text-center p-8 bg-white">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-muted-foreground mb-8">You've finished the comprehension check for "The Silent Forest".</p>
          
          <div className="bg-secondary/20 rounded-2xl p-6 mb-8">
            <div className="text-5xl font-black text-primary mb-2">{score} / {questions.length}</div>
            <p className="font-medium text-sm text-primary">Your Final Score</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/diary">
              <Button className="w-full h-12 text-lg">Back to Story</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full h-12">Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const progressValue = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/diary">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progressValue)}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </header>

      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl leading-relaxed">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <RadioGroup 
            value={selectedAnswer || ""} 
            onValueChange={setSelectedAnswer}
            disabled={showResult}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, i) => {
              const isCorrect = option === currentQuestion.correctAnswer
              const isSelected = option === selectedAnswer
              
              let cardStyles = "border-2 border-muted"
              if (showResult) {
                if (isCorrect) cardStyles = "border-accent bg-accent/5"
                else if (isSelected) cardStyles = "border-destructive bg-destructive/5"
              } else if (isSelected) {
                cardStyles = "border-primary bg-primary/5 shadow-sm"
              }

              return (
                <div key={i} className={`relative flex items-center rounded-2xl p-4 transition-all ${cardStyles}`}>
                  <RadioGroupItem value={option} id={`opt-${i}`} className="sr-only" />
                  <Label 
                    htmlFor={`opt-${i}`} 
                    className="flex-1 cursor-pointer font-medium text-base"
                  >
                    {option}
                  </Label>
                  {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-accent ml-2" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive ml-2" />}
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
        
        {showResult && (
          <div className="px-8 pb-4 animate-in slide-in-from-bottom-2">
            <div className="bg-muted/30 rounded-xl p-4 text-sm">
              <p className="font-bold text-primary mb-1">Explanation:</p>
              <p className="text-muted-foreground italic">{currentQuestion.explanation}</p>
            </div>
          </div>
        )}

        <CardFooter className="p-8 pt-4">
          {!showResult ? (
            <Button 
              className="w-full h-12" 
              disabled={!selectedAnswer}
              onClick={() => setShowResult(true)}
            >
              Check Answer
            </Button>
          ) : (
            <Button className="w-full h-12" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
