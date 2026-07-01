# frontend-gospel

Build **award-winning frontends** — Apple, Google, NVIDIA, Stripe, Tesla tier — through an AI-forced phase-gated workflow enforced by permission-constrained agents and MCP server automation.

This is an **OpenCode configuration kit**, not application code. Clone it into any new frontend project and it transforms OpenCode (an open-source AI coding agent) from an unguided code generator into a structured engineering partner that:

1. **Asks questions first** — understands your product, audience, brand, and goals before writing a single line of code
2. **Plans with you** — produces a discovery doc and an architecture plan for your approval
3. **Cannot skip the plan** — the planner agent's permissions literally block it from writing `.tsx`/`.ts` files
4. **Builds autonomously** — once you approve the plan, the builder agent builds, verifies, and ships
5. **Verifies honestly** — produces a verification document with per-rule checklists before declaring done
6. **Automates with MCP** — uses Playwright, Lighthouse, Context7, and GitHub servers during build and verification

---

## Quick start — new project

```bash
# 1. Clone the template into your new project directory
git clone https://github.com/NKS01X/frontend-gospel.git my-new-project
cd my-new-project

# 2. Open in OpenCode (planner agent is the default)
opencode

# 3. Start the workflow
#    Type: /init-project
#    The planner asks you questions about your product, audience, brand, goals.
#    Answer honestly — this drives every decision downstream.

# 4. Planner produces docs/plans/<slug>/01-discovery.md and 02-plan.md.
#    You review and approve.

# 5. Tab to builder agent — it builds the entire project autonomously.

# 6. Done. Production-grade frontend with verification docs.
```

---

## Architecture

### Overview

