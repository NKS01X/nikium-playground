package main

import (
	"bytes"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"Nikium/evaluator"
	"Nikium/lexer"
	"Nikium/parser"

	"github.com/joho/godotenv"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB
var dbAvailable bool

// --- Models ---

type RunRequest struct {
	Code  string `json:"code"`
	Input string `json:"input,omitempty"`
}

type RunResponse struct {
	Output string `json:"output,omitempty"`
	Error  string `json:"error,omitempty"`
}

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name,omitempty"`
}

type AuthResponse struct {
	Token string `json:"token,omitempty"`
	User  *User  `json:"user,omitempty"`
	Error string `json:"error,omitempty"`
}

type User struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

// --- Main ---

func main() {
	godotenv.Load()

	connStr := os.Getenv("TURSO_DATABASE_URL")
	authToken := os.Getenv("TURSO_AUTH_TOKEN")

	if connStr == "" {
		connStr = "libsql://nikium-playground.turso.io"
	}

	dsn := connStr
	if authToken != "" {
		authToken = strings.TrimSpace(authToken)
		dsn = connStr + "?authToken=" + url.QueryEscape(authToken)
	}

	var err error
	db, err = sql.Open("libsql", dsn)
	if err != nil {
		log.Println("Warning: Unable to open database connection — auth endpoints disabled")
	} else if err := db.Ping(); err != nil {
		log.Println("Warning: Unable to ping database — auth endpoints disabled")
		db.Close()
	} else {
		log.Println("Connected to Turso database")
		dbAvailable = true
		initDB()
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/run", corsMiddleware(handleRun))
	mux.HandleFunc("/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}))
	mux.HandleFunc("/signup", corsMiddleware(handleSignup))
	mux.HandleFunc("/login", corsMiddleware(handleLogin))
	mux.HandleFunc("/me", corsMiddleware(handleMe))

	addr := ":" + port
	log.Printf("Nikium server listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

// --- Database ---

func initDB() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			email TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TEXT DEFAULT (datetime('now'))
		)`,
		`CREATE TABLE IF NOT EXISTS tokens (
			token TEXT PRIMARY KEY,
			email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
			created_at TEXT DEFAULT (datetime('now'))
		)`,
	}
	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Failed to init DB: %v", err)
		}
	}
}

func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// --- CORS ---

var allowedOrigins = map[string]bool{
	"https://nikium-playground.iamnikhil.dev":     true,
	"https://www.nikium-playground.iamnikhil.dev": true,
	"https://nikium-playground.pages.dev":         true,
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

// --- Auth Middleware ---

func getUserFromToken(r *http.Request) *User {
	token := r.Header.Get("Authorization")
	if token == "" || !strings.HasPrefix(token, "Bearer ") {
		return nil
	}
	token = strings.TrimPrefix(token, "Bearer ")

	var user User
	err := db.QueryRow(`
		SELECT u.email, u.name FROM tokens t
		JOIN users u ON u.email = t.email
		WHERE t.token = ?
	`, token).Scan(&user.Email, &user.Name)
	if err != nil {
		return nil
	}
	return &user
}

// --- Handlers ---

func handleSignup(w http.ResponseWriter, r *http.Request) {
	if !dbAvailable {
		writeJSON(w, http.StatusServiceUnavailable, AuthResponse{Error: "database not available"})
		return
	}
	if r.Method != "POST" {
		writeJSON(w, http.StatusMethodNotAllowed, AuthResponse{Error: "method not allowed"})
		return
	}

	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, AuthResponse{Error: "invalid request body"})
		return
	}

	if req.Email == "" || req.Password == "" || req.Name == "" {
		writeJSON(w, http.StatusBadRequest, AuthResponse{Error: "email, name, and password are required"})
		return
	}

	if len(req.Password) < 4 {
		writeJSON(w, http.StatusBadRequest, AuthResponse{Error: "password must be at least 4 characters"})
		return
	}

	var exists bool
	db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)", req.Email).Scan(&exists)
	if exists {
		writeJSON(w, http.StatusConflict, AuthResponse{Error: "an account with this email already exists"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, AuthResponse{Error: "internal error"})
		return
	}

	_, err = db.Exec("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
		req.Email, req.Name, string(hash))
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, AuthResponse{Error: "failed to create account"})
		return
	}

	token := generateToken()
	_, err = db.Exec("INSERT INTO tokens (token, email) VALUES (?, ?)", token, req.Email)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, AuthResponse{Error: "failed to create session"})
		return
	}

	writeJSON(w, http.StatusCreated, AuthResponse{
		Token: token,
		User:  &User{Email: req.Email, Name: req.Name},
	})
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if !dbAvailable {
		writeJSON(w, http.StatusServiceUnavailable, AuthResponse{Error: "database not available"})
		return
	}
	if r.Method != "POST" {
		writeJSON(w, http.StatusMethodNotAllowed, AuthResponse{Error: "method not allowed"})
		return
	}

	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, AuthResponse{Error: "invalid request body"})
		return
	}

	var name, hash string
	err := db.QueryRow("SELECT name, password_hash FROM users WHERE email = ?", req.Email).Scan(&name, &hash)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, AuthResponse{Error: "no account found with this email"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		writeJSON(w, http.StatusUnauthorized, AuthResponse{Error: "incorrect password"})
		return
	}

	token := generateToken()
	_, err = db.Exec("INSERT INTO tokens (token, email) VALUES (?, ?)", token, req.Email)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, AuthResponse{Error: "failed to create session"})
		return
	}

	writeJSON(w, http.StatusOK, AuthResponse{
		Token: token,
		User:  &User{Email: req.Email, Name: name},
	})
}

func handleMe(w http.ResponseWriter, r *http.Request) {
	if !dbAvailable {
		writeJSON(w, http.StatusServiceUnavailable, AuthResponse{Error: "database not available"})
		return
	}
	user := getUserFromToken(r)
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, AuthResponse{Error: "not authenticated"})
		return
	}
	writeJSON(w, http.StatusOK, AuthResponse{User: user})
}

func handleRun(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		writeJSON(w, http.StatusMethodNotAllowed, RunResponse{Error: "method not allowed"})
		return
	}

	var req RunRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, RunResponse{Error: "invalid request body"})
		return
	}

	output, err := executeCode(req.Code, req.Input)
	resp := RunResponse{Output: output}
	if err != nil {
		resp.Error = err.Error()
	}

	writeJSON(w, http.StatusOK, resp)
}

// --- Code Execution ---

var execMu sync.Mutex

func executeCode(code string, stdinput string) (string, error) {
	execMu.Lock()
	defer execMu.Unlock()

	var buf bytes.Buffer
	evaluator.Stdout = &buf

	// Prepare input lines
	inputLines := strings.Split(stdinput, "\n")
	inputMu := sync.Mutex{}
	inputIndex := 0

	readNextLine := func() string {
		inputMu.Lock()
		defer inputMu.Unlock()
		if inputIndex >= len(inputLines) {
			return ""
		}
		line := inputLines[inputIndex]
		inputIndex++
		return line
	}

	readNextChar := func() string {
		inputMu.Lock()
		defer inputMu.Unlock()
		for inputIndex < len(inputLines) {
			line := inputLines[inputIndex]
			if len(line) > 0 {
				inputLines[inputIndex] = line[1:]
				return string(line[0])
			}
			inputIndex++
		}
		return ""
	}

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

			env.Set("readline", &evaluator.Function{
				Native: func(args []evaluator.Object) evaluator.Object {
					return &evaluator.String{Value: readNextLine()}
				},
			})
			env.Set("readchar", &evaluator.Function{
				Native: func(args []evaluator.Object) evaluator.Object {
					return &evaluator.String{Value: readNextChar()}
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

// --- Helpers ---

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
