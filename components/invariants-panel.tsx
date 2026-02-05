'use client'

import { cn } from '@/lib/utils'
import type { LoopInvariant, RecursionInvariant } from '@/lib/types'
import { Repeat, GitBranch } from 'lucide-react'

interface InvariantsPanelProps {
  loopInvariants: LoopInvariant[]
  recursionInvariants: RecursionInvariant[]
  className?: string
}

export function InvariantsPanel({
  loopInvariants,
  recursionInvariants,
  className,
}: InvariantsPanelProps) {
  const hasInvariants = loopInvariants.length > 0 || recursionInvariants.length > 0

  if (!hasInvariants) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-muted-foreground text-sm',
          className
        )}
      >
        No invariants detected
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Invariants
        </h3>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loopInvariants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Repeat className="w-4 h-4 text-primary" />
              Loop Invariants
            </div>
            {loopInvariants.map((inv, i) => (
              <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono bg-primary/20 text-primary rounded">
                    Line {inv.line}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{inv.invariant}</p>
              </div>
            ))}
          </div>
        )}

        {recursionInvariants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <GitBranch className="w-4 h-4 text-accent" />
              Recursion Invariants
            </div>
            {recursionInvariants.map((inv, i) => (
              <div key={i} className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-mono bg-accent/20 text-accent rounded">
                    {inv.functionName}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Base: </span>
                    <span className="text-foreground/90">{inv.baseCondition}</span>
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{inv.invariant}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
