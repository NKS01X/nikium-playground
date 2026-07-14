# Nikium Playground

[nikium-playground.iamnikhil.dev](https://nikium-playground.iamnikhil.dev)

Interactive tutorial platform for the Nikium programming language — write, run, and learn Nikium in the browser with WebAssembly execution and server fallback.

The main interpreter, compiler design, and specification of the language are hosted in the primary repository: [Nikium (NKS01X/Nikium)](https://github.com/NKS01X/Nikium). This playground serves as a browser-based environment to run Nikium code, complete lessons, and examine execution outputs.

## Architecture

The playground is structured into three components:

1. **Frontend (Vite/React)**: A web interface hosting a syntax-highlighted editor (using CodeMirror), resizable panels, and structured programming lessons. Deployed to Cloudflare Pages.
2. **WebAssembly Worker**: A compiled version of the Go Nikium interpreter running in a browser Web Worker to achieve near-zero-latency client-side execution.
3. **Backend Server (Go)**: A stateless runner server with integrated SQLite/Turso database support for user authentication, handling standard input streams, and executing features unsupported by the WASM sandbox (such as system file I/O). Deployed to Render.

### Execution Routing

Code execution is prioritized client-side to minimize network overhead and server load:
* Code runs inside the local Web Worker by default.
* If standard input (`stdin`) is supplied, or if the code requests a feature that is not implemented in the JS runtime (returning a `not implemented on js` error), the runner transparently redirects execution to the backend runner server.

## Project Structure

```text
├── ast/                  # Abstract Syntax Tree nodes for Nikium
├── lexer/                # Lexical scanner for source code tokenization
├── parser/               # Recursive descent Pratt parser implementation
├── evaluator/            # Abstract syntax tree tree-walk evaluator
├── token/                # Lexer tokens definitions
├── memory/               # Native allocator and memory model for Go-side execution
├── cmd/
│   └── server/           # Go HTTP backend runner server
├── wasm/                 # WebAssembly entry point and prepackaged standard library
└── frontend/             # React & TypeScript client (Vite, CodeMirror, Tailwind CSS)
```

## Development Setup

### Prerequisites
* Go 1.25.0 or later
* Node.js 20 or later
* npm

### Running the Backend Server
Copy the environment template and define your configuration:
```bash
cp .env.example .env
```
Start the server locally:
```bash
go run ./cmd/server/main.go
```
The server will run on port `8080` by default.

### Running the Frontend
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

### Rebuilding the WebAssembly Module
The WASM module (`frontend/public/nikium.wasm`) is loaded by the Web Worker. To rebuild it after changes to the lexer, parser, or evaluator:
```bash
GOOS=js GOARCH=wasm go build -o frontend/public/nikium.wasm ./wasm
```

## Deployment

The project is configured for automated deployment via GitHub Actions:
* **Frontend**: Pushed to Cloudflare Pages using Wrangler (`.github/workflows/deploy.yml`).
* **Backend**: Hosted on Render via containerized deployment (`render.yaml`).
