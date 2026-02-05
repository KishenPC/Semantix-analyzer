'use client'

import { useState } from 'react'
import {
  Play,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Clock,
  Cpu,
  HardDrive,
} from 'lucide-react'

// Types
interface TraceStep {
  line: number
  variables: Record<string, string | number>
  output?: string
}

interface AnalysisResult {
  trace: TraceStep[]
  loopInvariants: string[]
  recursiveInvariants: string[]
  complexity: {
    time: { best: string; average: string; worst: string; explanation: string }
    space: { value: string; explanation: string }
  }
}

// Sample data
const SAMPLE_CODE = `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    return b`

const SAMPLE_INPUT = 'n = 6'

const MOCK_RESULT: AnalysisResult = {
  trace: [
    { line: 1, variables: { n: 6 } },
    { line: 2, variables: { n: 6 } },
    { line: 4, variables: { n: 6, a: 0, b: 1 } },
    { line: 5, variables: { n: 6, a: 0, b: 1, i: 2 } },
    { line: 6, variables: { n: 6, a: 1, b: 1, i: 2 } },
    { line: 5, variables: { n: 6, a: 1, b: 1, i: 3 } },
    { line: 6, variables: { n: 6, a: 1, b: 2, i: 3 } },
    { line: 5, variables: { n: 6, a: 1, b: 2, i: 4 } },
    { line: 6, variables: { n: 6, a: 2, b: 3, i: 4 } },
    { line: 5, variables: { n: 6, a: 2, b: 3, i: 5 } },
    { line: 6, variables: { n: 6, a: 3, b: 5, i: 5 } },
    { line: 5, variables: { n: 6, a: 3, b: 5, i: 6 } },
    { line: 6, variables: { n: 6, a: 5, b: 8, i: 6 } },
    { line: 7, variables: { n: 6, a: 5, b: 8 }, output: '8' },
  ],
  loopInvariants: [
    'b = fib(i) at the start of each iteration',
    'a = fib(i-1) at the start of each iteration',
    '2 <= i <= n+1 throughout the loop',
  ],
  recursiveInvariants: [],
  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      explanation: 'The loop runs n-1 times for n > 1, giving linear time complexity.',
    },
    space: {
      value: 'O(1)',
      explanation: 'Only uses a constant number of variables regardless of input size.',
    },
  },
}

export default function Semantix() {
  const [code, setCode] = useState(SAMPLE_CODE)
  const [input, setInput] = useState(SAMPLE_INPUT)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    trace: true,
    invariants: true,
    complexity: true,
  })

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setResult(MOCK_RESULT)
    setCurrentStep(0)
    setIsAnalyzing(false)
  }

  const handleReset = () => {
    setResult(null)
    setCurrentStep(0)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const codeLines = code.split('\n')
  const currentTrace = result?.trace[currentStep]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">Semantix</h1>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Beta</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Code Editor */}
          <div className="space-y-4">
            {/* Code Editor */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">Code</span>
                <span className="text-xs text-zinc-500">Python</span>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-zinc-900 border-r border-zinc-800 flex flex-col text-right text-xs text-zinc-600 font-mono pt-4 pr-3">
                  {codeLines.map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 flex items-center justify-end ${
                        currentTrace?.line === i + 1 ? 'text-violet-400 font-bold' : ''
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-transparent text-zinc-100 font-mono text-sm p-4 pl-16 min-h-[200px] resize-none focus:outline-none leading-6"
                  spellCheck={false}
                  style={{
                    background: currentTrace
                      ? `linear-gradient(to bottom, 
                          transparent ${(currentTrace.line - 1) * 24}px, 
                          rgba(139, 92, 246, 0.1) ${(currentTrace.line - 1) * 24}px, 
                          rgba(139, 92, 246, 0.1) ${currentTrace.line * 24}px, 
                          transparent ${currentTrace.line * 24}px)`
                      : undefined,
                  }}
                />
              </div>
            </div>

            {/* Input Panel */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-medium text-zinc-300">Program Input</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-transparent text-zinc-100 font-mono text-sm p-4 min-h-[80px] resize-none focus:outline-none"
                placeholder="Enter input values..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="space-y-4">
            {!result ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                  <Cpu className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Ready to Analyze</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Click the Analyze button to trace execution, find invariants, and compute complexity.
                </p>
              </div>
            ) : (
              <>
                {/* Execution Trace */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <button
                    onClick={() => toggleSection('trace')}
                    className="w-full px-4 py-3 border-b border-zinc-800 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-violet-400" />
                      Execution Trace
                    </span>
                    {expandedSections.trace ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                  {expandedSections.trace && (
                    <div className="p-4">
                      {/* Timeline Slider */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                          <span>Step {currentStep + 1}</span>
                          <span>{result.trace.length} total</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={result.trace.length - 1}
                          value={currentStep}
                          onChange={(e) => setCurrentStep(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                      </div>
                      {/* Variables */}
                      <div className="space-y-2">
                        <span className="text-xs text-zinc-500 uppercase tracking-wide">Variables</span>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(currentTrace?.variables || {}).map(([key, value]) => (
                            <div
                              key={key}
                              className="px-3 py-2 bg-zinc-800 rounded-lg flex items-center justify-between"
                            >
                              <span className="text-sm font-mono text-cyan-400">{key}</span>
                              <span className="text-sm font-mono text-zinc-300">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                        {currentTrace?.output && (
                          <div className="mt-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <span className="text-xs text-emerald-400">Output: </span>
                            <span className="text-sm font-mono text-emerald-300">{currentTrace.output}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Loop Invariants */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <button
                    onClick={() => toggleSection('invariants')}
                    className="w-full px-4 py-3 border-b border-zinc-800 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-cyan-400" />
                      Loop Invariants
                    </span>
                    {expandedSections.invariants ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                  {expandedSections.invariants && (
                    <div className="p-4 space-y-2">
                      {result.loopInvariants.map((inv, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 bg-zinc-800 rounded-lg text-sm text-zinc-300 font-mono"
                        >
                          {inv}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Complexity Analysis */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  <button
                    onClick={() => toggleSection('complexity')}
                    className="w-full px-4 py-3 border-b border-zinc-800 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-emerald-400" />
                      Complexity Analysis
                    </span>
                    {expandedSections.complexity ? (
                      <ChevronDown className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </button>
                  {expandedSections.complexity && (
                    <div className="p-4 space-y-4">
                      {/* Time Complexity */}
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Time Complexity</div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="px-3 py-2 bg-zinc-800 rounded-lg text-center">
                            <div className="text-xs text-zinc-500 mb-1">Best</div>
                            <div className="text-sm font-mono text-emerald-400">{result.complexity.time.best}</div>
                          </div>
                          <div className="px-3 py-2 bg-zinc-800 rounded-lg text-center">
                            <div className="text-xs text-zinc-500 mb-1">Average</div>
                            <div className="text-sm font-mono text-yellow-400">{result.complexity.time.average}</div>
                          </div>
                          <div className="px-3 py-2 bg-zinc-800 rounded-lg text-center">
                            <div className="text-xs text-zinc-500 mb-1">Worst</div>
                            <div className="text-sm font-mono text-red-400">{result.complexity.time.worst}</div>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500">{result.complexity.time.explanation}</p>
                      </div>
                      {/* Space Complexity */}
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Space Complexity</div>
                        <div className="px-3 py-2 bg-zinc-800 rounded-lg inline-block">
                          <span className="text-sm font-mono text-violet-400">{result.complexity.space.value}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">{result.complexity.space.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
