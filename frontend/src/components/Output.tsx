import { useState, useRef, useEffect } from 'react'
import type { RunResult } from '../types'

type TabId = 'output' | 'errors' | 'logs' | 'input'

interface OutputProps {
  result: RunResult | null
  isRunning: boolean
  input: string
  onInputChange: (value: string) => void
}

export function Output({ result, isRunning, input, onInputChange }: OutputProps) {
  const [activeTab, setActiveTab] = useState<TabId>('output')
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)

  // Auto-scroll to bottom on new output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [result])

  // Switch to errors tab when errors arrive
  useEffect(() => {
    if (result?.error) {
      setActiveTab('errors')
    } else if (result?.output) {
      setActiveTab('output')
    }
  }, [result])

  const hasErrors = !!result?.error
  const errorCount = result?.error ? result.error.split('\n').filter(l => l.trim()).length : 0

  const handleCopy = () => {
    const text = activeTab === 'output' ? result?.output : activeTab === 'errors' ? result?.error : ''
    if (text) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const handleClear = () => {
    // We can't truly clear since result is from parent, but switch to output tab
    setActiveTab('output')
  }

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: 'output', label: 'Output' },
    { id: 'errors', label: 'Errors', badge: hasErrors ? errorCount : undefined },
    { id: 'logs', label: 'Logs' },
    { id: 'input', label: 'Input' },
  ]

  return (
    <div className="h-full flex flex-col" style={{ background: '#0a0a10' }}>
      {/* Tab Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06]"
           style={{ background: '#0e0e16' }}>
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[12px] font-medium transition-colors relative flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'text-slate-200 tab-active'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 px-1">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 pr-3">
          {isRunning && (
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-[11px] text-indigo-400 font-medium">Running…</span>
            </div>
          )}
          {result && (
            <>
              <button
                onClick={handleCopy}
                className="p-1 rounded text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleClear}
                className="p-1 rounded text-slate-600 hover:text-slate-400 hover:bg-white/[0.04] transition-colors"
                title="Clear"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div ref={outputRef} className="flex-1 p-4 overflow-y-auto console-output">
        {/* OUTPUT TAB */}
        {activeTab === 'output' && (
          <>
            {!result && !isRunning && (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[12px]">Click Run to execute code</span>
              </div>
            )}
            {result && result.output && (
              <div className="console-output-text">{result.output}</div>
            )}
            {result && !result.output && !result.error && (
              <div className="text-slate-600 text-[12px] italic">Program produced no output</div>
            )}
          </>
        )}

        {/* ERRORS TAB */}
        {activeTab === 'errors' && (
          <>
            {!result?.error && (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[12px]">No errors</span>
              </div>
            )}
            {result?.error && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-400 text-[12px] font-medium">
                    {errorCount} error{errorCount > 1 ? 's' : ''} found
                  </span>
                </div>
                {result.error.split('\n').filter(l => l.trim()).map((line, i) => (
                  <div key={i}
                       className="px-3 py-2 rounded-md border border-red-500/10 console-error-text text-[12.5px]"
                       style={{ background: 'rgba(239,68,68,0.04)' }}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <>
            {!result && (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-[12px]">No execution logs</span>
              </div>
            )}
            {result && (
              <div className="space-y-1.5 console-log-text text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">source</span>
                  <span className="text-slate-400 font-mono">
                    {result.source === 'wasm' ? 'WASM (browser)' : 'Server (remote)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">duration</span>
                  <span className="text-slate-400 font-mono">{result.duration.toFixed(1)}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">status</span>
                  <span className={`font-mono ${result.error ? 'text-red-400' : 'text-green-400'}`}>
                    {result.error ? 'error' : 'success'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">timestamp</span>
                  <span className="text-slate-400 font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
                {result.output && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">output size</span>
                    <span className="text-slate-400 font-mono">{result.output.length} chars</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-1 py-1.5">
              <span className="text-[10px] text-slate-600 font-medium">stdin (one line per prompt)</span>
              <button
                onClick={() => onInputChange('')}
                className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => onInputChange(e.target.value)}
              placeholder="Type your input here...
Programs that call readline() will read from this input, one line per call."
              className="flex-1 w-full resize-none border-0 outline-none p-3 text-[13px] font-mono leading-relaxed"
              style={{ background: '#0a0a10', color: '#c4c9d4' }}
              spellCheck={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}
