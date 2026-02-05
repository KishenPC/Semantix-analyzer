'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Play, Loader2, Sparkles, Pause, SkipBack, SkipForward, RotateCcw, Repeat, GitBranch, Clock, HardDrive } from 'lucide-react'

// Types
interface VariableState {
  [key: string]: number | string | boolean | null | number[] | string[]
}

interface ExecutionStep {
  line: number
  variables: VariableState
  callStack?: string[]
}

interface LoopInvariant {
  line: number
  invariant: string
}

interface RecursionInvariant {
  functionName: string
  baseCondition: string
  invariant: string
}

interface TimeComplexity {
  best: string
  average: string
  worst: string
  reasoning: string
}

interface AnalysisResult {
  execution_trace: ExecutionStep[]
  loop_invariants: LoopInvariant[]
  recursion_invariants: RecursionInvariant[]
  time_complexity: TimeComplexity
  space_complexity: string
}

type Language = 'cpp' | 'python' | 'java'
type TabId = 'trace' | 'invariants' | 'complexity'

// Sample Data
const SAMPLE_CODE = `#include <iostream>
using namespace std;

int sumArray(int arr[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum;
}

int main() {
    int arr[] = {1, 2, 3, 4, 5};
    int n = 5;
    int result = sumArray(arr, n);
    cout << "Sum: " << result << endl;
    return 0;
}`

const SAMPLE_INPUT = `arr = [1, 2, 3, 4, 5]
n = 5`

const MOCK_ANALYSIS: AnalysisResult = {
  execution_trace: [
    { line: 13, variables: { arr: [1, 2, 3, 4, 5], n: 5 }, callStack: ['main'] },
    { line: 14, variables: { arr: [1, 2, 3, 4, 5], n: 5 }, callStack: ['main'] },
    { line: 5, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 0 }, callStack: ['main', 'sumArray'] },
    { line: 6, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 0, i: 0 }, callStack: ['main', 'sumArray'] },
    { line: 7, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 1, i: 0 }, callStack: ['main', 'sumArray'] },
    { line: 6, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 1, i: 1 }, callStack: ['main', 'sumArray'] },
    { line: 7, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 3, i: 1 }, callStack: ['main', 'sumArray'] },
    { line: 6, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 3, i: 2 }, callStack: ['main', 'sumArray'] },
    { line: 7, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 6, i: 2 }, callStack: ['main', 'sumArray'] },
    { line: 6, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 6, i: 3 }, callStack: ['main', 'sumArray'] },
    { line: 7, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 10, i: 3 }, callStack: ['main', 'sumArray'] },
    { line: 6, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 10, i: 4 }, callStack: ['main', 'sumArray'] },
    { line: 7, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 15, i: 4 }, callStack: ['main', 'sumArray'] },
    { line: 9, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 15, i: 5 }, callStack: ['main', 'sumArray'] },
    { line: 15, variables: { arr: [1, 2, 3, 4, 5], n: 5, result: 15 }, callStack: ['main'] },
    { line: 16, variables: { arr: [1, 2, 3, 4, 5], n: 5, result: 15 }, callStack: ['main'] },
    { line: 17, variables: { arr: [1, 2, 3, 4, 5], n: 5, result: 15 }, callStack: ['main'] },
  ],
  loop_invariants: [
    {
      line: 6,
      invariant: 'At the start of each iteration, sum equals the sum of elements arr[0] through arr[i-1]. When i = 0, sum = 0 (empty sum). This invariant is maintained because each iteration adds arr[i] to sum before incrementing i.',
    },
  ],
  recursion_invariants: [],
  time_complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    reasoning: 'The function iterates through all n elements exactly once, performing constant-time operations (addition and assignment) in each iteration.',
  },
  space_complexity: 'O(1) auxiliary space. The function uses only three local variables regardless of input size.',
}

// Utility function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// Header Component
function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30">
          <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Semantix</h1>
          <p className="text-xs text-zinc-400">AI-Powered Code Analysis</p>
        </div>
      </div>
      <span className="px-2 py-1 text-xs font-medium text-cyan-400 bg-cyan-400/10 rounded-md border border-cyan-400/30">Beta</span>
    </header>
  )
}

