import { useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onRun: () => void
}

const nikiumSyntax = javascript({ typescript: false })

export function Editor({ value, onChange, onRun }: EditorProps) {
  const handleChange = useCallback(
    (val: string) => onChange(val),
    [onChange]
  )

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono font-medium bg-gray-200 px-2 py-1 rounded">main.nik</span>
        </div>

        <button
          onClick={onRun}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.5 2.5v11l9-5.5-9-5.5z" />
          </svg>
          Run Code
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <CodeMirror
          value={value}
          onChange={handleChange}
          extensions={[nikiumSyntax]}
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
