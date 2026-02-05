'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'

interface TimelineSliderProps {
  totalSteps: number
  currentStep: number
  onStepChange: (step: number) => void
  className?: string
}

export function TimelineSlider({
  totalSteps,
  currentStep,
  onStepChange,
  className,
}: TimelineSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const play = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      onStepChange(0)
    }
    setIsPlaying(true)
  }, [currentStep, totalSteps, onStepChange])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(false)
    onStepChange(0)
  }, [onStepChange])

  const stepForward = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1)
    }
  }, [currentStep, totalSteps, onStepChange])

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }, [currentStep, onStepChange])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onStepChange((prev: number) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 800)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, totalSteps, onStepChange])

  if (totalSteps === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4 bg-card/50 backdrop-blur-sm border border-border rounded-lg',
        className
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={reset}
          disabled={totalSteps === 0}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={stepBackward}
          disabled={currentStep === 0}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Previous step"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={isPlaying ? pause : play}
          disabled={totalSteps === 0}
          className={cn(
            'p-3 rounded-full transition-all duration-200',
            isPlaying
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary text-primary-foreground'
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button
          onClick={stepForward}
          disabled={currentStep >= totalSteps - 1}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          aria-label="Next step"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground font-mono w-8">{currentStep + 1}</span>
        <div className="relative flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-200"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStep}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-xs text-muted-foreground font-mono w-8 text-right">{totalSteps}</span>
      </div>
    </div>
  )
}