```
┌─────────────────────────────────────────────────────────┐
│                   frontend-gospel                        │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  planner     │  │  builder     │  │  critic        │  │
│  │  (primary)   │  │  (primary)   │  │  (subagent)    │  │
│  │  read-only   │  │  full access │  │  read-only     │  │
│  │  docs/plans  │  │  + MCP tools │  │  creative      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│         ▼                 ▼                  ▼           │
│  ┌──────────────────────────────────────────────────┐   │
│  │                  Skills Layer                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐   │   │
│  │  │use-case  │ │architecture │component      │   │   │
│  │  │analyzer  │ │planner    │ │builder        │   │   │
│  │  └──────────┘ └──────────┘ └───────────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐   │   │
│  │  │immersive │ │enterprise│ │creative       │   │   │
│  │  │experience│ │audit     │ │critique       │   │   │
│  │  └──────────┘ └──────────┘ └───────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│         │                 │                              │
│         ▼                 ▼                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │                Rules Layer                        │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │ 00 Workflow Gates (no code before plan)    │  │   │
│  │  ├────────────────────────────────────────────┤  │   │
│  │  │ 01 Use-Case Analysis  │ 02 Architecture     │  │   │
│  │  ├────────────────────────────────────────────┤  │   │
│  │  │ 03 Enterprise Standards │ 04 Component      │  │   │
│  │  ├────────────────────────────────────────────┤  │   │
│  │  │ 05 Verification Checklist                  │  │   │
│  │  ├────────────────────────────────────────────┤  │   │
│  │  │ 06 Design Tokens (spacing, type, color,    │  │   │
│  │  │    motion)                                 │  │   │
│  │  ├────────────────────────────────────────────┤  │   │
│  │  │ 07 Device & Browser Matrix (CWV budgets,   │  │   │
│  │  │    hero canvas SSR)                        │  │   │
│  │  ├────────────────────────────────────────────┤  │   │
│  │  │ 08 Asset Repository Hygiene (LFS/CDN,      │  │   │
│  │  │    naming, cache)                          │  │   │
│  │  ├────────────────────────────────────────────┤  │   │
│  │  │ ui-gospel  │ 3d-gospel  │ embedded-3d      │  │   │
│  │  │ overlap    │ immersive  │ 3d-asset-pipeline │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │           MCP Integration Layer                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐  │   │
│  │  │Playwright│ │Lighthouse│ │Context7  │ │GitHub│  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │          CI / GitHub Integration                  │   │
│  │  ┌────────────────────┐ ┌────────────────────┐   │   │
│  │  │ Phase Gate Action  │ │ Verification Action│   │   │
│  │  │ (blocks without    │ │ (checks typecheck,  │   │   │
│  │  │  approved plan)    │ │  lint, tests, doc)  │   │   │
│  │  └────────────────────┘ └────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Three agent roles

| Agent | Type | Mode | Permissions | Skills available |
|---|---|---|---|---|
| **planner** | Primary (default) | Read/plan | `edit: docs/plans/** only`, `bash: deny` | `use-case-analyzer`, `architecture-planner`, `immersive-experience-builder` |
| **builder** | Primary | Build | `edit: allow`, `bash: allow`, `mcp: all` | `component-builder`, `enterprise-audit`, `immersive-experience-builder`, `creative-critique` |
| **critic** | Subagent | Review | `edit: deny`, `bash: deny` | `creative-critique` |

The `planner` agent physically cannot write code — OpenCode's permission engine enforces it. This is not a suggestion, it's a runtime block. The `builder` agent has full access but will refuse to start without an approved plan.

### The 6-phase gate

```
Phase 1 — DISCOVER
  Agent: planner
  Skill: use-case-analyzer
  Produces: docs/plans/<slug>/01-discovery.md
  Content: problem statement, users/personas, success criteria,
           functional/non-functional requirements, constraints,
           edge cases, out-of-scope, open questions

Phase 2 — PLAN
  Agent: planner
  Skill: architecture-planner (or immersive-experience-builder for cinematic)
  Produces: docs/plans/<slug>/02-plan.md
  Content: component breakdown, state management, data flow,
           routing, folder structure, API contracts, error handling,
           testing strategy, risks, rollout
  For cinematic: + Motion & Narrative Sequence (s11),
                  Execution tools per beat (s12),
                  3D/Animation Asset Manifest (s13)

Phase 3 — CHECKPOINT
  Agent: planner
  Action: presents plan, asks for human approval
  Rule: NO code may be written before this checkpoint is passed.
        The planner literally cannot write code — permission-enforced.

Phase 4 — BUILD
  Agent: builder
  Skill: component-builder (routes to correct gospel file(s))
  Rules applied: 03-enterprise-standards, 04-component-design,
                 06-design-tokens, 07-device-matrix, 08-asset-hygiene
  + situational gospel files (ui-gospel always, plus 3d/embedded/overlap/immersive as needed)
  MCP tools: Context7 (library docs), GitHub (PRs/issues)

Phase 5 — VERIFY
  Agent: builder
  Skill: enterprise-audit
  Produces: docs/plans/<slug>/05-verification.md
  Checks: typecheck, lint, tests, a11y, CWV budgets, device matrix,
          security, each gospel checklist section
  MCP tools: Playwright (screenshots, a11y queries, CLS/INP),
             Lighthouse (LCP, TBT, FCP)

Phase 6 — CRITIQUE (optional, immersive-tier only)
  Agent: critic (subagent, invoked by builder)
  Skill: creative-critique
  Produces: docs/plans/<slug>/06-critique.md
  Reviews: composition, timing, restraint, brand consistency
  Non-blocking: feature can ship without it
```

---

## File-by-file breakdown

### Agent layer (`agent/`)

| File | Purpose |
|---|---|
| `planner.md` | Default agent. Read-only. Asks questions first, produces discovery and plan docs. Permission-blocked from touching code. |
| `builder.md` | Build agent. Full edit/bash access. Builds against approved plans, runs MCP tools, verifies. |
| `critic.md` | Optional subagent. Read-only creative review of composition, timing, restraint, brand consistency. |

### Rules layer (`rules/`)

| File | Always? | What it governs |
|---|---|---|
| `00-workflow-gates.md` | Always | The single most important file: no code before approved plan. Scaling rules per feature size. Phase 6 critique gate. |
| `01-use-case-analysis.md` | Always | Required structure for discovery docs (problem, personas, success criteria, requirements, constraints, edge cases). |
| `02-architecture-planning.md` | Always | Required structure for plan docs (component breakdown, state, data flow, routing, error handling, testing, risks). Sections 11-13 for cinematic tier. |
| `03-enterprise-frontend-standards.md` | Always | Architecture conventions: folder structure, state management, error handling, WCAG 2.1 AA, performance, security, i18n. |
| `04-component-design.md` | Always | Component shape: composition over config, props API conventions, atomic-design layering, rationale comments, naming. |
| `05-verification-checklist.md` | Always | Verification template with sections for plan adherence, correctness, a11y, performance, security, rollout, honest gaps. |
| `06-design-tokens.md` | Always | Token standards for `tokens.json`: spacing scale, type scale, color palette with semantic aliases, motion tokens with named eases. No magic numbers. |
| `07-device-browser-matrix.md` | Always | Required test matrix (Android Chrome mid+low, iOS Safari, desktop Firefox/Safari, tablet). CWV budgets (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms). Hero canvas SSR/deferred hydration/content-visibility rules. |
| `08-asset-repository-hygiene.md` | Always | Git LFS vs CDN thresholds, kebab-case naming, cache-control headers, `.gitattributes` example. |
| `ui-gospel.md` | Always | Visual design rules distilled from *Refactoring UI*: spacing, typography, hierarchy, accessibility, depth/decoration. |
| `3d-gospel.md` | Situational | Three.js/WebGL correctness: lighting, performance, cleanup, anti-patterns. Sources from *Discover three.js* and official docs. |
| `embedded-3d-gospel.md` | Situational | Embedded `<model-viewer>` objects in 2D containers: auto-rotate delay, orbit clamps, zoom range, palette harmony, file size budget. |
| `overlap.md` | Situational | When 3D canvas + 2D UI chrome coexist: loading states, interaction handoff, z-indexing, text-over-canvas contrast. |
| `immersive-gospel.md` | Situational | Cinematic/scroll-driven tier: sequence-before-tools rule, beat format, tool selection table (GSAP/Framer/R3F/physics), realism checklist, motion design principles. |
| `3d-asset-pipeline.md` | Situational | Honest division of labor (agent can write code, cannot model in Blender), asset manifest spec, placeholder rule, cross-ref to asset hygiene. |

### Skills layer (`skills/`)

| Skill | Phase | What it does |
|---|---|---|
| `use-case-analyzer` | 1 — Discover | Reads `01-use-case-analysis.md`, gathers context, drafts `01-discovery.md`, flags open questions. Anti-patterns: naming libraries too early, vague success criteria. |
| `architecture-planner` | 2 — Plan | Reads `02-architecture-planning.md` and the discovery doc, drafts `02-plan.md` with explicit traceability to requirements. Must name a rejected alternative. |
| `immersive-experience-builder` | 2 (plan) + 4 (build) | For cinematic features. Step 0: don't pick a tool yet. Step 1: ground in use case. 2: design sequence beat by beat. 3: assign tools per beat. 4: asset manifest. 5: build against placeholders. 6: reduced-motion + low-end paths. 7: profile. |
| `component-builder` | 4 — Build | Step 0 routes to correct gospel file(s). Reads plan's component breakdown, builds against enterprise standards + selected gospel. Rationale comments required. Hand off to enterprise-audit when done. |
| `enterprise-audit` | 5 — Verify | Reads plan + discovery docs, runs checklist per gospel file used. Adds per-gospel checklist (ui-gospel, 3d, embedded, immersive, overlap, design-tokens, device-matrix, asset-hygiene). Produces `05-verification.md`. |
| `creative-critique` | 6 — Optional | Reviews composition, timing, restraint, brand consistency. Produces `06-critique.md`. Non-blocking. |

### MCP servers (`opencode.json`)

| Server | Enabled for | Purpose |
|---|---|---|
| **Playwright** | builder only | Browser automation during verification: navigate dev server, take screenshots, run a11y queries, measure CLS/INP |
| **GitHub** | builder only | Create PRs, manage issues, link verification docs |
| **Context7** | builder only | Search official library docs during build (React, Three.js, GSAP, Tailwind, Framer Motion) |
| **Lighthouse** | builder only | Measure Core Web Vitals (LCP, TBT, FCP) against budgets from `07-device-browser-matrix.md` |

All MCP servers are disabled by default to save context. The builder agent has them enabled via per-agent tool configuration. If a server is unavailable, the agent falls back to manual methods.

### CI / GitHub (`./github/`)

| File | Purpose |
|---|---|
| `workflows/phase-gate.yml` | Blocks PR merge if no approved `02-plan.md` exists. Extends the gate beyond the AI session into the actual repo workflow. |
| `workflows/verification.yml` | Runs typecheck, lint, tests on every PR. Checks that `05-verification.md` exists. |
| `pull_request_template.md` | PR template with gospel checklist: plan approval, verification doc, CWV budgets, gospel files used, screenshots. |

---

## Configuration (`opencode.json`)

The project's `opencode.json` is the central wiring. It:

- Sets `default_agent: "planner"` — you start in question-asking mode
- Loads 6 rule files + `ui-gospel.md` into every session's instructions
- Defines 4 MCP servers (all disabled by default, enabled for builder)
- Defines a custom `/init-project` command to kick off the workflow
- Defines 2 primary agents with permission scopes and skill allowlists
- Disables all MCP servers globally (saves context), enables them for builder only

```json
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "planner",
  "instructions": ["rules/00-workflow-gates.md", ...],
  "mcp": { "playwright": {...}, "github": {...}, ... },
  "command": { "init-project": {...} },
  "tools": { "playwright": false, ... },
  "agent": { "planner": {...}, "builder": {...} }
}
```

---

## The two layers of standards

### Layer 1: Enterprise (how code is built)

- `03-enterprise-frontend-standards.md` — folder structure, state classification, error boundaries, WCAG 2.1 AA, security, i18n
- `04-component-design.md` — composition over config, props API rules, layering (primitives → patterns → features), rationale comments
- `06-design-tokens.md` — no magic numbers, everything resolves to `tokens.json`
- `07-device-browser-matrix.md` — exact test matrix, CWV budgets, hero canvas rules
- `08-asset-repository-hygiene.md` — LFS/CDN thresholds, naming conventions, cache rules

### Layer 2: Gospel (how it looks and feels)

Selected by `component-builder`'s Step 0 based on the task type:

| Task type | Gospel files loaded |
|---|---|
| Pure 2D UI, no canvas | `ui-gospel.md` only |
| Full Three.js/WebGL scene | `ui-gospel.md` + `3d-gospel.md` |
| 3D object in 2D container | `ui-gospel.md` + `embedded-3d-gospel.md` |
| 3D canvas with UI chrome | `ui-gospel.md` + `embedded-3d-gospel.md` + `overlap.md` |
| Cinematic/heavily animated | Do not handle inline → invoke `immersive-experience-builder` skill |
| Required 3D asset | Also read `3d-asset-pipeline.md` |

---

## Capability comparison

### An AI *without* this project

| Scenario | What happens |
|---|---|
| "Build a landing page" | Picks React + Next.js + Tailwind by default, writes code immediately, chooses colors ad-hoc, ships what compiles |
| "Add a 3D shoe viewer" | Reaches for Three.js because it's impressive, not because it's right. May attempt to model the shoe. No loading state. No SSR poster. |
| "Make it smooth" | Adds GSAP or Framer Motion without understanding the narrative purpose. No reduced-motion support. No performance check. |
| "Ship it" | Considers it done when the dev server renders correctly. No verification against requirements, a11y, or performance budgets. |
| Next session | Starts fresh. No memory of past design decisions. Conventions drift. |

### An AI *with* this project

| Scenario | What happens |
|---|---|
| "Build a landing page" | Planner asks: product? audience? brand feel? references? 3D needed? Produces discovery doc → plan doc → asks approval. Then builder builds with enterprise standards + design tokens + CWV budgets. |
| "Add a 3D shoe viewer" | `component-builder`'s Step 0 routes to `embedded-3d-gospel.md`. Uses `<model-viewer>`, not a full Three.js scene. Adds SSR poster image, deferred hydration, auto-rotate with `tokens.motion.autoRotate.delay`. |
| "Make it smooth" | `immersive-experience-builder` enforces: use case → narrative sequence → tool assignment. Each beat has a stated purpose, reduced-motion equivalent, and performance budget. |
| "Ship it" | `enterprise-audit` runs typecheck, lint, tests, a11y scan, Playwright screenshots across device matrix, Lighthouse CWV measurement. Produces `05-verification.md` with checkboxes. |
| Next session | All conventions persist in the repo. `AGENTS.md`, `opencode.json`, `rules/` carry over. Every feature follows the same structure. |

---

## How to use this as a GitHub template

1. Push this repo to GitHub (already configured as `NKS01X/frontend-gospel`):

```bash
git add .
git commit -m "Initial gospel setup: agents, rules, skills, MCP, CI"
git push origin main
```

2. Go to https://github.com/NKS01X/frontend-gospel → **Settings** → scroll to **Template repository** → check the box.

3. Now when you want to start a new project:
   - Click **"Use this template"** on the GitHub repo page
   - Name your new repo
   - Clone it: `git clone https://github.com/you/new-repo.git`
   - `cd new-repo` and `opencode`
   - Type `/init-project`
   - Answer the planner's questions
   - Approve the plan
   - Tab to builder
   - Done.

---

## What you need to do

After I push:

1. **Go to** https://github.com/NKS01X/frontend-gospel
2. **Settings → check "Template repository"**
3. **Optional — set up MCP credentials:**
   - For GitHub MCP: `export GITHUB_TOKEN=ghp_...`
   - For Context7: sign up at context7.com, `export CONTEXT7_API_KEY=...`
   - For Playwright: `npx playwright install chromium` (one-time)
   - See `docs/mcp-setup.md` for full details
4. **Start a new project:**
   - Click "Use this template" on GitHub
   - Clone the new repo
   - Run `opencode`
   - Type `/init-project`
   - Answer the planner's questions
5. **When the planner asks you about the project** — be detailed. The quality of everything downstream depends on your answers. Mention if you want 3D, animation, cinematic effects, specific visual references, target audience, brand personality, etc.

That's it. The agents handle everything else — planning, building, verifying, and optionally critiquing.

---

## Credits

- **UI design rules** (`ui-gospel.md`) — distilled from [*Refactoring UI*](https://refactoringui.com/) by Steve Schoger & Adam Wathan
- **Three.js rules** (`3d-gospel.md`) — follow [*Discover three.js*](https://discoverthreejs.com/) by Lewy Blue and the [official three.js documentation](https://threejs.org/docs/)
- **Embedded 3D rules** (`embedded-3d-gospel.md`) — sourced from [`<model-viewer>` docs](https://modelviewer.dev/docs/) and the [Shopify Help Center](https://help.shopify.com/)
- **OpenCode** — the open-source AI coding agent this kit extends: [opencode.ai](https://opencode.ai)
