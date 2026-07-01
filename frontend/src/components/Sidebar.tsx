import type { Lesson } from '../types'
import { motion } from 'framer-motion'

interface SidebarProps {
  lessons: Lesson[]
  activeId: string
  onSelect: (id: string) => void
}

export function Sidebar({ lessons, activeId, onSelect }: SidebarProps) {
  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-indigo-500/20 flex flex-col h-full shadow-2xl backdrop-blur-sm relative overflow-hidden"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 pointer-events-none" />

      {/* Header */}
      <motion.div
        className="p-4 border-b border-indigo-500/30 relative z-10 backdrop-blur-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ✨ Nikium
          </h1>
        </motion.div>
        <p className="text-xs text-slate-400 mt-1">Learn by doing</p>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-indigo-500/30 scrollbar-track-transparent"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {lessons.map((lesson, index) => (
          <motion.button
            key={lesson.id}
            variants={itemVariants}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(lesson.id)}
            className={`w-full text-left px-4 py-3 text-sm border-b border-indigo-500/10 transition-all group relative overflow-hidden ${
              activeId === lesson.id
                ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-100 shadow-lg shadow-indigo-500/20'
                : 'text-slate-300 hover:bg-indigo-600/10'
            }`}
          >
            {/* Background animation */}
            {activeId === lesson.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-400"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}

            <div className="font-semibold flex items-center gap-2 relative z-10">
              <span className="text-lg">
                {index < 3 ? '🎯' : index < 6 ? '🚀' : '⚡'}
              </span>
              {lesson.title}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors relative z-10">
              {lesson.description}
            </div>
          </motion.button>
        ))}
      </motion.nav>

      {/* Footer stats */}
      <motion.div
        className="p-4 border-t border-indigo-500/20 bg-gradient-to-r from-slate-900/50 to-slate-950/50 backdrop-blur-md relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-xs text-slate-500 space-y-1">
          <div>📚 Total: {lessons.length} lessons</div>
          <div>✅ Progress: {Math.round((lessons.findIndex(l => l.id === activeId) + 1) / lessons.length * 100)}%</div>
        </div>
      </motion.div>
    </motion.aside>
  )
}
