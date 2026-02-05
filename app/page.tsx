"use client"

import { useState } from "react"
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
} from "lucide-react"

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

const SAMPLE_CODE = `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    return b`

const SAMPLE_INPUT = "n = 6"

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
    { line: 7, variables: { n: 6, a: 5, b: 8 }, output: "8" },
  ],
  loopInvariants: [
    "b = fib(i) at the start of each iteration",
    "a = fib(i-1) at the start of each iteration",
    "2 <= i <= n+1 throughout the loop",
  ],
  recursiveInvariants: [],
  complexity: {
    time: {
      best: "O(1)",
      average: "O(n)",
      worst: "O(n)",
      explanation:
        "The loop runs n-1 times for n > 1, giving linear time complexity. For n <= 1, constant time.",
    },
    space: {
      value: "O(1)",
      explanation:
        "Only uses a constant number of variables (a, b, i) regardless of input size.",
    },
  },
}

function highlightPython(line: string): React.ReactNode[] {
  const keywords = [
    "def",
    "if",
    "for",
    "in",
    "return",
    "range",
    "import",
    "from",
    "class",
    "while",
    "else",
    "elif",
    "and",
    "or",
    "not",
    "True",
    "False",
    "None",
  ]
  const parts: React.ReactNode[] = []
  const regex = /(\s+)|(\b\d+\b)|('[^']*'|"[^"]*")|(\b\w+\b)|([^\s\w]+)/g
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(line)) !== null) {
    const token = match[0]
    key++
    if (match[1]) {
      parts.push(<span key={key}>{token}</span>)
    } else if (match[2]) {
      parts.push(
        <span key={key} style={{ color: "#f59e0b" }}>
          {token}
        </span>
      )
    } else if (match[3]) {
      parts.push(
        <span key={key} style={{ color: "#34d399" }}>
          {token}
        </span>
      )
    } else if (match[4]) {
      if (keywords.includes(token)) {
        parts.push(
          <span key={key} style={{ color: "#818cf8", fontWeight: 500 }}>
            {token}
          </span>
        )
      } else {
        parts.push(
          <span key={key} style={{ color: "#e4e4e7" }}>
            {token}
          </span>
        )
      }
    } else {
      parts.push(
        <span key={key} style={{ color: "#71717a" }}>
          {token}
        </span>
      )
    }
  }
  return parts
}

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

  const codeLines = code.split("\n")
  const currentTrace = result?.trace[currentStep]

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0f",
        color: "#e4e4e7",
        fontFamily: "'Geist', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #27272f",
          backgroundColor: "rgba(17,17,24,0.9)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap style={{ width: 16, height: 16, color: "#fff" }} />
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#e4e4e7",
                letterSpacing: "-0.01em",
              }}
            >
              Semantix
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#71717a",
                backgroundColor: "#1c1c27",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              beta
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={handleReset}
              style={{
                height: 32,
                padding: "0 12px",
                fontSize: 12,
                color: "#a1a1aa",
                backgroundColor: "transparent",
                border: "1px solid #27272f",
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RotateCcw style={{ width: 14, height: 14 }} />
              Reset
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{
                height: 32,
                padding: "0 16px",
                fontSize: 12,
                fontWeight: 500,
                color: "#fff",
                backgroundColor: isAnalyzing ? "#4f46e5" : "#6366f1",
                border: "none",
                borderRadius: 6,
                cursor: isAnalyzing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: isAnalyzing ? 0.7 : 1,
              }}
            >
              {isAnalyzing ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play style={{ width: 14, height: 14 }} />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Code Editor */}
          <section
            style={{
              borderRadius: 8,
              border: "1px solid #27272f",
              backgroundColor: "#111118",
              overflow: "hidden",
            }}
          >
            {/* Editor header */}
            <div
              style={{
                height: 40,
                padding: "0 16px",
                borderBottom: "1px solid #27272f",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(28,28,39,0.5)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "rgba(239,68,68,0.6)",
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "rgba(245,158,11,0.6)",
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "rgba(16,185,129,0.6)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#71717a",
                    fontFamily: "monospace",
                    marginLeft: 8,
                  }}
                >
                  main.py
                </span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "#71717a",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Python
              </span>
            </div>

            {/* Editor body */}
            <div style={{ position: "relative" }}>
              {/* Line numbers */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 44,
                  borderRight: "1px solid #27272f",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "right",
                  fontFamily: "monospace",
                  fontSize: 12,
                  paddingTop: 16,
                  paddingRight: 10,
                  userSelect: "none",
                  backgroundColor: "#111118",
                }}
              >
                {codeLines.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      color:
                        currentTrace?.line === i + 1
                          ? "#818cf8"
                          : "rgba(113,113,122,0.5)",
                      fontWeight: currentTrace?.line === i + 1 ? 600 : 400,
                      transition: "color 0.15s",
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Active line indicator */}
              {currentTrace && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    width: 2,
                    backgroundColor: "#6366f1",
                    transition: "top 0.2s",
                    top: (currentTrace.line - 1) * 24 + 16,
                    height: 24,
                  }}
                />
              )}

              {/* Highlighted code overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  fontFamily: "monospace",
                  fontSize: 14,
                  lineHeight: "24px",
                  padding: "16px 16px 16px 56px",
                  whiteSpace: "pre",
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                {codeLines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 2,
                      margin: "0 -8px",
                      padding: "0 8px",
                      backgroundColor:
                        currentTrace?.line === i + 1
                          ? "rgba(99,102,241,0.08)"
                          : "transparent",
                      transition: "background-color 0.15s",
                    }}
                  >
                    {highlightPython(line)}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                aria-label="Code editor"
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "transparent",
                  caretColor: "#e4e4e7",
                  fontFamily: "monospace",
                  fontSize: 14,
                  padding: "16px 16px 16px 56px",
                  minHeight: 220,
                  resize: "none",
                  border: "none",
                  outline: "none",
                  lineHeight: "24px",
                  position: "relative",
                  zIndex: 10,
                }}
              />
            </div>
          </section>

          {/* Input Panel */}
          <section
            style={{
              borderRadius: 8,
              border: "1px solid #27272f",
              backgroundColor: "#111118",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 40,
                padding: "0 16px",
                borderBottom: "1px solid #27272f",
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(28,28,39,0.5)",
              }}
            >
              <span
                style={{ fontSize: 12, color: "#71717a", fontFamily: "monospace" }}
              >
                Program Input
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input values..."
              spellCheck={false}
              aria-label="Program input"
              style={{
                width: "100%",
                backgroundColor: "transparent",
                color: "#e4e4e7",
                fontFamily: "monospace",
                fontSize: 14,
                padding: 16,
                minHeight: 60,
                resize: "none",
                border: "none",
                outline: "none",
              }}
            />
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!result ? (
            <section
              style={{
                borderRadius: 8,
                border: "1px solid #27272f",
                backgroundColor: "#111118",
                padding: 40,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: 340,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#1c1c27",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Cpu style={{ width: 24, height: 24, color: "#71717a" }} />
              </div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#e4e4e7",
                  marginBottom: 6,
                }}
              >
                Ready to Analyze
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "#71717a",
                  maxWidth: 220,
                  lineHeight: 1.6,
                }}
              >
                Click Analyze to trace execution, find loop invariants, and compute
                complexity.
              </p>
              <button
                onClick={handleAnalyze}
                style={{
                  marginTop: 24,
                  height: 32,
                  padding: "0 16px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#fff",
                  backgroundColor: "#6366f1",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Play style={{ width: 14, height: 14 }} />
                Analyze Code
              </button>
            </section>
          ) : (
            <>
              {/* Execution Trace */}
              <section
                style={{
                  borderRadius: 8,
                  border: "1px solid #27272f",
                  backgroundColor: "#111118",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleSection("trace")}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 16px",
                    borderBottom: "1px solid #27272f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "rgba(28,28,39,0.5)",
                    cursor: "pointer",
                    border: "none",
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid",
                    borderBottomColor: "#27272f",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#e4e4e7",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Clock style={{ width: 14, height: 14, color: "#6366f1" }} />
                    Execution Trace
                  </span>
                  {expandedSections.trace ? (
                    <ChevronDown
                      style={{ width: 14, height: 14, color: "#71717a" }}
                    />
                  ) : (
                    <ChevronRight
                      style={{ width: 14, height: 14, color: "#71717a" }}
                    />
                  )}
                </button>

                {expandedSections.trace && (
                  <div style={{ padding: 16 }}>
                    {/* Timeline controls */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                          onClick={() => setCurrentStep(0)}
                          aria-label="Go to first step"
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#a1a1aa",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          <SkipBack style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentStep(Math.max(0, currentStep - 1))
                          }
                          aria-label="Previous step"
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#a1a1aa",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            transform: "rotate(180deg)",
                          }}
                        >
                          <ArrowRight style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          aria-label={isPlaying ? "Pause" : "Play"}
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            backgroundColor: "#6366f1",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          {isPlaying ? (
                            <Pause style={{ width: 14, height: 14 }} />
                          ) : (
                            <Play style={{ width: 14, height: 14 }} />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setCurrentStep(
                              Math.min(result.trace.length - 1, currentStep + 1)
                            )
                          }
                          aria-label="Next step"
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#a1a1aa",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          <ArrowRight style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentStep(result.trace.length - 1)
                          }
                          aria-label="Go to last step"
                          style={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#a1a1aa",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          <SkipForward style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "monospace",
                          color: "#71717a",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {currentStep + 1} / {result.trace.length}
                      </span>
                    </div>

                    {/* Range slider */}
                    <input
                      type="range"
                      min={0}
                      max={result.trace.length - 1}
                      value={currentStep}
                      onChange={(e) => setCurrentStep(Number(e.target.value))}
                      aria-label="Step timeline"
                      style={{ width: "100%", accentColor: "#6366f1" }}
                    />

                    {/* Current line info */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        backgroundColor: "rgba(99,102,241,0.05)",
                        border: "1px solid rgba(99,102,241,0.1)",
                        borderRadius: 6,
                        marginTop: 12,
                      }}
                    >
                      <ArrowRight
                        style={{ width: 12, height: 12, color: "#6366f1" }}
                      />
                      <span style={{ fontSize: 12, color: "#a1a1aa" }}>
                        {"Executing line "}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "monospace",
                          color: "#818cf8",
                          fontWeight: 600,
                        }}
                      >
                        {currentTrace?.line}
                      </span>
                    </div>

                    {/* Variables table */}
                    {currentTrace && (
                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#71717a",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: 8,
                          }}
                        >
                          Variables
                        </div>
                        <div
                          style={{
                            borderRadius: 6,
                            border: "1px solid #27272f",
                            overflow: "hidden",
                          }}
                        >
                          {Object.entries(currentTrace.variables).map(
                            ([name, value], idx) => (
                              <div
                                key={name}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "6px 12px",
                                  borderBottom:
                                    idx <
                                    Object.entries(currentTrace.variables)
                                      .length -
                                      1
                                      ? "1px solid #27272f"
                                      : "none",
                                  backgroundColor:
                                    idx % 2 === 0
                                      ? "rgba(28,28,39,0.3)"
                                      : "transparent",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontFamily: "monospace",
                                    color: "#22d3ee",
                                  }}
                                >
                                  {name}
                                </span>
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontFamily: "monospace",
                                    color: "#f59e0b",
                                  }}
                                >
                                  {String(value)}
                                </span>
                              </div>
                            )
                          )}
                        </div>

                        {currentTrace.output && (
                          <div
                            style={{
                              marginTop: 8,
                              padding: "8px 12px",
                              borderRadius: 6,
                              backgroundColor: "rgba(16,185,129,0.08)",
                              border: "1px solid rgba(16,185,129,0.15)",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span style={{ fontSize: 12, color: "#34d399" }}>
                              {"Output: "}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontFamily: "monospace",
                                color: "#34d399",
                                fontWeight: 600,
                              }}
                            >
                              {currentTrace.output}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Loop Invariants */}
              <section
                style={{
                  borderRadius: 8,
                  border: "1px solid #27272f",
                  backgroundColor: "#111118",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleSection("invariants")}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "rgba(28,28,39,0.5)",
                    cursor: "pointer",
                    border: "none",
                    borderBottom: "1px solid #27272f",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#e4e4e7",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Cpu style={{ width: 14, height: 14, color: "#22d3ee" }} />
                    Loop Invariants
                  </span>
                  {expandedSections.invariants ? (
                    <ChevronDown
                      style={{ width: 14, height: 14, color: "#71717a" }}
                    />
                  ) : (
                    <ChevronRight
                      style={{ width: 14, height: 14, color: "#71717a" }}
                    />
                  )}
                </button>

                {expandedSections.invariants && (
                  <div
                    style={{
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {result.loopInvariants.map((inv, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          backgroundColor: "rgba(34,211,238,0.05)",
                          border: "1px solid rgba(34,211,238,0.1)",
                          fontSize: 12,
                          color: "#a1a1aa",
                          fontFamily: "monospace",
                          lineHeight: 1.5,
                        }}
                      >
                        {inv}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Complexity */}
              <section
                style={{
                  borderRadius: 8,
                  border: "1px solid #27272f",
                  backgroundColor: "#111118",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleSection("complexity")}
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "rgba(28,28,39,0.5)",
                    cursor: "pointer",
                    border: "none",
                    borderBottom: "1px solid #27272f",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#e4e4e7",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <HardDrive
                      style={{ width: 14, height: 14, color: "#f59e0b" }}
                    />
                    Complexity Analysis
                  </span>
                  {expandedSections.complexity ? (
                    <ChevronDown
                      style={{ width: 14, height: 14, color: "#71717a" }}
                    />
                  ) : (
                    <ChevronRight
                      style={{ width: 14, height: 14, color: "#71717a" }}
                    />
                  )}
                </button>

                {expandedSections.complexity && (
                  <div style={{ padding: 16 }}>
                    {/* Time Complexity */}
                    <div
                      style={{
                        fontSize: 11,
                        color: "#71717a",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 8,
                      }}
                    >
                      Time Complexity
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      {[
                        {
                          label: "Best",
                          value: result.complexity.time.best,
                          color: "#34d399",
                          bg: "rgba(16,185,129,0.08)",
                          border: "rgba(16,185,129,0.15)",
                        },
                        {
                          label: "Average",
                          value: result.complexity.time.average,
                          color: "#f59e0b",
                          bg: "rgba(245,158,11,0.08)",
                          border: "rgba(245,158,11,0.15)",
                        },
                        {
                          label: "Worst",
                          value: result.complexity.time.worst,
                          color: "#ef4444",
                          bg: "rgba(239,68,68,0.08)",
                          border: "rgba(239,68,68,0.15)",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            padding: 12,
                            borderRadius: 6,
                            backgroundColor: item.bg,
                            border: `1px solid ${item.border}`,
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              color: "#71717a",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              marginBottom: 4,
                            }}
                          >
                            {item.label}
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              fontFamily: "monospace",
                              color: item.color,
                            }}
                          >
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#71717a",
                        lineHeight: 1.6,
                        marginBottom: 16,
                      }}
                    >
                      {result.complexity.time.explanation}
                    </p>

                    {/* Space Complexity */}
                    <div
                      style={{
                        fontSize: 11,
                        color: "#71717a",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 8,
                      }}
                    >
                      Space Complexity
                    </div>
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 6,
                        backgroundColor: "rgba(99,102,241,0.05)",
                        border: "1px solid rgba(99,102,241,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          fontFamily: "monospace",
                          color: "#818cf8",
                        }}
                      >
                        {result.complexity.space.value}
                      </span>
                      <span
                        style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}
                      >
                        {result.complexity.space.explanation}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
