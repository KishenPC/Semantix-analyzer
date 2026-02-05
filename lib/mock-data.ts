import type { AnalysisResult } from './types'

export const SAMPLE_CODE = `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    return b`

export const SAMPLE_INPUT = '6'

export const MOCK_ANALYSIS: AnalysisResult = {
  executionTrace: [
    { line: 1, variables: { n: 6 }, callStack: ['fibonacci(6)'] },
    { line: 2, variables: { n: 6 }, callStack: ['fibonacci(6)'] },
    { line: 4, variables: { n: 6, a: 0, b: 1 }, callStack: ['fibonacci(6)'] },
    { line: 5, variables: { n: 6, a: 0, b: 1, i: 2 }, callStack: ['fibonacci(6)'] },
    { line: 6, variables: { n: 6, a: 1, b: 1, i: 2 }, callStack: ['fibonacci(6)'] },
    { line: 5, variables: { n: 6, a: 1, b: 1, i: 3 }, callStack: ['fibonacci(6)'] },
    { line: 6, variables: { n: 6, a: 1, b: 2, i: 3 }, callStack: ['fibonacci(6)'] },
    { line: 5, variables: { n: 6, a: 1, b: 2, i: 4 }, callStack: ['fibonacci(6)'] },
    { line: 6, variables: { n: 6, a: 2, b: 3, i: 4 }, callStack: ['fibonacci(6)'] },
    { line: 5, variables: { n: 6, a: 2, b: 3, i: 5 }, callStack: ['fibonacci(6)'] },
    { line: 6, variables: { n: 6, a: 3, b: 5, i: 5 }, callStack: ['fibonacci(6)'] },
    { line: 5, variables: { n: 6, a: 3, b: 5, i: 6 }, callStack: ['fibonacci(6)'] },
    { line: 6, variables: { n: 6, a: 5, b: 8, i: 6 }, callStack: ['fibonacci(6)'] },
    { line: 7, variables: { n: 6, a: 5, b: 8 }, output: '8', callStack: ['fibonacci(6)'] },
  ],
  loopInvariants: [
    {
      location: 'Line 5-6: for loop',
      invariant: 'a = fib(i-1), b = fib(i)',
      explanation: 'At the start of each iteration, a holds fib(i-1) and b holds fib(i), where fib(k) is the k-th Fibonacci number.',
    },
  ],
  recursiveInvariants: [],
  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      explanation: 'Best case O(1) when n <= 1. Otherwise, the loop runs n-1 times, giving O(n) time complexity.',
    },
    space: {
      complexity: 'O(1)',
      explanation: 'Only uses a constant number of variables (a, b, i) regardless of input size.',
    },
  },
}
