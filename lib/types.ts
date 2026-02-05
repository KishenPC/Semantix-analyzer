export interface ExecutionStep {
  line: number
  variables: Record<string, string | number | boolean | null>
  output?: string
  callStack?: string[]
}

export interface LoopInvariant {
  location: string
  invariant: string
  explanation: string
}

export interface RecursiveInvariant {
  function: string
  baseCase: string
  recursiveCase: string
  explanation: string
}

export interface ComplexityAnalysis {
  time: {
    best: string
    average: string
    worst: string
    explanation: string
  }
  space: {
    complexity: string
    explanation: string
  }
}

export interface AnalysisResult {
  executionTrace: ExecutionStep[]
  loopInvariants: LoopInvariant[]
  recursiveInvariants: RecursiveInvariant[]
  complexity: ComplexityAnalysis
}

export type Language = 'python' | 'javascript' | 'java' | 'cpp'
