'use client'

import { cn } from '@/lib/utils'
import type { TimeComplexity } from '@/lib/types'
import { Clock, HardDrive } from 'lucide-react'

interface ComplexityPanelProps {
  timeComplexity: TimeComplexity | null
  spaceComplexity: string | null
  className?: string
}

export function ComplexityPanel({
  timeComplexity,
  spaceComplexity,
  className,
}: ComplexityPanelProps) {
  if (!timeComplexity && !spaceComplexity) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-muted-foreground text-sm',
          className
        )}
      >
        Run analysis to see complexity
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Complexity Analysis
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {timeComplexity && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Time Complexity
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <div className="text-xs text-muted-foreground mb-1">Best</div>
                <div className="text-lg font-mono font-semibold text-chart-3">
                  {timeComplexity.best}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <div className="text-xs text-muted-foreground mb-1">Average</div>
                <div className="text-lg font-mono font-semibold text-primary">
                  {timeComplexity.average}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <div className="text-xs text-muted-foreground mb-1">Worst</div>
                <div className="text-lg font-mono font-semibold text-destructive">
                  {timeComplexity.worst}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                Reasoning
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {timeComplexity.reasoning}
              </p>
            </div>
          </div>
        )}

        {spaceComplexity && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <HardDrive className="w-4 h-4 text-accent" />
              Space Complexity
            </div>

            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm text-foreground/90 leading-relaxed">{spaceComplexity}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
