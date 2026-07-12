/// <reference lib="webworker" />

importScripts('/wasm_exec.js')

let wasmReady = false
let initPromise: Promise<boolean> | null = null

function initWasm(): Promise<boolean> {
  if (wasmReady) return Promise.resolve(true)
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      if (!(self as any).Go) {
        console.warn('wasm_exec.js not loaded properly in worker')
        return false
      }
      const go = new (self as any).Go()
      const resp = await fetch('/nikium.wasm')
      if (!resp.ok) {
        console.warn('nikium.wasm not found')
        return false
      }
      const mod = await WebAssembly.instantiateStreaming(resp, go.importObject)
      go.run(mod.instance)
      wasmReady = true
      return true
    } catch (err) {
      console.warn('WASM init failed in worker:', err)
      return false
    }
  })()
  return initPromise
}

self.addEventListener('message', async (event: MessageEvent) => {
  const code = typeof event.data === 'string' ? event.data : event.data.code
  const ready = await initWasm()

  if (!ready) {
    self.postMessage(JSON.stringify({ error: 'WASM initialization failed', output: '' }))
    return
  }

  const fn = (self as any).nikiumRun
  if (!fn) {
    self.postMessage(JSON.stringify({ error: 'nikiumRun not exported by WASM', output: '' }))
    return
  }

  try {
    const resultStr = fn(code)
    self.postMessage(resultStr)
  } catch (err) {
    self.postMessage(JSON.stringify({ error: `WASM execution error: ${err}`, output: '' }))
  }
})
