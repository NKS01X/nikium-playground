import type { Example } from '../types'
import { isExampleAccessible, getFreeTierLimit } from '../lib/auth'

interface ExampleListProps {
  examples: Example[]
  activeId: string
  onSelect: (id: string) => void
  onLockedClick: () => void
}

export function ExampleList({ examples, activeId, onSelect, onLockedClick }: ExampleListProps) {
  return (
    <aside className="w-64 flex-1 min-h-0 flex flex-col border-r border-white/[0.06]" style={{ background: '#111118' }}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg"
             style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          N
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-none">Nikium</h1>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Playground</div>
        </div>
      </div>

      {/* Example List */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {examples.map((example, index) => {
          const isActive = activeId === example.id
          const accessible = isExampleAccessible(index)

          return (
            <button
              key={example.id}
              id={`example-${example.id}`}
              onClick={() => accessible ? onSelect(example.id) : onLockedClick()}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all relative group ${
                isActive
                  ? 'text-white'
                  : accessible
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    : 'text-slate-600 cursor-not-allowed'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' } : undefined}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                     style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
              )}

              <div className="flex items-center justify-between">
                <div className={`font-medium text-[13px] ${isActive ? 'text-white' : accessible ? '' : 'text-slate-600'}`}>
                  {example.title}
                </div>
                {!accessible && (
                  <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <div className={`text-[11px] mt-0.5 ${isActive ? 'text-indigo-300/70' : accessible ? 'text-slate-600' : 'text-slate-700'}`}>
                {example.description}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="text-[11px] text-slate-600 space-y-0.5 font-medium">
          <div className="flex items-center justify-between">
            <span>{examples.length} examples</span>
            <span className="text-[10px] text-slate-700">{getFreeTierLimit()} free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(((examples.findIndex(e => e.id === activeId) + 1) / examples.length) * 100)}%`,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
              />
            </div>
            <span>{Math.round(((examples.findIndex(e => e.id === activeId) + 1) / examples.length) * 100)}%</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
