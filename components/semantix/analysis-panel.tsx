'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Repeat, Clock, HardDrive } from 'lucide-react'
import type { LoopInvariant, RecursiveInvariant, ComplexityAnalysis } from '@/lib/types'

interface AnalysisPanelProps {
  loopInvariants: LoopInvariant[]
  recursiveInvariants: RecursiveInvariant[]
  complexity: ComplexityAnalysis | null
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        )}
        <Icon className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium text-zinc-300">{title}</span>
      </button>
      {isOpen && <div className="p-4 bg-zinc-900/30">{children}</div>}
    </div>
  )
}

export function AnalysisPanel({
  loopInvariants,
  recursiveInvariants,
  complexity,
}: AnalysisPanelProps) {
  const hasContent = loopInvariants.length > 0 || recursiveInvariants.length > 0 || complexity

  if (!hasContent) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        <p>Run analysis to see invariants and complexity</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-sm font-medium text-zinc-400">Analysis Results</span>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loopInvariants.length > 0 && (
          <CollapsibleSection title="Loop Invariants" icon={Repeat}>
            <div className="space-y-3">
              {loopInvariants.map((inv, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-xs text-zinc-500">{inv.location}</div>
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded px-3 py-2">
                    <code className="text-sm text-violet-300 font-mono">{inv.invariant}</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{inv.explanation}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
        
        {recursiveInvariants.length > 0 && (
          <CollapsibleSection title="Recursive Invariants" icon={Repeat}>
            <div className="space-y-3">
              {recursiveInvariants.map((inv, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-xs text-zinc-500">{inv.function}</div>
                  <div className="space-y-2">
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded px-3 py-2">
                      <span className="text-xs text-cyan-400">Base Case:</span>
                      <code className="block text-sm text-cyan-300 font-mono mt-1">{inv.baseCase}</code>
                    </div>
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded px-3 py-2">
                      <span className="text-xs text-violet-400">Recursive Case:</span>
                      <code className="block text-sm text-violet-300 font-mono mt-1">{inv.recursiveCase}</code>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{inv.explanation}</p>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}
        
        {complexity && (
          <>
            <CollapsibleSection title="Time Complexity" icon={Clock}>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-3 text-center">
                    <div className="text-xs text-emerald-400 mb-1">Best</div>
                    <div className="text-lg font-mono text-emerald-300">{complexity.time.best}</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 text-center">
                    <div className="text-xs text-amber-400 mb-1">Average</div>
                    <div className="text-lg font-mono text-amber-300">{complexity.time.average}</div>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded p-3 text-center">
                    <div className="text-xs text-rose-400 mb-1">Worst</div>
                    <div className="text-lg font-mono text-rose-300">{complexity.time.worst}</div>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{complexity.time.explanation}</p>
              </div>
            </CollapsibleSection>
            
            <CollapsibleSection title="Space Complexity" icon={HardDrive}>
              <div className="space-y-3">
                <div className="bg-violet-500/10 border border-violet-500/20 rounded p-3 text-center">
                  <div className="text-2xl font-mono text-violet-300">{complexity.space.complexity}</div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{complexity.space.explanation}</p>
              </div>
            </CollapsibleSection>
          </>
        )}
      </div>
    </div>
  )
}
