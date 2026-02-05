'use client'

import { Play, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onAnalyze: () => void
  onDemo: () => void
  isAnalyzing: boolean
}

export function Header({ onAnalyze, onDemo, isAnalyzing }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-white tracking-tight">Semantix</h1>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">AI Code Analyzer</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDemo}
          disabled={isAnalyzing}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          Demo
        </Button>
        <Button
          size="sm"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
