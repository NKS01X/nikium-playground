import { useState, useCallback } from 'react'
import { ExampleList } from './components/ExampleList'
import { Editor } from './components/Editor'
import { Output } from './components/Output'
import { LanguageInfo } from './components/LanguageInfo'
import { examples } from './lib/examples'
import { runNikium } from './lib/nikium-runner'
import type { RunResult } from './types'

export default function App() {
  const [activeId, setActiveId] = useState(examples[0].id)
  const [code, setCode] = useState(examples[0].starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const activeExample = examples.find((l) => l.id === activeId) ?? examples[0]

  const handleSelect = useCallback((id: string) => {
    const example = examples.find((l) => l.id === id)
    if (example) {
      setActiveId(id)
      setCode(example.starterCode)
      setResult(null)
    }
  }, [])

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setResult(null)
    const res = await runNikium(code)
    setResult(res)
    setIsRunning(false)
  }, [code])

  return (
    <div className="h-screen flex bg-gray-50 text-gray-900 overflow-hidden font-sans">
      <div className="flex w-full h-full max-w-screen-2xl mx-auto bg-white shadow-sm border-x border-gray-200">
        <ExampleList examples={examples} activeId={activeId} onSelect={handleSelect} />

        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <div className="flex-1 flex min-h-0">
            <div className="w-1/3 min-w-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
              <LanguageInfo example={activeExample} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 bg-white">
              <div className="flex-1 min-w-0 flex flex-col border-b border-gray-200">
                <Editor value={code} onChange={setCode} onRun={handleRun} />
              </div>

              <div className="h-64 min-w-0 flex flex-col bg-gray-50">
                <Output result={result} isRunning={isRunning} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
