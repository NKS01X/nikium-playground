import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Example } from '../types'

interface LanguageInfoProps {
  example: Example
}

export function LanguageInfo({ example }: LanguageInfoProps) {
  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-surface)' }}>
      <div className="px-5 py-3 border-b" style={{ borderBottomColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-primary tracking-wide">{example.title}</h2>
          <span className="text-[12px] text-muted font-mono px-2 py-0.5 rounded-full border" style={{ background: 'var(--badge-bg)', borderColor: 'var(--border)' }}>docs</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="prose-body max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{example.content}</ReactMarkdown>
        </div>

        <div className="mt-8 flex items-start gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)', background: 'color-mix(in srgb, var(--accent-primary) 6%, transparent)' }}>
            <span className="text-[13px] font-semibold" style={{ color: 'var(--accent-primary)' }}>Tip:</span>
            <span className="text-[13px] text-muted">Try modifying the starter code to experiment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
