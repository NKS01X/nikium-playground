import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Example } from '../types'

interface LanguageInfoProps {
  example: Example
}

export function LanguageInfo({ example }: LanguageInfoProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: '#13131b' }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200 tracking-wide">{example.title}</h2>
        <span className="text-[10px] text-slate-600 font-mono bg-white/[0.04] px-2 py-0.5 rounded">docs</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="prose-dark max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{example.content}</ReactMarkdown>
        </div>

        <div className="mt-8 flex items-start gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-500/20" style={{ background: 'rgba(99,102,241,0.06)' }}>
            <span className="text-[11px] text-indigo-400 font-semibold">Tip:</span>
            <span className="text-[11px] text-slate-500">Try modifying the starter code to experiment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
