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
  Zap,
  ArrowRight,
  SkipBack,
  SkipForward,
  Pause,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
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
      explanation:
        'The loop runs n-1 times for n > 1, giving linear time complexity. For n <= 1, constant time.',
    },
    space: {
      value: 'O(1)',
      explanation:
        'Only uses a constant number of variables (a, b, i) regardless of input size.',
    },
  },
}

// ---------------------------------------------------------------------------
// Syntax highlighting (simple keyword-based)
// ---------------------------------------------------------------------------
function highlightPython(line: string): React.ReactNode[] {
  const keywords = ['def', 'if', 'for', 'in', 'return', 'range', 'import', 'from', 'class', 'while', 'else', 'elif', 'and', 'or', 'not', 'True', 'False', 'None']
  const parts: React.ReactNode[] = []
  // Match tokens: words, numbers, strings, operators, whitespace
  const regex = /(\s+)|(\b\d+\b)|('[^']*'|"[^"]*")|(\b\w+\b)|([^\s\w]+)/g
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(line)) !== null) {
    const token = match[0]
    key++
    if (match[1]) {
      // whitespace
      parts.push(<span key={key}>{token}</span>)
    } else if (match[2]) {
      // number
      parts.push(
        <span key={key} className="text-amber-400">
          {token}
        </span>
      )
    } else if (match[3]) {
      // string
      parts.push(
        <span key={key} className="text-emerald-400">
          {token}
        </span>
      )
    } else if (match[4]) {
      if (keywords.includes(token)) {
        parts.push(
          <span key={key} className="text-primary font-medium">
            {token}
          </span>
        )
      } else if (token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase()) {
        parts.push(
          <span key={key} className="text-accent">
            {token}
          </span>
        )
      } else {
        parts.push(
          <span key={key} className="text-foreground">
            {token}
          </span>
        )
      }
    } else {
      parts.push(
        <span key={key} className="text-muted-foreground">
          {token}
        </span>
      )
    }
  }

  return parts
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function Semantix() {
  const [code, setCode] = useState(SAMPLE_CODE)
  const [input, setInput] = useState(SAMPLE_INPUT)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    trace: true,
    invariants: true,
    complexity: true,
  })

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setResult(MOCK_RESULT)
    setCurrentStep(0)
    setIsAnalyzing(false)
  }

  const handleReset = () => {
    setResult(null)
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const codeLines = code.split('\n')
  const currentTrace = result?.trace[currentStep]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Semantix
            </span>
            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
              beta
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground bg-transparent hover:bg-secondary rounded-md transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="h-8 px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Main content */}
      {/* ----------------------------------------------------------------- */}
      <main className="max-w-[1440px] mx-auto px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
          {/* ============================================================= */}
          {/* LEFT: Code Editor + Input  (3 cols) */}
          {/* ============================================================= */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Code Editor */}
            <section className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="h-10 px-4 border-b border-border flex items-center justify-between bg-secondary/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono ml-2">main.py</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Python</span>
              </div>

              <div className="relative">
                {/* Highlighted code overlay (read-only visual) */}
                <div
                  className="absolute inset-0 pointer-events-none font-mono text-sm leading-6 p-4 pl-14 whitespace-pre overflow-hidden"
                  aria-hidden="true"
                >
                  {codeLines.map((line, i) => (
                    <div
                      key={i}
                      className={`h-6 flex items-center rounded-sm -mx-2 px-2 transition-colors ${
                        currentTrace?.line === i + 1
                          ? 'bg-primary/10'
                          : ''
                      }`}
                    >
                      {highlightPython(line)}
                    </div>
                  ))}
                </div>

                {/* Line numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-11 border-r border-border flex flex-col text-right font-mono text-xs pt-4 pr-2.5 select-none bg-card">
                  {codeLines.map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 flex items-center justify-end transition-colors ${
                        currentTrace?.line === i + 1
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Active line indicator */}
                {currentTrace && (
                  <div
                    className="absolute left-0 w-0.5 bg-primary transition-all duration-200"
                    style={{
                      top: `${(currentTrace.line - 1) * 24 + 16}px`,
                      height: '24px',
                    }}
                  />
                )}

                {/* Textarea (invisible, captures input) */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-transparent text-transparent caret-foreground font-mono text-sm p-4 pl-14 min-h-[220px] resize-none focus:outline-none leading-6 relative z-10"
                  spellCheck={false}
                  aria-label="Code editor"
                />
              </div>
            </section>

            {/* Input Panel */}
            <section className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="h-10 px-4 border-b border-border flex items-center bg-secondary/50">
                <span className="text-xs text-muted-foreground font-mono">Program Input</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-transparent text-foreground font-mono text-sm p-4 min-h-[60px] resize-none focus:outline-none"
                placeholder="Enter input values..."
                spellCheck={false}
                aria-label="Program input"
              />
            </section>
          </div>

          {/* ============================================================= */}
          {/* RIGHT: Analysis Results  (2 cols) */}
          {/* ============================================================= */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {!result ? (
              /* Empty state */
              <section className="rounded-lg border border-border bg-card p-10 flex flex-col items-center justify-center text-center min-h-[340px]">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1.5">Ready to Analyze</h3>
                <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
                  Click Analyze to trace execution, find loop invariants, and compute complexity.
                </p>
                <button
                  onClick={handleAnalyze}
                  className="mt-6 h-8 px-4 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Analyze Code</span>
                </button>
              </section>
            ) : (
              <>
                {/* --------------------------------------------------------- */}
                {/* Execution Trace */}
                {/* --------------------------------------------------------- */}
                <section className="rounded-lg border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleSection('trace')}
                    className="w-full h-10 px-4 border-b border-border flex items-center justify-between bg-secondary/50 hover:bg-secondary/80 transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Execution Trace
                    </span>
                    {expandedSections.trace ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedSections.trace && (
                    <div className="p-4 space-y-4">
                      {/* Timeline controls */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCurrentStep(0)}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                              aria-label="Go to first step"
                            >
                              <SkipBack className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors rotate-180"
                              aria-label="Previous step"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="w-7 h-7 flex items-center justify-center text-primary-foreground bg-primary hover:bg-primary/90 rounded transition-colors"
                              aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                              {isPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setCurrentStep(
                                  Math.min(result.trace.length - 1, currentStep + 1)
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                              aria-label="Next step"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setCurrentStep(result.trace.length - 1)
                              }
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                              aria-label="Go to last step"
                            >
                              <SkipForward className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                            {currentStep + 1} / {result.trace.length}
                          </span>
                        </div>

                        <input
                          type="range"
                          min={0}
                          max={result.trace.length - 1}
                          value={currentStep}
                          onChange={(e) => setCurrentStep(Number(e.target.value))}
                          className="w-full"
                          aria-label="Step timeline"
                        />

                        {/* Step markers */}
                        <div className="flex justify-between mt-1">
                          {result.trace.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentStep(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                i === currentStep
                                  ? 'bg-primary'
                                  : i < currentStep
                                    ? 'bg-primary/40'
                                    : 'bg-border'
                              }`}
                              aria-label={`Step ${i + 1}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Line indicator */}
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md">
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <span className="text-xs text-muted-foreground">Executing line</span>
                        <span className="text-xs font-mono font-semibold text-primary">
                          {currentTrace?.line}
                        </span>
                      </div>

                      {/* Variables table */}
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                          Variables
                        </div>
                        <div className="rounded-md border border-border overflow-hidden">
                          <div className="grid grid-cols-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium bg-secondary/50 px-3 py-1.5">
                            <span>Name</span>
                            <span className="text-right">Value</span>
                          </div>
                          {Object.entries(currentTrace?.variables || {}).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="grid grid-cols-2 px-3 py-2 border-t border-border hover:bg-secondary/30 transition-colors"
                              >
                                <span className="text-xs font-mono text-accent font-medium">
                                  {key}
                                </span>
                                <span className="text-xs font-mono text-foreground text-right tabular-nums">
                                  {String(value)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Output */}
                      {currentTrace?.output && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider font-medium">
                            Return
                          </span>
                          <span className="text-sm font-mono font-semibold text-emerald-400 ml-auto">
                            {currentTrace.output}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* --------------------------------------------------------- */}
                {/* Loop Invariants */}
                {/* --------------------------------------------------------- */}
                <section className="rounded-lg border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleSection('invariants')}
                    className="w-full h-10 px-4 border-b border-border flex items-center justify-between bg-secondary/50 hover:bg-secondary/80 transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-accent" />
                      Loop Invariants
                    </span>
                    {expandedSections.invariants ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedSections.invariants && (
                    <div className="p-4 space-y-2">
                      {result.loopInvariants.map((inv, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 px-3 py-2.5 bg-secondary/40 rounded-md"
                        >
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                            I{i + 1}
                          </span>
                          <span className="text-xs text-foreground/80 font-mono leading-relaxed">
                            {inv}
                          </span>
                        </div>
                      ))}
                      {result.recursiveInvariants.length > 0 && (
                        <>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium pt-2">
                            Recursive Invariants
                          </div>
                          {result.recursiveInvariants.map((inv, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 px-3 py-2.5 bg-secondary/40 rounded-md"
                            >
                              <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                                R{i + 1}
                              </span>
                              <span className="text-xs text-foreground/80 font-mono leading-relaxed">
                                {inv}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </section>

                {/* --------------------------------------------------------- */}
                {/* Complexity Analysis */}
                {/* --------------------------------------------------------- */}
                <section className="rounded-lg border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleSection('complexity')}
                    className="w-full h-10 px-4 border-b border-border flex items-center justify-between bg-secondary/50 hover:bg-secondary/80 transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground flex items-center gap-2">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      Complexity Analysis
                    </span>
                    {expandedSections.complexity ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>

                  {expandedSections.complexity && (
                    <div className="p-4 space-y-5">
                      {/* Time complexity */}
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2.5">
                          Time Complexity
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {[
                            {
                              label: 'Best',
                              value: result.complexity.time.best,
                              color: 'text-emerald-400',
                              bg: 'bg-emerald-400/5 border-emerald-400/10',
                            },
                            {
                              label: 'Average',
                              value: result.complexity.time.average,
                              color: 'text-amber-400',
                              bg: 'bg-amber-400/5 border-amber-400/10',
                            },
                            {
                              label: 'Worst',
                              value: result.complexity.time.worst,
                              color: 'text-destructive',
                              bg: 'bg-destructive/5 border-destructive/10',
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`px-3 py-2.5 rounded-md border text-center ${item.bg}`}
                            >
                              <div className="text-[10px] text-muted-foreground mb-1">
                                {item.label}
                              </div>
                              <div
                                className={`text-sm font-mono font-semibold ${item.color}`}
                              >
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {result.complexity.time.explanation}
                        </p>
                      </div>

                      {/* Space complexity */}
                      <div className="pt-2 border-t border-border">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2.5">
                          Space Complexity
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="px-3 py-2.5 rounded-md border bg-primary/5 border-primary/10">
                            <div className="text-sm font-mono font-semibold text-primary">
                              {result.complexity.space.value}
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {result.complexity.space.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
