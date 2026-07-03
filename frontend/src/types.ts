export interface Lesson {
  id: string
  title: string
  description: string
  content: string
  starterCode: string
  expectedOutput?: string
  hints?: string[]
}

export interface Example {
  id: string
  title: string
  description: string
  content: string
  starterCode: string
  expectedOutput?: string
}

export interface RunResult {
  output: string
  error: string
  duration: number
  source: 'wasm' | 'server'
}
