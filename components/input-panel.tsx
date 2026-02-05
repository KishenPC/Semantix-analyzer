'use client'

import { cn } from '@/lib/utils'

interface InputPanelProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function InputPanel({ value, onChange, className }: InputPanelProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <label className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
        Program Input
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'flex-1 min-h-[100px] resize-none rounded-lg border border-border bg-muted/50 px-3 py-2',
          'font-mono text-sm text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'transition-all duration-200'
        )}
        placeholder="Enter program input (e.g., arr = [1, 2, 3])"
        spellCheck={false}
      />
    </div>
  )
}
