'use client'

import { cn } from '@/lib/utils'
import type { ExecutionStep, VariableState } from '@/lib/types'

interface TraceViewerProps {
  steps: ExecutionStep[]
  currentStep: number
  className?: string
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`
  }
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  return String(value)
}

function VariableDisplay({ variables }: { variables: VariableState }) {
  const entries = Object.entries(variables)
  if (entries.length === 0) return <span className="text-muted-foreground">No variables</span>

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 text-xs font-mono"
        >
          <span className="text-accent">{key}</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-foreground">{formatValue(value)}</span>
        </span>
      ))}
    </div>
  )
}

export function TraceViewer({ steps, currentStep, className }: TraceViewerProps) {
  if (steps.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-muted-foreground text-sm',
          className
        )}
      >
        Run analysis to see execution trace
      </div>
    )
  }

  const step = steps[currentStep]
  if (!step) return null

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Execution Trace
        </h3>
        <span className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={cn(
                'p-3 rounded-lg border transition-all duration-200',
                i === currentStep
                  ? 'bg-primary/10 border-primary'
                  : i < currentStep
                    ? 'bg-muted/30 border-border opacity-60'
                    : 'bg-muted/20 border-border/50 opacity-40'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                    i === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  {i + 1}
                </span>
                <span className="text-sm">
                  <span className="text-muted-foreground">Line</span>{' '}
                  <span className="text-foreground font-semibold">{s.line}</span>
                </span>
                {s.callStack && s.callStack.length > 0 && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {s.callStack.join(' > ')}
                  </span>
                )}
              </div>
              <VariableDisplay variables={s.variables} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
