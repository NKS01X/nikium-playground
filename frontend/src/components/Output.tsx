import type { RunResult } from '../types'

interface OutputProps {
  result: RunResult | null
  isRunning: boolean
}

export function Output({ result, isRunning }: OutputProps) {
  return (
    <div className="h-full flex flex-col font-mono text-sm bg-white">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Output Console</span>
        {isRunning && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
            <span className="text-xs text-indigo-600 font-medium">Running...</span>
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-slate-900 text-slate-50 relative">
        {!result && !isRunning && (
          <div className="flex items-center justify-center h-full text-slate-500">
            Click Run to execute code
          </div>
        )}
        
        {result && (
          <div className="space-y-4">
            <div className="whitespace-pre-wrap">{result.output}</div>
            
            {result.error && (
              <div className="text-red-400 border-l-2 border-red-500 pl-3">
                {result.error}
              </div>
            )}
          </div>
        )}
      </div>

      {result && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex gap-4">
          <span>Source: {result.source}</span>
          <span>Time: {result.duration.toFixed(0)}ms</span>
        </div>
      )}
    </div>
  )
}
