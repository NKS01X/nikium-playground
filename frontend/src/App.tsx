import { useState, useCallback } from 'react'
import { ExampleList } from './components/ExampleList'
import { Editor } from './components/Editor'
import { Output } from './components/Output'
import { LanguageInfo } from './components/LanguageInfo'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
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
    if (isRunning) return
    setIsRunning(true)
    setResult(null)
    const res = await runNikium(code)
    setResult(res)
    setIsRunning(false)
  }, [code, isRunning])

  return (
    <div className="h-screen flex overflow-hidden font-sans" style={{ background: '#0f0f14' }}>
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <ExampleList examples={examples} activeId={activeId} onSelect={handleSelect} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <PanelGroup orientation="horizontal">
            {/* Documentation panel */}
            <Panel defaultSize={30} minSize={20} className="border-r border-white/[0.06]">
              <div className="h-full overflow-y-auto">
                <LanguageInfo example={activeExample} />
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 hover:bg-indigo-500/50 transition-colors bg-white/[0.04] cursor-col-resize z-10" />

            {/* Editor + Output column */}
            <Panel defaultSize={70}>
              <PanelGroup orientation="vertical">
                {/* Editor */}
                <Panel defaultSize={65} minSize={30} className="border-b border-white/[0.06]">
                  <Editor value={code} onChange={setCode} onRun={handleRun} isRunning={isRunning} />
                </Panel>

                <PanelResizeHandle className="h-1 hover:bg-indigo-500/50 transition-colors bg-white/[0.04] cursor-row-resize z-10" />

                {/* Output Console */}
                <Panel defaultSize={35} minSize={15}>
                  <div className="h-full flex flex-col">
                    <Output result={result} isRunning={isRunning} />
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  )
}
