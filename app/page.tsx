'use client'

import { useState, useCallback } from 'react'
import { Header } from '@/components/header'
import { CodeEditor } from '@/components/code-editor'
import { InputPanel } from '@/components/input-panel'
import { LanguageSelector } from '@/components/language-selector'
import { TraceViewer } from '@/components/trace-viewer'
import { TimelineSlider } from '@/components/timeline-slider'
import { CallStack } from '@/components/call-stack'
import { InvariantsPanel } from '@/components/invariants-panel'
import { ComplexityPanel } from '@/components/complexity-panel'
import { SAMPLE_CODE, SAMPLE_INPUT } from '@/lib/mock-data'
import type { Language, AnalysisResult } from '@/lib/types'
import { Play, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabId = 'trace' | 'invariants' | 'complexity'

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

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input, language, useMockData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

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
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col border-r border-border min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/30">
            <LanguageSelector value={language} onChange={setLanguage} />

            <div className="flex items-center gap-2">
              <button
                onClick={() => runAnalysis(true)}
                disabled={isAnalyzing || !code.trim()}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'border border-border bg-secondary text-secondary-foreground',
                  'hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Sparkles className="w-4 h-4" />
                Demo
              </button>

              <button
                onClick={() => runAnalysis(false)}
                disabled={isAnalyzing || !code.trim()}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'bg-primary text-primary-foreground shadow-[0_0_15px_var(--glow)]',
                  'hover:shadow-[0_0_25px_var(--glow)] disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            <div className="flex-1 min-h-0">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                activeLine={activeLine}
                className="h-full"
              />
            </div>

            <InputPanel
              value={input}
              onChange={setInput}
              className="flex-shrink-0"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-4 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="flex-1 flex flex-col min-w-0 lg:max-w-[45%]">
          {/* Tab Navigation */}
          <div className="flex items-center px-4 py-2 border-b border-border bg-card/30">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'trace' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-hidden">
                  <TraceViewer
                    steps={analysis?.execution_trace || []}
                    currentStep={currentStep}
                    className="h-full"
                  />
                </div>

                {analysis && analysis.execution_trace.length > 0 && (
                  <>
                    <div className="border-t border-border">
                      <TimelineSlider
                        totalSteps={analysis.execution_trace.length}
                        currentStep={currentStep}
                        onStepChange={setCurrentStep}
                        className="rounded-none border-0"
                      />
                    </div>

                    <div className="border-t border-border max-h-48 overflow-auto">
                      <CallStack stack={currentCallStack} />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'invariants' && (
              <InvariantsPanel
                loopInvariants={analysis?.loop_invariants || []}
                recursionInvariants={analysis?.recursion_invariants || []}
                className="h-full"
              />
            )}

            {activeTab === 'complexity' && (
              <ComplexityPanel
                timeComplexity={analysis?.time_complexity || null}
                spaceComplexity={analysis?.space_complexity || null}
                className="h-full"
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
