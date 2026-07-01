import type { Example } from '../types'

interface ExampleListProps {
  examples: Example[]
  activeId: string
  onSelect: (id: string) => void
}

export function ExampleList({ examples, activeId, onSelect }: ExampleListProps) {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col z-30 shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
          N
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Nikium</h1>
          <div className="text-xs text-gray-500 font-medium mt-1">Playground</div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {examples.map((example) => {
          const isActive = activeId === example.id
          return (
            <button
              key={example.id}
              onClick={() => onSelect(example.id)}
              className={`w-full text-left p-3 rounded-md transition-all relative ${
                isActive 
                  ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                  : 'hover:bg-gray-50 border border-transparent text-gray-600'
              }`}
            >
              <div className={`font-semibold flex items-center gap-2 relative z-10 ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                {example.title}
              </div>
              <div className={`text-xs mt-1 transition-colors relative z-10 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>
                {example.description}
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1 font-medium">
          <div>Total: {examples.length} examples</div>
          <div>Progress: {Math.round((examples.findIndex(e => e.id === activeId) + 1) / examples.length * 100)}%</div>
        </div>
      </div>
    </aside>
  )
}
