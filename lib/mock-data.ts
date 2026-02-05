import type { AnalysisResult } from './types'

export const SAMPLE_CODE = `#include <iostream>
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

export const SAMPLE_INPUT = `arr = [1, 2, 3, 4, 5]
n = 5`

export const MOCK_ANALYSIS: AnalysisResult = {
  execution_trace: [
    { line: 13, variables: { arr: [1, 2, 3, 4, 5], n: 5 }, callStack: ['main'] },
    { line: 14, variables: { arr: [1, 2, 3, 4, 5], n: 5 }, callStack: ['main'] },
    { line: 5, variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 0 }, callStack: ['main', 'sumArray'] },
    {
      line: 6,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 0, i: 0 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 7,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 1, i: 0 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 6,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 1, i: 1 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 7,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 3, i: 1 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 6,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 3, i: 2 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 7,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 6, i: 2 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 6,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 6, i: 3 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 7,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 10, i: 3 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 6,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 10, i: 4 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 7,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 15, i: 4 },
      callStack: ['main', 'sumArray'],
    },
    {
      line: 9,
      variables: { arr: [1, 2, 3, 4, 5], n: 5, sum: 15, i: 5 },
      callStack: ['main', 'sumArray'],
    },
    { line: 15, variables: { arr: [1, 2, 3, 4, 5], n: 5, result: 15 }, callStack: ['main'] },
    { line: 16, variables: { arr: [1, 2, 3, 4, 5], n: 5, result: 15 }, callStack: ['main'] },
    { line: 17, variables: { arr: [1, 2, 3, 4, 5], n: 5, result: 15 }, callStack: ['main'] },
  ],
  loop_invariants: [
    {
      line: 6,
      invariant:
        'At the start of each iteration, sum equals the sum of elements arr[0] through arr[i-1]. When i = 0, sum = 0 (empty sum). This invariant is maintained because each iteration adds arr[i] to sum before incrementing i.',
    },
  ],
  recursion_invariants: [],
  time_complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    reasoning:
      'The function iterates through all n elements exactly once, performing constant-time operations (addition and assignment) in each iteration. The loop executes n times regardless of input values, making all cases linear.',
  },
  space_complexity:
    'O(1) auxiliary space. The function uses only three local variables (sum, i, and the loop counter) regardless of input size. The array is passed by reference, so no additional space is allocated for it.',
}

export const RECURSIVE_SAMPLE_CODE = `#include <iostream>
using namespace std;

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

int main() {
    int result = factorial(5);
    cout << result << endl;
    return 0;
}`

export const RECURSIVE_MOCK_ANALYSIS: AnalysisResult = {
  execution_trace: [
    { line: 11, variables: {}, callStack: ['main'] },
    { line: 4, variables: { n: 5 }, callStack: ['main', 'factorial(5)'] },
    { line: 5, variables: { n: 5 }, callStack: ['main', 'factorial(5)'] },
    { line: 8, variables: { n: 5 }, callStack: ['main', 'factorial(5)'] },
    { line: 4, variables: { n: 4 }, callStack: ['main', 'factorial(5)', 'factorial(4)'] },
    { line: 5, variables: { n: 4 }, callStack: ['main', 'factorial(5)', 'factorial(4)'] },
    { line: 8, variables: { n: 4 }, callStack: ['main', 'factorial(5)', 'factorial(4)'] },
    {
      line: 4,
      variables: { n: 3 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)'],
    },
    {
      line: 5,
      variables: { n: 3 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)'],
    },
    {
      line: 8,
      variables: { n: 3 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)'],
    },
    {
      line: 4,
      variables: { n: 2 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)'],
    },
    {
      line: 5,
      variables: { n: 2 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)'],
    },
    {
      line: 8,
      variables: { n: 2 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)'],
    },
    {
      line: 4,
      variables: { n: 1 },
      callStack: [
        'main',
        'factorial(5)',
        'factorial(4)',
        'factorial(3)',
        'factorial(2)',
        'factorial(1)',
      ],
    },
    {
      line: 5,
      variables: { n: 1 },
      callStack: [
        'main',
        'factorial(5)',
        'factorial(4)',
        'factorial(3)',
        'factorial(2)',
        'factorial(1)',
      ],
    },
    {
      line: 6,
      variables: { n: 1, return: 1 },
      callStack: [
        'main',
        'factorial(5)',
        'factorial(4)',
        'factorial(3)',
        'factorial(2)',
        'factorial(1)',
      ],
    },
    {
      line: 8,
      variables: { n: 2, return: 2 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)', 'factorial(2)'],
    },
    {
      line: 8,
      variables: { n: 3, return: 6 },
      callStack: ['main', 'factorial(5)', 'factorial(4)', 'factorial(3)'],
    },
    {
      line: 8,
      variables: { n: 4, return: 24 },
      callStack: ['main', 'factorial(5)', 'factorial(4)'],
    },
    { line: 8, variables: { n: 5, return: 120 }, callStack: ['main', 'factorial(5)'] },
    { line: 12, variables: { result: 120 }, callStack: ['main'] },
  ],
  loop_invariants: [],
  recursion_invariants: [
    {
      functionName: 'factorial',
      baseCondition: 'n <= 1 returns 1',
      invariant:
        'For any call factorial(k) where k > 1, the function returns k * factorial(k-1). The invariant holds that factorial(n) computes n! = n * (n-1) * ... * 1 for all non-negative integers n.',
    },
  ],
  time_complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    reasoning:
      'The function makes exactly n recursive calls before reaching the base case. Each call performs constant-time work (comparison and multiplication), resulting in linear time complexity.',
  },
  space_complexity:
    'O(n) stack space due to n recursive calls. Each call adds a new stack frame containing the parameter n and the return address. Maximum stack depth is n.',
}
