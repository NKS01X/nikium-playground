package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"Nikium/evaluator"
	"Nikium/lexer"
	"Nikium/parser"
)

type RunRequest struct {
	Code string `json:"code"`
}

type RunResponse struct {
	Output string `json:"output,omitempty"`
	Error  string `json:"error,omitempty"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/run", corsMiddleware(handleRun))
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	addr := ":" + port
	log.Printf("Nikium server listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func handleRun(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		jsonError(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	output, err := executeCode(req.Code)
	resp := RunResponse{Output: output}
	if err != nil {
		resp.Error = err.Error()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

var execMu sync.Mutex

func executeCode(code string) (string, error) {
	execMu.Lock()
	defer execMu.Unlock()

	var buf bytes.Buffer
	evaluator.Stdout = &buf

	done := make(chan error, 1)
	go func() {
		defer func() {
			if r := recover(); r != nil {
				done <- fmt.Errorf("panic: %v", r)
			}
		}()
		done <- func() error {
			defer func() {
				evaluator.Stdout = os.Stdout
			}()

			l := lexer.New(code)
			p := parser.New(l)
			program := p.ParseProgram()

			if len(p.Errors()) != 0 {
				return fmt.Errorf("parse error: %s", strings.Join(p.Errors(), "\n"))
			}

			env := evaluator.NewEnvironment()
			defer env.Destroy()

			// Disable stdin reading on the server to prevent the process from hanging forever
			env.Set("readline", &evaluator.Function{
				Native: func(args []evaluator.Object) evaluator.Object {
					return &evaluator.String{Value: ""}
				},
			})
			env.Set("readchar", &evaluator.Function{
				Native: func(args []evaluator.Object) evaluator.Object {
					return &evaluator.String{Value: ""}
				},
			})

			if absPath, err := filepath.Abs(os.Args[0]); err == nil {
				env.ScriptDir = filepath.Dir(absPath)
			}

			result := evaluator.Eval(program, env)
			if result != nil && result.Type() == evaluator.ERROR_OBJ {
				return fmt.Errorf("%s", result.Inspect())
			}

			return nil
		}()
	}()

	var runErr error
	select {
	case runErr = <-done:
	case <-time.After(10 * time.Second):
		runErr = fmt.Errorf("execution timed out (10s limit)")
	}

	evaluator.Stdout = os.Stdout

	output := strings.TrimSpace(buf.String())
	return output, runErr
}

func jsonError(w http.ResponseWriter, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(RunResponse{Error: msg})
}
