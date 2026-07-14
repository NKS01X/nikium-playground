import { useCallback, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
  isRunning: boolean
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const nikiumSyntax = javascript({ typescript: false })

const lightTheme = EditorView.theme({
  '&.cm-editor': {
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    caretColor: 'var(--accent-primary)',
    color: 'var(--text-primary)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent !important',
    color: 'var(--text-muted)',
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'var(--accent-primary)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--accent-primary) 6%, transparent)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
    color: 'var(--text-primary)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--accent-primary) 22%, transparent) !important',
  },
})

export function Editor({ value, onChange, onRun, isRunning, theme, onToggleTheme }: EditorProps) {
  const handleChange = useCallback(
    (val: string) => onChange(val),
    [onChange]
  )

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
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-surface)' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderBottomColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted font-mono font-medium px-2.5 py-1 rounded-full border" style={{ background: 'var(--badge-bg)', borderColor: 'var(--border)' }}>
            main.nik
          </span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle — brushed metal panel */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
            style={{
              background: 'linear-gradient(145deg, #16161a, #202024, #16161a)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05), 0 1px 4px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <button
              onClick={() => theme !== 'dark' && onToggleTheme()}
              className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                theme === 'dark' ? 'power-btn-active' : ''
              }`}
              style={theme === 'dark' ? {
                background: '#0d0d0f',
                boxShadow: '0 0 8px rgba(255,180,50,0.35), 0 0 16px rgba(255,180,50,0.15), inset 0 0 0 1.5px rgba(255,180,50,0.5)',
              } : {
                background: '#0d0d0f',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.06)',
              }}
              title="Dark mode"
            >
              <svg className="w-3 h-3" fill="none" stroke={theme === 'dark' ? '#ffb432' : '#555'} strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            </button>
            <button
              onClick={() => theme !== 'light' && onToggleTheme()}
              className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                theme === 'light' ? 'power-btn-active' : ''
              }`}
              style={theme === 'light' ? {
                background: '#0d0d0f',
                boxShadow: '0 0 8px rgba(255,180,50,0.35), 0 0 16px rgba(255,180,50,0.15), inset 0 0 0 1.5px rgba(255,180,50,0.5)',
              } : {
                background: '#0d0d0f',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.06)',
              }}
              title="Light mode"
            >
              <svg className="w-3 h-3" fill="none" stroke={theme === 'light' ? '#ffb432' : '#555'} strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>

          <span className="text-[12px] text-muted font-mono hidden sm:inline">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
          </span>
          <button
            id="run-button"
            onClick={onRun}
            disabled={isRunning}
            className="run-btn"
          >
            {isRunning ? (
              <span className="flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Running…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.5 2.5v11l9-5.5-9-5.5z" />
                </svg>
                Run
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          value={value}
          onChange={handleChange}
          extensions={theme === 'light' ? [nikiumSyntax, lightTheme] : [nikiumSyntax]}
          theme={theme === 'dark' ? oneDark : undefined}
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
