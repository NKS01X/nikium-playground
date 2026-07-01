import type { RunResult } from '../types'

let wasmReady = false
let initPromise: Promise<boolean> | null = null

function initWasm(): Promise<boolean> {
  if (wasmReady) return Promise.resolve(true)
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      if (!(window as any).Go) {
        console.warn('wasm_exec.js not loaded')
        return false
      }

      const go = new (window as any).Go()

      const resp = await fetch('/nikium.wasm')
      if (!resp.ok) {
        console.warn('nikium.wasm not found at /nikium.wasm')
        return false
      }

      const mod = await WebAssembly.instantiateStreaming(resp, go.importObject)
      go.run(mod.instance)
      wasmReady = true
      return true
    } catch (err) {
      console.warn('WASM init failed:', err)
      return false
    }
  })()

  return initPromise
}

function callNikiumWasm(code: string): string {
  const fn = (window as any).nikiumRun
  if (!fn) throw new Error('nikiumRun not found in WASM exports')
  const result = fn(code)
  if (typeof result === 'string') return result
  return String(result)
}

export async function runNikium(code: string): Promise<RunResult> {
  const start = performance.now()

  const wasmOk = await initWasm()
  if (wasmOk) {
    try {
      const output = callNikiumWasm(code)
      const duration = performance.now() - start
      return { output, error: '', duration, source: 'wasm' }
    } catch (err) {
      console.warn('WASM execution failed, falling back to server:', err)
    }
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL
  if (!serverUrl) {
    const duration = performance.now() - start
    return {
      output: '',
      error: 'No execution backend available. Set VITE_SERVER_URL in environment.',
      duration,
      source: 'server',
    }
  }

  try {
    const resp = await fetch(`${serverUrl}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await resp.json()
    const duration = performance.now() - start
    return { output: data.output || '', error: data.error || '', duration, source: 'server' }
  } catch (err) {
    const duration = performance.now() - start
    return { output: '', error: `Server error: ${err}`, duration, source: 'server' }
  }
}
