import type { RunResult } from '../types'

let worker: Worker | null = null

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./nikium.worker.ts', import.meta.url))
  }
  return worker
}

export async function runNikium(code: string, input: string = ''): Promise<RunResult> {
  const start = performance.now()

  // WASM can't handle stdin, so route to server when input is provided
  if (input) {
    return fallbackToServer(code, input, start)
  }

  const w = getWorker()

  return new Promise<RunResult>((resolve) => {
    let handled = false
    const cleanup = () => {
      w.terminate()
      worker = null
    }

    const timeoutId = setTimeout(() => {
      if (handled) return
      handled = true
      cleanup()
      const duration = performance.now() - start
      resolve({
        output: '',
        error: 'Execution timed out (10s limit). Infinite loop detected!',
        duration,
        source: 'wasm'
      })
    }, 10000)

    w.onmessage = (event) => {
      if (handled) return
      handled = true
      clearTimeout(timeoutId)
      cleanup()

      const duration = performance.now() - start
      try {
        const data = JSON.parse(event.data)
        if (data.error && data.error.includes('not implemented on js')) {
          resolve(fallbackToServer(code, '', start))
          return
        }
        resolve({ output: data.output || '', error: data.error || '', duration, source: 'wasm' })
      } catch (err) {
        if (err instanceof SyntaxError) {
          resolve({ output: event.data, error: '', duration, source: 'wasm' })
          return
        }
        resolve({ output: '', error: `Worker parse error: ${err}`, duration, source: 'wasm' })
      }
    }

    w.postMessage(code)
  })
}

async function fallbackToServer(code: string, input: string, start: number): Promise<RunResult> {
  const serverUrl = import.meta.env.VITE_SERVER_URL
  if (!serverUrl) {
    return {
      output: '',
      error: 'Unsupported WASM feature (e.g. system I/O) and no execution backend available',
      duration: performance.now() - start,
      source: 'server',
    }
  }

  try {
    const resp = await fetch(`${serverUrl}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, input }),
    })
    const data = await resp.json()
    return { output: data.output || '', error: data.error || '', duration: performance.now() - start, source: 'server' }
  } catch (err) {
    return { output: '', error: `Server error: ${err}`, duration: performance.now() - start, source: 'server' }
  }
}
