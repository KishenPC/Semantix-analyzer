'use client'

import React from "react"

import { useCallback, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  activeLine?: number
  readOnly?: boolean
  className?: string
}

export function CodeEditor({
  value,
  onChange,
  language,
  activeLine,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [lineCount, setLineCount] = useState(1)

  const updateLineNumbers = useCallback(() => {
    const lines = value.split('\n').length
    setLineCount(lines)
  }, [value])

  useEffect(() => {
    updateLineNumbers()
  }, [updateLineNumbers])

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const start = e.currentTarget.selectionStart
        const end = e.currentTarget.selectionEnd
        const newValue = value.substring(0, start) + '    ' + value.substring(end)
        onChange(newValue)
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4
          }
        }, 0)
      }
    },
    [value, onChange]
  )

  return (
    <div className={cn('relative flex h-full overflow-hidden rounded-lg bg-muted/50 border border-border', className)}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 overflow-hidden select-none bg-muted/30 border-r border-border"
        style={{ width: '3.5rem' }}
      >
        <div className="py-3 px-2 font-mono text-xs text-muted-foreground text-right">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-6 leading-6 transition-all duration-200',
                activeLine === i + 1 && 'text-primary font-semibold bg-line-active rounded-sm'
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Code area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Highlight overlay for active line */}
        {activeLine && (
          <div
            className="absolute left-0 right-0 h-6 bg-line-active border-l-2 border-primary pointer-events-none transition-all duration-200"
            style={{
              top: `${(activeLine - 1) * 24 + 12}px`,
              boxShadow: '0 0 20px var(--glow)',
            }}
          />
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          className={cn(
            'absolute inset-0 w-full h-full resize-none bg-transparent py-3 px-4',
            'font-mono text-sm leading-6 text-foreground',
            'focus:outline-none focus:ring-0',
            'placeholder:text-muted-foreground',
            readOnly && 'cursor-default'
          )}
          placeholder={`// Enter your ${language} code here...`}
        />
      </div>
    </div>
  )
}
