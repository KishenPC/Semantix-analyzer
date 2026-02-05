"use client"

import { SkipBack, SkipForward, Play, Pause } from "lucide-react"
import type { TraceStep } from "../../lib/types"

interface TracePanelProps {
  trace: TraceStep[]
  currentStep: number
  onStepChange: (step: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
}

export function TracePanel({ trace, currentStep, onStepChange, isPlaying, onTogglePlay }: TracePanelProps) {
  const step = trace[currentStep]
  if (!step) return null

  const variables = Object.entries(step.variables)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-raised">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Execution Trace</span>
        <span className="text-xs text-muted-foreground font-mono">
          Step {currentStep + 1} of {trace.length}
        </span>
      </div>

      {/* Playback controls */}
      <div className="px-4 py-3 border-b border-border bg-surface flex items-center gap-3">
        <button
          type="button"
          onClick={() => onStepChange(0)}
          className="p-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-border transition-colors"
          aria-label="Go to start"
        >
          <SkipBack size={14} />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          type="button"
          onClick={() => onStepChange(trace.length - 1)}
          className="p-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-border transition-colors"
          aria-label="Go to end"
        >
          <SkipForward size={14} />
        </button>

        <input
          type="range"
          min={0}
          max={trace.length - 1}
          value={currentStep}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="flex-1 cursor-pointer"
        />
      </div>

      {/* Current line indicator */}
      <div className="px-4 py-2.5 border-b border-border bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Executing line <span className="text-primary font-semibold font-mono">{step.line}</span>
          </span>
          {step.output && (
            <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">
              Output: {step.output}
            </span>
          )}
        </div>
      </div>

      {/* Variables table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Variable</th>
              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
            </tr>
          </thead>
          <tbody>
            {variables.map(([name, value]) => (
              <tr key={name} className="border-b border-border/50 hover:bg-surface-raised transition-colors">
                <td className="px-4 py-2 font-mono text-accent">{name}</td>
                <td className="px-4 py-2 font-mono text-warning">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
