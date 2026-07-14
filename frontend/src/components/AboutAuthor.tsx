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
}

const projects = [
  {
    name: 'VORTEX',
    desc: 'Distributed container orchestration platform with a custom MVCC/WAL key-value store, CAS-based leader election, gRPC control plane, and self-healing infrastructure.',
    tech: 'Go · Rust · gRPC · RAFT',
  },
  {
    name: 'Krypton',
    desc: 'Video/image copyright detection pipeline using Go + RabbitMQ, Python/Node.js microservices with OpenAI CLIP, SerpApi, and Gemini — deployed on Oracle Cloud with Terraform.',
    tech: 'Go · RabbitMQ · OpenAI CLIP · Terraform',
  },
  {
    name: 'Nikium',
    desc: 'Custom programming language with a Pratt parser, tree-walk evaluator, LSP server, WASM playground, and VS Code extension.',
    tech: 'Go · TypeScript · WASM · LSP',
  },

]

const techStack = [
  'Go', 'Rust', 'TypeScript', 'React', 'PostgreSQL',
  'Docker', 'Kubernetes', 'gRPC', 'RabbitMQ', 'Redis',
  'Terraform', 'Cloudflare', 'AWS', 'Oracle Cloud',
  'OpenAI CLIP', 'Gemini', 'WASM', 'LSP',
]

const links = [
  { label: 'Portfolio', url: 'https://www.iamnikhil.dev', icon: 'globe' },
  { label: 'GitHub', url: 'https://github.com/NKS01X', icon: 'github' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/nks01x', icon: 'linkedin' },
  { label: 'LeetCode', url: 'https://leetcode.com/NKS01X', icon: 'code' },
  { label: 'Codeforces', url: 'https://codeforces.com/profile/NKS01X', icon: 'code' },
]

function LinkIcon({ icon }: { icon: string }) {
  if (icon === 'github') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    )
  }
  if (icon === 'linkedin') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    )
  }
  if (icon === 'globe') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 0a9 9 0 019 9" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

export function AboutAuthor() {
  const [gh, setGh] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://api.github.com/users/NKS01X')
      .then(r => r.json())
      .then((data: GitHubData) => { setGh(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ background: 'var(--bg-surface)' }}>
      <div className="px-6 py-8 max-w-lg mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-28 h-28 rounded-full overflow-hidden mb-5 shadow-xl relative ring-4" style={{ borderColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' }}>
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 0 1px var(--border)' }} />
            <img
              src="/author.jpg"
              alt="Nikhil Kumar Singh"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%2336363f" width="100" height="100" rx="50"/><text x="50" y="58" text-anchor="middle" fill="%23818cf8" font-size="32" font-family="sans-serif" font-weight="bold">NS</text></svg>'
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Nikhil Kumar Singh</h1>
          <p className="text-sm mt-1.5 font-medium" style={{ color: 'color-mix(in srgb, var(--accent-primary) 80%, var(--text-primary))' }}>@nks01x</p>
          <p className="text-sm text-muted mt-2 max-w-xs leading-relaxed">
            Backend & DevOps Systems Engineer · Building distributed systems in Go & Rust
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            B.Tech CSE · NIT Agartala · 2028
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {links.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all border text-muted"
              style={{ borderColor: 'var(--border)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <LinkIcon icon={link.icon} />
              {link.label}
            </a>
          ))}
        </div>

        <div className="mb-8">
          <SectionTitle>GitHub</SectionTitle>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent-primary)' }} />
            </div>
          ) : gh ? (
            <div className="grid grid-cols-1 gap-2">
              <div className="text-center py-2.5 px-1 rounded-lg border text-primary" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)' }}>
                <div className="text-base font-bold">{gh.public_repos}</div>
                <div className="text-[9px] text-muted font-medium mt-0.5 uppercase tracking-wider">Repos</div>
              </div>
            </div>
          ) : null}
        </div>

        {gh?.bio && (
          <div className="mb-8">
            <SectionTitle>Bio</SectionTitle>
            <div className="px-4 py-3 rounded-lg border text-center" style={{ borderColor: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 4%, transparent), color-mix(in srgb, var(--accent-primary) 4%, transparent))' }}>
              <p className="text-sm text-primary leading-relaxed italic">&ldquo;{gh.bio}&rdquo;</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <SectionTitle>Competitive Programming</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {[
              { platform: 'Codeforces', handle: 'NKS01X', badge: 'Expert', color: '#1e88e5' },
              { platform: 'LeetCode', handle: 'NKS01X', badge: 'Knight (Top 2%)', color: '#ffa116' },
              { platform: 'CodeChef', handle: 'NKS01X', badge: 'Active', color: '#8b5cf6' },
            ].map(cp => (
              <div key={cp.platform} className="text-center py-3 px-2 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)' }}>
                <div className="text-[12px] text-muted font-medium uppercase tracking-wider">{cp.platform}</div>
                <div className="text-xs text-primary font-mono mt-1">{cp.handle}</div>
                <div className="text-[12px] font-semibold mt-0.5" style={{ color: cp.color }}>{cp.badge}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <SectionTitle>Flagship Projects</SectionTitle>
          <div className="space-y-3">
            {projects.map(p => (
              <div key={p.name} className="p-3.5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                  <span className="text-sm font-semibold text-primary">{p.name}</span>
                </div>
                <p className="text-[14px] text-muted leading-relaxed ml-3.5">{p.desc}</p>
                <p className="text-[12px] mt-1.5 ml-3.5 font-mono" style={{ color: 'color-mix(in srgb, var(--accent-primary) 60%, var(--text-muted))' }}>{p.tech}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <SectionTitle>Tech Stack</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {techStack.map(tech => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-full text-[12px] font-medium border text-muted"
                style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--accent-primary) 6%, transparent)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <SectionTitle>Contact</SectionTitle>
          <div className="flex flex-col gap-2">
            <a
              href="mailto:nikhil2006work@gmail.com"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 30%, transparent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="text-sm text-primary">Email</div>
                <div className="text-[13px] text-muted">nikhil2006work@gmail.com</div>
              </div>
            </a>
            <a
              href="https://www.iamnikhil.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border transition-all"
              style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg-app) 60%, transparent)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 30%, transparent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 0a9 9 0 019 9" />
              </svg>
              <div>
                <div className="text-sm text-primary">Portfolio</div>
                <div className="text-[13px] text-muted">iamnikhil.dev</div>
              </div>
            </a>
          </div>
        </div>

        <div className="text-center pb-4">
          <p className="text-[13px] italic leading-relaxed max-w-xs mx-auto text-muted" style={{ color: 'var(--text-muted)' }}>
            "Building reliable and scalable systems — one distributed component at a time."
          </p>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-[12px] text-muted font-semibold uppercase tracking-[0.15em]">{children}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}
