export interface TraceStep {
  line: number
  variables: Record<string, string | number | boolean>
  output?: string
}

export interface AnalysisResult {
  trace: TraceStep[]
  loopInvariants: string[]
  recursiveInvariants: string[]
  complexity: {
    time: {
      best: string
      average: string
      worst: string
      explanation: string
    }
    space: {
      value: string
      explanation: string
    }
  }
}
