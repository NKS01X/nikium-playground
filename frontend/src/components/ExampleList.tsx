import { useState } from 'react'
import type { Example } from '../types'
import { isExampleAccessible, getFreeTierLimit } from '../lib/auth'

interface ExampleListProps {
  examples: Example[]
  activeId: string
  onSelect: (id: string) => void
  onLockedClick: () => void
}

export function ExampleList({ examples, activeId, onSelect, onLockedClick }: ExampleListProps) {
  const [showComingSoon, setShowComingSoon] = useState(false)

  return (
    <aside className="w-64 flex-1 min-h-0 flex flex-col border-r" style={{ background: 'var(--bg-sidebar)', borderRightColor: 'var(--border)' }}>
      <div className="px-4 py-4 border-b" style={{ borderBottomColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <img src="/nikium-icon.svg" alt="Nikium" className="w-8 h-8" />
          <div>
            <h1 className="text-base font-bold text-primary tracking-tight leading-none">Nikium</h1>
            <div className="text-[12px] text-muted font-medium mt-0.5">Playground</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {examples.map((example, index) => {
          const isActive = activeId === example.id
          const accessible = isExampleAccessible(index)

          return (
            <button
              key={example.id}
              id={`example-${example.id}`}
              onClick={() => accessible ? onSelect(example.id) : onLockedClick()}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all relative group sidebar-item ${
                isActive
                  ? 'text-primary'
                  : accessible
                    ? 'text-muted hover:text-primary'
                    : 'text-muted cursor-not-allowed'
              }`}
              style={isActive ? { background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)' } : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                     style={{ background: 'var(--accent-primary)' }} />
              )}

              <div className="flex items-center justify-between">
                <div className={`font-medium text-[14px] ${isActive ? 'text-primary' : 'text-muted'}`}>
                  {example.title}
                </div>
                {!accessible && (
                  <svg className="w-3.5 h-3.5 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
              </div>
              <div className={`text-[12px] mt-0.5 ${isActive ? 'text-primary opacity-60' : 'text-muted'}`}>
                {example.description}
              </div>
            </button>
          )
        })}

        <button
          onClick={() => setShowComingSoon(true)}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all group sidebar-item text-muted hover:text-primary mt-4"
        >
          <div className="flex items-center justify-between">
            <div className="font-medium text-[14px] text-muted group-hover:text-primary transition-colors">
              + Create Project
            </div>
            <svg className="w-4 h-4 text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-[11px] mt-0.5 text-muted/60">
            Coming soon
          </div>
        </button>
      </nav>

      <div className="px-4 py-3 border-t" style={{ borderTopColor: 'var(--border)' }}>
        <div className="text-[12px] text-muted space-y-0.5 font-medium">
          <div className="flex items-center justify-between">
            <span>{examples.length} examples</span>
            <span className="text-[12px] text-muted/60">{getFreeTierLimit()} free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round(((examples.findIndex(e => e.id === activeId) + 1) / examples.length) * 100)}%`,
                  background: 'var(--accent-primary)',
                }}
              />
            </div>
            <span className="text-muted">{Math.round(((examples.findIndex(e => e.id === activeId) + 1) / examples.length) * 100)}%</span>
          </div>
        </div>
      </div>

      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             onClick={() => setShowComingSoon(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
          <div className="relative bg-[var(--bg-surface)] border rounded-2xl p-8 max-w-md w-full text-center animate-slide-up"
               style={{ borderColor: 'var(--border)' }}
               onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center animate-pulse-glow"
                 style={{ background: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)', border: '1px solid var(--accent-primary)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ stroke: 'var(--accent-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">Coming Soon</h2>
            <p className="text-muted mb-6 text-sm leading-relaxed">
              Project creation is in development. You'll be able to create, save, and share your own Nikium projects here soon.
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
              style={{
                background: 'var(--accent-primary)',
                color: 'var(--accent-primary-foreground)',
                boxShadow: '0 4px 14px color-mix(in srgb, var(--accent-primary) 40%, transparent)'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
