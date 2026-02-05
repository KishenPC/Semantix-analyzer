'use client'

import { cn } from '@/lib/utils'
import type { Language } from '@/lib/types'

interface LanguageSelectorProps {
  value: Language
  onChange: (value: Language) => void
  className?: string
}

const languages: { value: Language; label: string; icon: string }[] = [
  { value: 'cpp', label: 'C++', icon: 'C++' },
  { value: 'python', label: 'Python', icon: 'Py' },
  { value: 'java', label: 'Java', icon: 'Ja' },
]

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border', className)}>
      {languages.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onChange(lang.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
            'hover:bg-secondary',
            value === lang.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
