interface AuthorSectionProps {
  user: { name: string; email: string } | null
  onLogout: () => void
}

export function AuthorSection({ user, onLogout }: AuthorSectionProps) {
  return (
    <div className="px-4 py-3 border-t border-white/[0.06]">
      <a
        href="https://github.com/NKS01X"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 group"
      >
        <img
          src="/author.jpg"
          alt="Nikhil"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/[0.06] group-hover:ring-indigo-500/40 transition-all"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2336363f" width="100" height="100" rx="50"/><text x="50" y="58" text-anchor="middle" fill="%23818cf8" font-size="36" font-family="sans-serif" font-weight="bold">N</text></svg>'
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-slate-500 font-medium">Created by</div>
          <div className="text-[12px] text-slate-300 font-semibold truncate group-hover:text-indigo-400 transition-colors">
            Nikhil Kumar Singh
          </div>
        </div>
      </a>

      {user && (
        <div className="mt-2 flex items-center justify-between px-1">
          <div className="text-[10px] text-slate-600 truncate max-w-[140px]">
            {user.name}
          </div>
          <button
            onClick={onLogout}
            className="text-[10px] text-slate-600 hover:text-red-400 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
