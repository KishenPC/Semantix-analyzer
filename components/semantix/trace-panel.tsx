'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExecutionStep } from '@/lib/types'

interface TracePanelProps {
  trace: ExecutionStep[]
  currentStep: number
  onStepChange: (step: number) => void
}

export function TracePanel({ trace, currentStep, onStepChange }: TracePanelProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const step = trace[currentStep]
  
  if (!step) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        <p>Run analysis to see execution trace</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-sm font-medium text-zinc-400">Execution Trace</span>
        <span className="text-xs text-zinc-500">
          Step {currentStep + 1} of {trace.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-sm font-medium text-zinc-300">Line {step.line}</span>
          </div>
          
          <div className="space-y-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Variables</span>
            <div className="grid gap-2">
              {Object.entries(step.variables).map(([name, value]) => (
                <div
                  key={name}
                  className="flex items-center justify-between bg-zinc-800/50 rounded px-3 py-2"
                >
                  <span className="text-sm font-mono text-violet-400">{name}</span>
                  <span className="text-sm font-mono text-cyan-400">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
          
          {step.output && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Output</span>
              <div className="mt-2 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
                <span className="text-sm font-mono text-emerald-400">{step.output}</span>
              </div>
            </div>
          )}
        </div>
        
        {step.callStack && step.callStack.length > 0 && (
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">Call Stack</span>
            </div>
            <div className="space-y-1">
              {step.callStack.map((call, i) => (
                <div
                  key={i}
                  className={`text-sm font-mono px-3 py-1.5 rounded ${
                    i === 0
                      ? 'bg-violet-500/20 text-violet-300 border-l-2 border-violet-500'
                      : 'text-zinc-500 pl-5'
                  }`}
                >
                  {call}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStepChange(0)}
            disabled={currentStep === 0}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStepChange(Math.min(trace.length - 1, currentStep + 1))}
            disabled={currentStep === trace.length - 1}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStepChange(trace.length - 1)}
            disabled={currentStep === trace.length - 1}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-200"
              style={{ width: `${((currentStep + 1) / trace.length) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={trace.length - 1}
            value={currentStep}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
