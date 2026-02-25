
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { ChevronRight, ArrowRight } from 'lucide-react'

const slides = [
  {
    title: "Speaking AI Examiner",
    description: "Get instant examiner-style feedback on your speech with band scores and fluency tips.",
    image: PlaceHolderImages[1].imageUrl,
    hint: "speaking analysis"
  },
  {
    title: "Writing Offline Drafts",
    description: "Practice writing even without internet. Your drafts sync automatically when you're back online.",
    image: PlaceHolderImages[2].imageUrl,
    hint: "writing essay"
  },
  {
    title: "Daily Diary Stories",
    description: "Learn through engaging stories. Track your progress daily with personalized study plans.",
    image: PlaceHolderImages[3].imageUrl,
    hint: "reading book"
  }
]

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      localStorage.setItem('native_onboarded', 'true')
      router.push('/intro')
    }
  }

  return (
    <div className="flex flex-col min-h-screen p-6 max-w-md mx-auto justify-center space-y-8">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-500">
        <Image
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          fill
          className="object-cover"
          data-ai-hint={slides[currentSlide].hint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h2>
          <p className="text-sm opacity-90">{slides[currentSlide].description}</p>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="flex gap-4">
        {currentSlide > 0 && (
          <Button variant="outline" onClick={() => setCurrentSlide(currentSlide - 1)} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleNext} className="flex-1 group">
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
