export interface VariableState {
  [key: string]: number | string | boolean | null | number[] | string[]
}

export interface ExecutionStep {
  line: number
  variables: VariableState
  callStack?: string[]
}

export interface LoopInvariant {
  line: number
  invariant: string
}

export interface RecursionInvariant {
  functionName: string
  baseCondition: string
  invariant: string
}

export interface TimeComplexity {
  best: string
  average: string
  worst: string
  reasoning: string
}

export interface AnalysisResult {
  execution_trace: ExecutionStep[]
  loop_invariants: LoopInvariant[]
  recursion_invariants: RecursionInvariant[]
  time_complexity: TimeComplexity
  space_complexity: string
}

export type Language = 'cpp' | 'python' | 'java'

export interface AnalysisRequest {
  code: string
  input: string
  language: Language
}
