import { useCallback, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  isRunning: boolean
}

const nikiumSyntax = javascript({ typescript: false })

export function Editor({ value, onChange, onRun, isRunning }: EditorProps) {
  const handleChange = useCallback(
    (val: string) => onChange(val),
    [onChange]
  )

  // Global keyboard shortcut: Ctrl+Enter / Cmd+Enter to run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        onRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onRun])

  return (
    <div className="flex flex-col h-full" style={{ background: '#0f0f17' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]"
           style={{ background: '#111118' }}>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono font-medium bg-white/[0.04] px-2.5 py-1 rounded border border-white/[0.06]">
            main.nik
          </span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 font-mono hidden sm:inline">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
          </span>
          <button
            id="run-button"
            onClick={onRun}
            disabled={isRunning}
            className={`run-btn flex items-center gap-1.5 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-all shadow-lg ${
              isRunning
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.5 2.5v11l9-5.5-9-5.5z" />
                </svg>
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          value={value}
          onChange={handleChange}
          extensions={[nikiumSyntax]}
          theme={oneDark}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            foldGutter: false,
            autocompletion: false,
          }}
          height="100%"
        />
      </div>
    </div>
  )
}
