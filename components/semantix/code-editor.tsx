'use client'

import { useRef, useEffect } from 'react'
import type { Language } from '@/lib/types'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  language: Language
  onLanguageChange: (lang: Language) => void
  activeLine?: number
  input: string
  onInputChange: (input: string) => void
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
]

export function CodeEditor({
  code,
  onChange,
  language,
  onLanguageChange,
  activeLine,
  input,
  onInputChange,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lines = code.split('\n')

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [code])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-sm font-medium text-zinc-400">Code</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="flex font-mono text-sm">
          <div className="flex-shrink-0 select-none text-right pr-4 pt-4 pb-4 text-zinc-600 bg-zinc-900/30 border-r border-zinc-800">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`px-2 leading-6 ${
                  activeLine === i + 1 ? 'text-cyan-400 bg-cyan-500/10' : ''
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 pt-4 pb-4 pointer-events-none">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`px-4 leading-6 ${
                    activeLine === i + 1
                      ? 'bg-gradient-to-r from-violet-500/20 to-transparent border-l-2 border-violet-500'
                      : ''
                  }`}
                >
                  <span className="invisible whitespace-pre">{line || ' '}</span>
                </div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onChange(e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[300px] bg-transparent text-zinc-100 px-4 pt-4 pb-4 leading-6 resize-none focus:outline-none font-mono"
              style={{ caretColor: '#a78bfa' }}
            />
          </div>
        </div>
      </div>
      
      <div className="border-t border-zinc-800">
        <div className="px-4 py-2 bg-zinc-900/50">
          <span className="text-sm font-medium text-zinc-400">Program Input</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter program input (one value per line)..."
          className="w-full h-20 bg-zinc-900/30 text-zinc-100 px-4 py-2 text-sm font-mono resize-none focus:outline-none placeholder-zinc-600"
        />
      </div>
    </div>
  )
}
