"use client"

import { useRef, useEffect } from "react"

const KEYWORDS = ["def", "if", "for", "in", "return", "range", "import", "from", "class", "while", "else", "elif", "and", "or", "not", "True", "False", "None", "lambda", "try", "except", "finally", "with", "as", "yield", "break", "continue", "pass", "print", "int", "str", "float", "list", "dict", "len"]

function highlightLine(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let remaining = text
  let idx = 0

  while (remaining.length > 0) {
    // String literals
    const strMatch = remaining.match(/^(["'])(?:(?!\1).)*\1/)
    if (strMatch) {
      parts.push(<span key={idx++} className="text-success">{strMatch[0]}</span>)
      remaining = remaining.slice(strMatch[0].length)
      continue
    }

    // Comments
    if (remaining.startsWith("#")) {
      parts.push(<span key={idx++} className="text-muted-foreground italic">{remaining}</span>)
      break
    }

    // Numbers
    const numMatch = remaining.match(/^\b\d+(\.\d+)?\b/)
    if (numMatch) {
      parts.push(<span key={idx++} className="text-warning">{numMatch[0]}</span>)
      remaining = remaining.slice(numMatch[0].length)
      continue
    }

    // Keywords
    const kwMatch = remaining.match(/^\b([a-zA-Z_]\w*)\b/)
    if (kwMatch) {
      if (KEYWORDS.includes(kwMatch[1])) {
        parts.push(<span key={idx++} className="text-primary font-semibold">{kwMatch[1]}</span>)
      } else {
        parts.push(<span key={idx++} className="text-foreground">{kwMatch[1]}</span>)
      }
      remaining = remaining.slice(kwMatch[1].length)
      continue
    }

    // Operators and other chars
    parts.push(<span key={idx++} className="text-muted-foreground">{remaining[0]}</span>)
    remaining = remaining.slice(1)
  }

  return parts
}

interface CodeEditorProps {
  code: string
  onCodeChange: (code: string) => void
  activeLine?: number
}

export function CodeEditor({ code, onCodeChange, activeLine }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lines = code.split("\n")

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [code])

  return (
    <div className="flex flex-col h-full">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-surface-raised">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">main.py</span>
      </div>

      {/* Code display */}
      <div className="flex-1 overflow-auto">
        <div className="font-mono text-sm leading-6">
          {lines.map((line, i) => {
            const lineNum = i + 1
            const isActive = activeLine === lineNum
            return (
              <div
                key={i}
                className={`flex items-stretch transition-colors ${
                  isActive ? "bg-primary/10 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
                }`}
              >
                <div className={`w-12 shrink-0 text-right pr-3 py-0.5 select-none ${
                  isActive ? "text-primary" : "text-muted-foreground/50"
                }`}>
                  {lineNum}
                </div>
                <div className="py-0.5 pl-3 pr-4 whitespace-pre">
                  {highlightLine(line)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Editable textarea */}
      <div className="border-t border-border">
        <div className="px-4 py-2 bg-surface">
          <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Edit Code</label>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
            className="w-full bg-muted text-foreground text-sm font-mono p-3 rounded-lg border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
