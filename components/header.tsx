'use client'

import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm', className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 border border-primary/30">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">TraceLab</h1>
          <p className="text-xs text-muted-foreground">AI-Powered Code Analysis</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2 py-1 text-xs font-medium text-accent bg-accent/10 rounded-md border border-accent/30">
          Beta
        </span>
      </div>
    </header>
  )
}