// Code Editor Component
function CodeEditor({ value, onChange, language, activeLine }: {
  value: string
  onChange: (value: string) => void
  language: string
  activeLine?: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const lines = value.split('\n')

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }, [])

  return (
    <div className="relative flex h-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
      <div ref={lineNumbersRef} className="flex-shrink-0 overflow-hidden select-none bg-zinc-900/50 border-r border-zinc-800" style={{ width: '3.5rem' }}>
        <div className="py-3 px-2 font-mono text-xs text-zinc-500 text-right">
          {lines.map((_, i) => (
            <div key={i} className={cn('h-6 leading-6', activeLine === i + 1 && 'text-violet-400 font-semibold')}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {activeLine && (
          <div className="absolute left-0 right-0 h-6 bg-violet-500/10 border-l-2 border-violet-500 pointer-events-none" style={{ top: `${(activeLine - 1) * 24 + 12}px` }} />
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          className="absolute inset-0 w-full h-full resize-none bg-transparent py-3 px-4 font-mono text-sm leading-6 text-zinc-100 focus:outline-none placeholder:text-zinc-600"
          placeholder={`// Enter your ${language} code here...`}
        />
      </div>
    </div>
  )
}

// Input Panel Component
function InputPanel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Program Input</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        placeholder="Enter program input (e.g., arr = [1, 2, 3])"
        spellCheck={false}
      />
    </div>
  )
}

// Language Selector Component
function LanguageSelector({ value, onChange }: { value: Language; onChange: (value: Language) => void }) {
  const languages: { value: Language; label: string }[] = [
    { value: 'cpp', label: 'C++' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
      {languages.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onChange(lang.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            value === lang.value ? 'bg-violet-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

// Trace Viewer Component
function TraceViewer({ steps, currentStep }: { steps: ExecutionStep[]; currentStep: number }) {
  if (steps.length === 0) {
    return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">Run analysis to see execution trace</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Execution Trace</h3>
        <span className="text-xs text-zinc-500">Step {currentStep + 1} of {steps.length}</span>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {steps.map((s, i) => (
          <div
            key={i}
            className={cn(
              'p-3 rounded-lg border transition-all',
              i === currentStep ? 'bg-violet-500/10 border-violet-500' : i < currentStep ? 'bg-zinc-900/50 border-zinc-800 opacity-60' : 'bg-zinc-900/30 border-zinc-800/50 opacity-40'
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className={cn('flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium', i === currentStep ? 'bg-violet-500 text-white' : 'bg-zinc-800 text-zinc-400')}>
                {i + 1}
              </span>
              <span className="text-sm"><span className="text-zinc-500">Line</span> <span className="text-white font-semibold">{s.line}</span></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(s.variables).map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-xs font-mono">
                  <span className="text-cyan-400">{key}</span>
                  <span className="text-zinc-500">=</span>
                  <span className="text-zinc-300">{Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Timeline Slider Component
function TimelineSlider({ totalSteps, currentStep, onStepChange }: { totalSteps: number; currentStep: number; onStepChange: (step: number) => void }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onStepChange(currentStep >= totalSteps - 1 ? (setIsPlaying(false), currentStep) : currentStep + 1)
      }, 800)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isPlaying, currentStep, totalSteps, onStepChange])

  if (totalSteps === 0) return null

  return (
    <div className="flex flex-col gap-3 p-4 bg-zinc-900/50 border-t border-zinc-800">
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => { setIsPlaying(false); onStepChange(0) }} className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"><RotateCcw className="w-4 h-4" /></button>
        <button onClick={() => currentStep > 0 && onStepChange(currentStep - 1)} disabled={currentStep === 0} className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"><SkipBack className="w-4 h-4" /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className={cn('p-3 rounded-full', isPlaying ? 'bg-cyan-500 text-white' : 'bg-violet-500 text-white')}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={() => currentStep < totalSteps - 1 && onStepChange(currentStep + 1)} disabled={currentStep >= totalSteps - 1} className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-50"><SkipForward className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 font-mono w-8">{currentStep + 1}</span>
        <div className="relative flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-violet-500 rounded-full transition-all" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
          <input type="range" min={0} max={totalSteps - 1} value={currentStep} onChange={(e) => onStepChange(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <span className="text-xs text-zinc-500 font-mono w-8 text-right">{totalSteps}</span>
      </div>
    </div>
  )
}

// Call Stack Component
function CallStack({ stack }: { stack: string[] }) {
  if (!stack || stack.length === 0) return <div className="p-4 text-center text-zinc-500 text-sm">No active call stack</div>

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Call Stack</h3>
      </div>
      <div className="p-4 flex flex-col-reverse gap-1">
        {stack.map((frame, i) => (
          <div key={i} className={cn('px-3 py-2 rounded-md font-mono text-sm', i === stack.length - 1 ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'bg-zinc-800 text-zinc-400 border border-zinc-700')}>
            <span className="text-xs text-zinc-500 mr-2">{stack.length - i}</span>
            {frame}
          </div>
        ))}
      </div>
    </div>
  )
}

// Invariants Panel Component
function InvariantsPanel({ loopInvariants, recursionInvariants }: { loopInvariants: LoopInvariant[]; recursionInvariants: RecursionInvariant[] }) {
  if (loopInvariants.length === 0 && recursionInvariants.length === 0) {
    return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">No invariants detected</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Invariants</h3>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {loopInvariants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white"><Repeat className="w-4 h-4 text-violet-400" /> Loop Invariants</div>
            {loopInvariants.map((inv, i) => (
              <div key={i} className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                <span className="px-2 py-0.5 text-xs font-mono bg-violet-500/20 text-violet-300 rounded mb-2 inline-block">Line {inv.line}</span>
                <p className="text-sm text-zinc-300 leading-relaxed">{inv.invariant}</p>
              </div>
            ))}
          </div>
        )}
        {recursionInvariants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white"><GitBranch className="w-4 h-4 text-cyan-400" /> Recursion Invariants</div>
            {recursionInvariants.map((inv, i) => (
              <div key={i} className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                <span className="px-2 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-300 rounded mb-2 inline-block">{inv.functionName}</span>
                <div className="text-sm"><span className="text-zinc-500">Base: </span><span className="text-zinc-300">{inv.baseCondition}</span></div>
                <p className="text-sm text-zinc-300 leading-relaxed mt-1">{inv.invariant}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Complexity Panel Component
function ComplexityPanel({ timeComplexity, spaceComplexity }: { timeComplexity: TimeComplexity | null; spaceComplexity: string | null }) {
  if (!timeComplexity && !spaceComplexity) {
    return <div className="flex items-center justify-center h-full text-zinc-500 text-sm">Run analysis to see complexity</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Complexity Analysis</h3>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {timeComplexity && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white"><Clock className="w-4 h-4 text-violet-400" /> Time Complexity</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <div className="text-xs text-zinc-500 mb-1">Best</div>
                <div className="text-lg font-mono font-semibold text-green-400">{timeComplexity.best}</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <div className="text-xs text-zinc-500 mb-1">Average</div>
                <div className="text-lg font-mono font-semibold text-violet-400">{timeComplexity.average}</div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                <div className="text-xs text-zinc-500 mb-1">Worst</div>
                <div className="text-lg font-mono font-semibold text-red-400">{timeComplexity.worst}</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">Reasoning</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{timeComplexity.reasoning}</p>
            </div>
          </div>
        )}
        {spaceComplexity && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white"><HardDrive className="w-4 h-4 text-cyan-400" /> Space Complexity</div>
            <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-sm text-zinc-300 leading-relaxed">{spaceComplexity}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Page Component
export default function Semantix() {
  const [code, setCode] = useState(SAMPLE_CODE)
  const [input, setInput] = useState(SAMPLE_INPUT)
  const [language, setLanguage] = useState<Language>('cpp')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState<TabId>('trace')
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = useCallback(async (useMockData = false) => {
    setIsAnalyzing(true)
    setError(null)
    setCurrentStep(0)

    if (useMockData) {
      setTimeout(() => {
        setAnalysis(MOCK_ANALYSIS)
        setIsAnalyzing(false)
      }, 500)
      return
    }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input, language }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setAnalysis(null)
    } finally {
      setIsAnalyzing(false)
    }
  }, [code, input, language])

  const activeLine = analysis?.execution_trace[currentStep]?.line
  const currentCallStack = analysis?.execution_trace[currentStep]?.callStack || []
  const tabs: { id: TabId; label: string }[] = [
    { id: 'trace', label: 'Trace' },
    { id: 'invariants', label: 'Invariants' },
    { id: 'complexity', label: 'Complexity' },
  ]

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col border-r border-zinc-800 min-w-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
            <LanguageSelector value={language} onChange={setLanguage} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => runAnalysis(true)}
                disabled={isAnalyzing || !code.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                Demo
              </button>
              <button
                onClick={() => runAnalysis(false)}
                disabled={isAnalyzing || !code.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-violet-500 text-white hover:bg-violet-400 disabled:opacity-50 shadow-lg shadow-violet-500/25"
              >
                {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Play className="w-4 h-4" />Analyze</>}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            <div className="flex-1 min-h-0">
              <CodeEditor value={code} onChange={setCode} language={language} activeLine={activeLine} />
            </div>
            <InputPanel value={input} onChange={setInput} />
          </div>

          {error && (
            <div className="mx-4 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="flex-1 flex flex-col min-w-0 lg:max-w-[45%]">
          <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    activeTab === tab.id ? 'bg-violet-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'trace' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-hidden">
                  <TraceViewer steps={analysis?.execution_trace || []} currentStep={currentStep} />
                </div>
                {analysis && analysis.execution_trace.length > 0 && (
                  <>
                    <TimelineSlider totalSteps={analysis.execution_trace.length} currentStep={currentStep} onStepChange={setCurrentStep} />
                    <div className="border-t border-zinc-800 max-h-48 overflow-auto">
                      <CallStack stack={currentCallStack} />
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === 'invariants' && <InvariantsPanel loopInvariants={analysis?.loop_invariants || []} recursionInvariants={analysis?.recursion_invariants || []} />}
            {activeTab === 'complexity' && <ComplexityPanel timeComplexity={analysis?.time_complexity || null} spaceComplexity={analysis?.space_complexity || null} />}
          </div>
        </div>
      </main>
    </div>
  )
}
