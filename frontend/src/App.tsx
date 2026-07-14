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

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('nikium-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export default function App() {
  const [activeId, setActiveId] = useState(examples[0].id)
  const [code, setCode] = useState(examples[0].starterCode)
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [input, setInput] = useState('')
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [showAuth, setShowAuth] = useState(false)
  const [showingAbout, setShowingAbout] = useState(false)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    checkSession().then(setUser)
  }, [])

  useEffect(() => {
    localStorage.setItem('nikium-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
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
    <div className="h-screen flex overflow-hidden font-sans" data-theme={theme} style={{ background: 'var(--bg-app)' }}>
      <div className="flex w-full h-full">
        <div className="flex flex-col h-full">
          <ExampleList examples={examples} activeId={activeId} onSelect={handleSelect} onLockedClick={handleLockedClick} />
          <AuthorSection user={user} onLogout={handleLogout} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <PanelGroup orientation="horizontal">
            <Panel defaultSize={30} minSize={20} className="border-r" style={{ borderRightColor: 'var(--border)' }}>
              <div className="h-full flex flex-col" style={{ background: 'var(--bg-surface)' }}>
                <div className="flex border-b" style={{ borderBottomColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                  <button
                    onClick={() => setShowingAbout(false)}
                    className={`flex-1 py-2 text-[13px] font-medium transition-colors ${
                      !showingAbout ? 'text-primary' : 'text-muted'
                    }`}
                    style={!showingAbout ? { background: 'color-mix(in srgb, var(--accent-primary) 8%, transparent)' } : undefined}
                  >
                    Lessons
                  </button>
                  <button
                    onClick={() => setShowingAbout(true)}
                    className={`flex-1 py-2 text-[13px] font-medium transition-colors ${
                      showingAbout ? 'text-primary' : 'text-muted'
                    }`}
                    style={showingAbout ? { background: 'color-mix(in srgb, var(--accent-primary) 8%, transparent)' } : undefined}
                  >
                    About Author
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {showingAbout ? <AboutAuthor /> : <LanguageInfo example={activeExample} />}
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 hover:bg-[var(--accent-primary)] transition-colors cursor-col-resize z-10" style={{ background: 'var(--border)' }} />

            <Panel defaultSize={70}>
              <PanelGroup orientation="vertical">
                <Panel defaultSize={65} minSize={30} className="border-b" style={{ borderBottomColor: 'var(--border)' }}>
                  <Editor value={code} onChange={setCode} onRun={handleRun} isRunning={isRunning} theme={theme} onToggleTheme={toggleTheme} />
                </Panel>

                <PanelResizeHandle className="h-1 hover:bg-[var(--accent-primary)] transition-colors cursor-row-resize z-10" style={{ background: 'var(--border)' }} />

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
