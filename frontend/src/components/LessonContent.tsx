import type { Lesson } from '../types'
import { motion } from 'framer-motion'

interface LessonContentProps {
  lesson: Lesson
}

function renderMarkdown(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      if (line.startsWith('## ')) {
        return `<h2 class="text-lg font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent mt-4 mb-2">${line.slice(3)}</h2>`
      }
      if (line.startsWith('### ')) {
        return `<h3 class="text-base font-semibold text-indigo-200 mt-3 mb-1">${line.slice(4)}</h3>`
      }
      if (line.startsWith('```')) {
        if (line === '```') return '</code></pre>'
        return '<pre class="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 my-2 overflow-x-auto"><code class="text-sm text-indigo-300">'
      }
      if (line.trim() === '') return '<br/>'
      return `<p class="text-slate-300 leading-relaxed">${line}</p>`
    })
    .join('\n')
}

export function LessonContent({ lesson }: LessonContentProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full overflow-y-auto p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative"
    >
      {/* Animated background accent */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <motion.div variants={itemVariants} className="relative z-10">
        <motion.h1
          className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {lesson.title}
        </motion.h1>
        <motion.p
          className="text-sm text-slate-400 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {lesson.description}
        </motion.p>
      </motion.div>

      {/* Main content with markdown styling */}
      <motion.div
        variants={itemVariants}
        className="prose prose-invert max-w-none text-sm relative z-10 space-y-3"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.content) }}
      />

      {/* Lesson indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-indigo-500/20 relative z-10"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-xs text-indigo-300 font-semibold">💡 Tip:</span>
          <span className="text-xs text-slate-400">Try modifying the starter code to experiment</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
