import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Example } from '../types'

interface LanguageInfoProps {
  example: Example
}

export function LanguageInfo({ example }: LanguageInfoProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm z-10">
        <h2 className="text-sm font-semibold text-gray-800 tracking-wide">{example.title}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{example.content}</ReactMarkdown>
        </div>

        <div className="mt-8 flex items-start gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 border border-blue-100">
            <span className="text-xs text-blue-700 font-semibold">Tip:</span>
            <span className="text-xs text-blue-600">Try modifying the starter code to experiment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
