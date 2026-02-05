import { generateText, Output } from 'ai'
import { z } from 'zod'
import { MOCK_ANALYSIS, RECURSIVE_MOCK_ANALYSIS } from '@/lib/mock-data'

const analysisSchema = z.object({
  execution_trace: z.array(
    z.object({
      line: z.number(),
      variables: z.record(z.any()),
      callStack: z.array(z.string()).nullable(),
    })
  ),
  loop_invariants: z.array(
    z.object({
      line: z.number(),
      invariant: z.string(),
    })
  ),
  recursion_invariants: z.array(
    z.object({
      functionName: z.string(),
      baseCondition: z.string(),
      invariant: z.string(),
    })
  ),
  time_complexity: z.object({
    best: z.string(),
    average: z.string(),
    worst: z.string(),
    reasoning: z.string(),
  }),
  space_complexity: z.string(),
})

const systemPrompt = `You are a program analysis engine.
Given source code and a concrete input:
- Simulate execution step by step.
- Track variable values after each executable line.
- Infer loop invariants and recursive invariants.
- Analyze time and space complexity with justification.

Rules:
- Be precise.
- Avoid vague explanations.
- Return valid JSON only.
- Do not include natural language outside JSON.
- For arrays, use proper array notation.
- Track the call stack for recursive functions.
- For loop invariants, explain what holds true at the start of each iteration.
- For recursion invariants, identify base conditions and the invariant property.`

export async function POST(req: Request) {
  const { code, input, language, useMockData } = await req.json()

  // Return mock data for demo mode
  if (useMockData) {
    // Check if code contains recursion keywords to return appropriate mock
    const hasRecursion = code.toLowerCase().includes('factorial') || 
                         code.toLowerCase().includes('fibonacci') ||
                         /\b(\w+)\s*\([^)]*\)\s*{[^}]*\1\s*\(/.test(code)
    
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate processing
    return Response.json({ analysis: hasRecursion ? RECURSIVE_MOCK_ANALYSIS : MOCK_ANALYSIS })
  }

  try {
    const { output } = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      output: Output.object({
        schema: analysisSchema,
      }),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze the following ${language} code with the given input.

Input Code:
\`\`\`${language}
${code}
\`\`\`

Program Input:
${input}

Provide a detailed execution trace, loop invariants, recursion invariants (if applicable), and complexity analysis.`,
        },
      ],
    })

    return Response.json({ analysis: output })
  } catch (error) {
    console.error('Analysis error:', error)
    return Response.json(
      { error: 'Failed to analyze code. Please try again.' },
      { status: 500 }
    )
  }
}
