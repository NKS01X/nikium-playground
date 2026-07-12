import { useState, useCallback, useEffect } from 'react'
import { ExampleList } from './components/ExampleList'
import { Editor } from './components/Editor'
import { Output } from './components/Output'
import { LanguageInfo } from './components/LanguageInfo'
import { AboutAuthor } from './components/AboutAuthor'
import { AuthModal } from './components/AuthModal'
import { AuthorSection } from './components/AuthorSection'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import { examples } from './lib/examples'
import { runNikium } from './lib/nikium-runner'
import { getStoredUser, logout as authLogout, checkSession, type AuthUser } from './lib/auth'
import type { RunResult } from './types'

export default function App() {
  const [activeId, setActiveId] = useState(examples[0].id)
  const [code, setCode] = useState(examples[0].starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [input, setInput] = useState('')
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [showAuth, setShowAuth] = useState(false)
  const [showingAbout, setShowingAbout] = useState(false)

  useEffect(() => {
    checkSession().then(setUser)
  }, [])

  const activeExample = examples.find((l) => l.id === activeId) ?? examples[0]

  const handleSelect = useCallback((id: string) => {
    const example = examples.find((l) => l.id === id)
    if (example) {
      setActiveId(id)
      setCode(example.starterCode)
      setResult(null)
    }
  }, [])

  const handleLockedClick = useCallback(() => {
    setShowAuth(true)
  }, [])

  const handleAuth = useCallback((u: AuthUser) => {
    setUser(u)
    setShowAuth(false)
  }, [])

  const handleLogout = useCallback(() => {
    authLogout()
    setUser(null)
  }, [])

  const handleRun = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setResult(null)
    const res = await runNikium(code, input)
    setResult(res)
    setIsRunning(false)
  }, [code, input, isRunning])

  return (
    <div className="h-screen flex overflow-hidden font-sans" style={{ background: '#0f0f14' }}>
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <div className="flex flex-col h-full">
          <ExampleList examples={examples} activeId={activeId} onSelect={handleSelect} onLockedClick={handleLockedClick} />
          <AuthorSection user={user} onLogout={handleLogout} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <PanelGroup orientation="horizontal">
            {/* Documentation panel */}
            <Panel defaultSize={30} minSize={20} className="border-r border-white/[0.06]">
              <div className="h-full flex flex-col">
                <div className="flex border-b border-white/[0.06]" style={{ background: '#111118' }}>
                  <button
                    onClick={() => setShowingAbout(false)}
                    className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                      !showingAbout ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    style={!showingAbout ? { background: 'rgba(99,102,241,0.08)' } : undefined}
                  >
                    Lessons
                  </button>
                  <button
                    onClick={() => setShowingAbout(true)}
                    className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                      showingAbout ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                    }`}
                    style={showingAbout ? { background: 'rgba(99,102,241,0.08)' } : undefined}
                  >
                    About Author
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {showingAbout ? <AboutAuthor /> : <LanguageInfo example={activeExample} />}
                </div>
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
                    <Output result={result} isRunning={isRunning} input={input} onInputChange={setInput} />
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onAuth={handleAuth} />
    </div>
  )
}
