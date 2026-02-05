'use client'

import { cn } from '@/lib/utils'

interface CallStackProps {
  stack: string[]
  className?: string
}

export function CallStack({ stack, className }: CallStackProps) {
  if (!stack || stack.length === 0) {
    return (
      <div className={cn('p-4 text-center text-muted-foreground text-sm', className)}>
        No active call stack
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Call Stack
        </h3>
      </div>
      <div className="p-4">
        <div className="flex flex-col-reverse gap-1">
          {stack.map((frame, i) => (
            <div
              key={i}
              className={cn(
                'relative px-3 py-2 rounded-md font-mono text-sm transition-all duration-200',
                i === stack.length - 1
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-muted/50 text-muted-foreground border border-border'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{stack.length - i}</span>
                <span>{frame}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
