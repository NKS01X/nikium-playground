import { useEffect, useState } from 'react'

interface GitHubData {
  name: string
  login: string
  bio: string
  avatar_url: string
  html_url: string
  blog: string
  public_repos: number
  followers: number
  following: number
  location: string
}

export function AboutAuthor() {
  const [gh, setGh] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('https://api.github.com/users/NKS01X')
      .then(r => r.json())
      .then((data: GitHubData) => {
        setGh(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ background: '#13131b' }}>
      <div className="px-6 py-6 max-w-lg mx-auto w-full">
        {/* Photo + Name */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-500/20 mb-4 shadow-xl">
            <img
              src="/author.jpg"
              alt="Nikhil Kumar Singh"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2336363f" width="100" height="100" rx="50"/><text x="50" y="58" text-anchor="middle" fill="%23818cf8" font-size="32" font-family="sans-serif" font-weight="bold">NS</text></svg>'
              }}
            />
          </div>
          <h1 className="text-xl font-bold text-white">Nikhil Kumar Singh</h1>
          <p className="text-sm text-slate-500 mt-1">Backend & DevOps Systems Engineer</p>
          <p className="text-xs text-slate-600 mt-1">Building distributed systems in Go & Rust</p>
        </div>

        {/* Links */}
        <div className="flex justify-center gap-3 mb-8">
          <a
            href="https://www.iamnikhil.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:shadow-indigo-500/25"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 0a9 9 0 019 9" />
            </svg>
            Portfolio
          </a>
          <a
            href="https://github.com/NKS01X"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 border border-white/[0.08] hover:bg-white/[0.04] transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        {/* GitHub Stats */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider text-center">GitHub Stats</h2>
          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <p className="text-xs text-slate-600 text-center">Failed to load stats</p>
          )}
          {gh && !loading && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Repos', value: gh.public_repos },
                { label: 'Followers', value: gh.followers },
                { label: 'Following', value: gh.following },
              ].map(stat => (
                <div
                  key={stat.label}
                  className="text-center py-3 px-2 rounded-lg border border-white/[0.06]"
                  style={{ background: '#0e0e16' }}
                >
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-slate-600 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bio */}
        {gh?.bio && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">About</h2>
            <p className="text-sm text-slate-400 leading-relaxed text-center px-4">{gh.bio}</p>
          </div>
        )}

        {/* Tech Stack */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider text-center">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {['Go', 'Rust', 'TypeScript', 'React', 'PostgreSQL', 'Docker', 'Kubernetes', 'Cloudflare', 'AWS', 'Redis', 'Kafka', 'gRPC'].map(tech => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-[11px] font-medium border border-white/[0.06] text-slate-400"
                style={{ background: 'rgba(99,102,241,0.06)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
