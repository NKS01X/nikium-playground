package evaluator

import (
	"Nikium/memory"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"
)


// --- Async state ---

var (
	asyncMu     sync.Mutex
	asyncNextID int64
	asyncJobs   = make(map[int64]chan Object)
)

type Environment struct {
	store     map[string]Object
	outer     *Environment
	arena     *memory.Arena // root env only; nil in enclosed envs
	ScriptDir string        // directory of the main script, for resolving load paths
}

// Destroy releases the arena's OS memory. Call once when the root environment is done.
func (e *Environment) Destroy() error {
	if e != nil && e.arena != nil {
		return e.arena.Destroy()
	}
	return nil
}

func NewEnvironment() *Environment {
	s := make(map[string]Object)
	arena, _ := memory.NewArena(memory.DefaultArenaSize)
	env := &Environment{store: s, outer: nil, arena: arena}
	env.Set("NULL", NULL)
	env.Set("null", NULL)
	env.Set("readchar", &Function{
		Native: nativeReadChar,
	})
	env.Set("len", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{
					Message: fmt.Sprintf("len: expected 1 argument, got %d", len(args)),
				}
			}
			switch arg := args[0].(type) {
			case *String:
				return &Integer{Value: int64(len(arg.Value))}
			case *Array:
				return &Integer{Value: int64(len(arg.Elements))}
			case *Hash:
				return &Integer{Value: int64(len(arg.Pairs))}
			default:
				return &Error{
					Message: fmt.Sprintf("len: unsupported type %s", arg.Type()),
				}
			}
		},
	})
	env.Set("readline", &Function{
		Native: nativeReadLine,
	})

	env.Set("Print", &Function{
		Native: func(args []Object) Object {
			for _, arg := range args {
				fmt.Fprint(Stdout, arg.Inspect(), " ")
			}
			fmt.Fprintln(Stdout)
			return NULL
		},
	})

	env.Set("push", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: fmt.Sprintf("push: expected 2 arguments, got %d", len(args))}
			}
			arr, ok := args[0].(*Array)
			if !ok {
				return &Error{Message: "push: first argument must be an array"}
			}
			newElements := make([]Object, len(arr.Elements)+1)
			copy(newElements, arr.Elements)
			newElements[len(arr.Elements)] = args[1]
			return &Array{Elements: newElements}
		},
	})

	env.Set("ord", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: fmt.Sprintf("ord: expected 1 argument, got %d", len(args))}
			}
			s, ok := args[0].(*String)
			if !ok || len(s.Value) == 0 {
				return &Error{Message: "ord: expected non-empty string"}
			}
			return &Integer{Value: int64(s.Value[0])}
		},
	})

	env.Set("chr", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: fmt.Sprintf("chr: expected 1 argument, got %d", len(args))}
			}
			n, ok := args[0].(*Integer)
			if !ok {
				return &Error{Message: "chr: expected integer"}
			}
			return &String{Value: string(rune(n.Value))}
		},
	})

	// --- File IO ---

	env.Set("file_read", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: fmt.Sprintf("file_read: expected 1 argument, got %d", len(args))}
			}
			path, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "file_read: expected string path"}
			}
			data, err := os.ReadFile(path.Value)
			if err != nil {
				return &Error{Message: fmt.Sprintf("file_read: %s", err)}
			}
			return &String{Value: string(data)}
		},
	})

	env.Set("file_write", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: fmt.Sprintf("file_write: expected 2 arguments, got %d", len(args))}
			}
			path, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "file_write: first argument must be string path"}
			}
			data, ok := args[1].(*String)
			if !ok {
				return &Error{Message: "file_write: second argument must be string data"}
			}
			err := os.WriteFile(path.Value, []byte(data.Value), 0644)
			if err != nil {
				return &Error{Message: fmt.Sprintf("file_write: %s", err)}
			}
			return NULL
		},
	})

	env.Set("file_append", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: fmt.Sprintf("file_append: expected 2 arguments, got %d", len(args))}
			}
			path, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "file_append: first argument must be string path"}
			}
			data, ok := args[1].(*String)
			if !ok {
				return &Error{Message: "file_append: second argument must be string data"}
			}
			f, err := os.OpenFile(path.Value, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
			if err != nil {
				return &Error{Message: fmt.Sprintf("file_append: %s", err)}
			}
			defer f.Close()
			_, err = f.WriteString(data.Value)
			if err != nil {
				return &Error{Message: fmt.Sprintf("file_append: %s", err)}
			}
			return NULL
		},
	})

	env.Set("file_exists", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "file_exists: expected 1 argument"}
			}
			path, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "file_exists: expected string path"}
			}
			_, err := os.Stat(path.Value)
			if os.IsNotExist(err) {
				return FALSE
			}
			return TRUE
		},
	})

	env.Set("file_delete", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "file_delete: expected 1 argument"}
			}
			path, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "file_delete: expected string path"}
			}
			err := os.Remove(path.Value)
			if err != nil {
				return &Error{Message: fmt.Sprintf("file_delete: %s", err)}
			}
			return NULL
		},
	})

	// --- Time ---

	env.Set("time_now", &Function{
		Native: func(args []Object) Object {
			return &Integer{Value: time.Now().UnixMilli()}
		},
	})

	env.Set("time_sleep", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "time_sleep: expected 1 argument (ms)"}
			}
			ms, ok := args[0].(*Integer)
			if !ok {
				return &Error{Message: "time_sleep: expected integer milliseconds"}
			}
			time.Sleep(time.Duration(ms.Value) * time.Millisecond)
			return NULL
		},
	})

	env.Set("time_format", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "time_format: expected 1 argument (unix_ms)"}
			}
			ms, ok := args[0].(*Integer)
			if !ok {
				return &Error{Message: "time_format: expected integer"}
			}
			t := time.UnixMilli(ms.Value)
			return &String{Value: t.Format("2006-01-02 15:04:05")}
		},
	})

	// --- Concurrency ---

	env.Set("spawn", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "spawn: expected 1 argument (function)"}
			}
			fn, ok := args[0].(*Function)
			if !ok {
				return &Error{Message: "spawn: expected function"}
			}

			asyncMu.Lock()
			asyncNextID++
			id := asyncNextID
			ch := make(chan Object, 1)
			asyncJobs[id] = ch
			asyncMu.Unlock()

			go func() {
				result := applyFunction(fn, []Object{}, "")
				ch <- result
			}()

			return &Integer{Value: id}
		},
	})

	env.Set("await", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "await: expected 1 argument (task id)"}
			}
			id, ok := args[0].(*Integer)
			if !ok {
				return &Error{Message: "await: expected integer id"}
			}

			asyncMu.Lock()
			ch, exists := asyncJobs[id.Value]
			asyncMu.Unlock()

			if !exists {
				return &Error{Message: fmt.Sprintf("await: no task with id %d", id.Value)}
			}

			result := <-ch

			asyncMu.Lock()
			delete(asyncJobs, id.Value)
			asyncMu.Unlock()

			return result
		},
	})

	// --- Network ---

	env.Set("net_get", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "net_get: expected 1 argument (url)"}
			}
			url, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "net_get: expected string url"}
			}
			resp, err := http.Get(url.Value)
			if err != nil {
				return &Error{Message: fmt.Sprintf("net_get: %s", err)}
			}
			defer resp.Body.Close()
			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return &Error{Message: fmt.Sprintf("net_get: %s", err)}
			}
			return &String{Value: string(body)}
		},
	})

	env.Set("net_status", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "net_status: expected 1 argument (url)"}
			}
			url, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "net_status: expected string url"}
			}
			resp, err := http.Get(url.Value)
			if err != nil {
				return &Error{Message: fmt.Sprintf("net_status: %s", err)}
			}
			defer resp.Body.Close()
			return &Integer{Value: int64(resp.StatusCode)}
		},
	})

	// --- Build ---

	env.Set("build", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "build: expected 1 argument (shell command)"}
			}
			cmdStr, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "build: expected string command"}
			}
			cmd := exec.Command("sh", "-c", cmdStr.Value)
			output, err := cmd.CombinedOutput()
			if err != nil {
				return &Error{Message: fmt.Sprintf("build: %s\n%s", err, string(output))}
			}
			return &String{Value: string(output)}
		},
	})

	// --- Hash helpers ---

	env.Set("keys", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "keys: expected 1 argument"}
			}
			h, ok := args[0].(*Hash)
			if !ok {
				return &Error{Message: "keys: expected hash"}
			}
			keys := []Object{}
			for _, pair := range h.Pairs {
				keys = append(keys, pair.Key)
			}
			return &Array{Elements: keys}
		},
	})

	env.Set("values", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "values: expected 1 argument"}
			}
			h, ok := args[0].(*Hash)
			if !ok {
				return &Error{Message: "values: expected hash"}
			}
			vals := []Object{}
			for _, pair := range h.Pairs {
				vals = append(vals, pair.Value)
			}
			return &Array{Elements: vals}
		},
	})

	env.Set("has_key", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: "has_key: expected 2 arguments (hash, key)"}
			}
			h, ok := args[0].(*Hash)
			if !ok {
				return &Error{Message: "has_key: first argument must be hash"}
			}
			hashable, ok := args[1].(Hashable)
			if !ok {
				return &Error{Message: "has_key: key not hashable"}
			}
			_, exists := h.Pairs[hashable.HashKey()]
			return nativeBoolToBooleanObject(exists)
		},
	})

	env.Set("set", &Function{
		Native: func(args []Object) Object {
			if len(args) != 3 {
				return &Error{Message: "set: expected 3 arguments (hash, key, value)"}
			}
			h, ok := args[0].(*Hash)
			if !ok {
				return &Error{Message: "set: first argument must be hash"}
			}
			hashable, ok := args[1].(Hashable)
			if !ok {
				return &Error{Message: "set: key not hashable"}
			}
			newPairs := make(map[HashKey]HashPair)
			for k, v := range h.Pairs {
				newPairs[k] = v
			}
			hk := hashable.HashKey()
			newPairs[hk] = HashPair{Key: args[1], Value: args[2]}
			return &Hash{Pairs: newPairs}
		},
	})

	env.Set("delete_key", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: "delete_key: expected 2 arguments (hash, key)"}
			}
			h, ok := args[0].(*Hash)
			if !ok {
				return &Error{Message: "delete_key: first argument must be hash"}
			}
			hashable, ok := args[1].(Hashable)
			if !ok {
				return &Error{Message: "delete_key: key not hashable"}
			}
			newPairs := make(map[HashKey]HashPair)
			for k, v := range h.Pairs {
				newPairs[k] = v
			}
			delete(newPairs, hashable.HashKey())
			return &Hash{Pairs: newPairs}
		},
	})

	// --- Utility ---

	env.Set("type", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "type: expected 1 argument"}
			}
			return &String{Value: string(args[0].Type())}
		},
	})

	env.Set("str", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "str: expected 1 argument"}
			}
			return &String{Value: args[0].Inspect()}
		},
	})

	env.Set("int_parse", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "int_parse: expected 1 argument"}
			}
			s, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "int_parse: expected string"}
			}
			val, err := strconv.ParseInt(strings.TrimSpace(s.Value), 10, 64)
			if err != nil {
				return &Error{Message: fmt.Sprintf("int_parse: %s", err)}
			}
			return &Integer{Value: val}
		},
	})

	env.Set("exit", &Function{
		Native: func(args []Object) Object {
			code := 0
			if len(args) == 1 {
				if n, ok := args[0].(*Integer); ok {
					code = int(n.Value)
				}
			}
			os.Exit(code)
			return NULL
		},
	})

	env.Set("ARGV", &Array{Elements: []Object{}})

	env.Set("json_stringify", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "json_stringify: expected 1 argument"}
			}
			goVal, err := objectToGoValue(args[0])
			if err != nil {
				return &Error{Message: fmt.Sprintf("json_stringify: %s", err)}
			}
			data, err := json.Marshal(goVal)
			if err != nil {
				return &Error{Message: fmt.Sprintf("json_stringify: %s", err)}
			}
			return &String{Value: string(data)}
		},
	})

	env.Set("json_parse", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "json_parse: expected 1 argument"}
			}
			strObj, ok := args[0].(*String)
			if !ok {
				return &Error{Message: "json_parse: expected string"}
			}
			var goVal interface{}
			if err := json.Unmarshal([]byte(strObj.Value), &goVal); err != nil {
				return &Error{Message: fmt.Sprintf("json_parse: %s", err)}
			}
			return goValueToObject(goVal)
		},
	})

	env.Set("bit_and", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: "bit_and: expected 2 arguments"}
			}
			a, ok1 := args[0].(*Integer)
			b, ok2 := args[1].(*Integer)
			if !ok1 || !ok2 {
				return &Error{Message: "bit_and: arguments must be integers"}
			}
			return &Integer{Value: a.Value & b.Value}
		},
	})

	env.Set("bit_or", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: "bit_or: expected 2 arguments"}
			}
			a, ok1 := args[0].(*Integer)
			b, ok2 := args[1].(*Integer)
			if !ok1 || !ok2 {
				return &Error{Message: "bit_or: arguments must be integers"}
			}
			return &Integer{Value: a.Value | b.Value}
		},
	})

	env.Set("bit_xor", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: "bit_xor: expected 2 arguments"}
			}
			a, ok1 := args[0].(*Integer)
			b, ok2 := args[1].(*Integer)
			if !ok1 || !ok2 {
				return &Error{Message: "bit_xor: arguments must be integers"}
			}
			return &Integer{Value: a.Value ^ b.Value}
		},
	})

	env.Set("bit_not", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "bit_not: expected 1 argument"}
			}
			a, ok := args[0].(*Integer)
			if !ok {
				return &Error{Message: "bit_not: argument must be an integer"}
			}
			return &Integer{Value: ^a.Value}
		},
	})

	// --- Memory builtins ---

	env.Set("mem_alloc", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "mem_alloc: expected 1 argument (size)"}
			}
			n, ok := args[0].(*Integer)
			if !ok || n.Value <= 0 {
				return &Error{Message: "mem_alloc: expected positive integer size"}
			}
			a := env.rootArena()
			if a == nil {
				return &Error{Message: "mem_alloc: no arena available"}
			}
			ptr := a.Malloc(uint(n.Value))
			if ptr == 0 {
				return &Error{Message: "mem_alloc: out of memory"}
			}
			return &Integer{Value: int64(ptr)}
		},
	})

	env.Set("mem_free", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "mem_free: expected 1 argument (pointer)"}
			}
			n, ok := args[0].(*Integer)
			if !ok {
				return &Error{Message: "mem_free: expected integer pointer"}
			}
			if a := env.rootArena(); a != nil {
				a.Free(uintptr(n.Value))
			}
			return NULL
		},
	})

	env.Set("mem_write", &Function{
		Native: func(args []Object) Object {
			if len(args) != 3 {
				return &Error{Message: "mem_write: expected 3 arguments (ptr, offset, value)"}
			}
			ptr, ok1 := args[0].(*Integer)
			offset, ok2 := args[1].(*Integer)
			val, ok3 := args[2].(*Integer)
			if !ok1 || !ok2 || !ok3 {
				return &Error{Message: "mem_write: all arguments must be integers"}
			}
			a := env.rootArena()
			if a == nil {
				return &Error{Message: "mem_write: no arena available"}
			}
			if err := a.WriteInt64(uintptr(ptr.Value), uintptr(offset.Value), val.Value); err != nil {
				return &Error{Message: "mem_write: " + err.Error()}
			}
			return NULL
		},
	})

	env.Set("mem_read", &Function{
		Native: func(args []Object) Object {
			if len(args) != 2 {
				return &Error{Message: "mem_read: expected 2 arguments (ptr, offset)"}
			}
			ptr, ok1 := args[0].(*Integer)
			offset, ok2 := args[1].(*Integer)
			if !ok1 || !ok2 {
				return &Error{Message: "mem_read: arguments must be integers"}
			}
			a := env.rootArena()
			if a == nil {
				return &Error{Message: "mem_read: no arena available"}
			}
			v, err := a.ReadInt64(uintptr(ptr.Value), uintptr(offset.Value))
			if err != nil {
				return &Error{Message: "mem_read: " + err.Error()}
			}
			return &Integer{Value: v}
		},
	})

	env.Set("mem_stats", &Function{
		Native: func(args []Object) Object {
			a := env.rootArena()
			if a == nil {
				return &Error{Message: "mem_stats: no arena available"}
			}
			hk := func(s string) HashKey { return (&String{Value: s}).HashKey() }
			pairs := map[HashKey]HashPair{
				hk("heap_size"):   {Key: &String{Value: "heap_size"}, Value: &Integer{Value: int64(a.CapacityBytes())}},
				hk("used_bytes"):  {Key: &String{Value: "used_bytes"}, Value: &Integer{Value: int64(a.Used())}},
				hk("free_blocks"): {Key: &String{Value: "free_blocks"}, Value: &Integer{Value: int64(a.FreeBlocks())}},
			}
			return &Hash{Pairs: pairs}
		},
	})

	// free(ptr) — runs the destructor and releases the arena sentinel.
	env.Set("free", &Function{
		Native: func(args []Object) Object {
			if len(args) != 1 {
				return &Error{Message: "free: expected 1 argument (heap pointer)"}
			}
			p, ok := args[0].(*Pointer)
			if !ok {
				return &Error{Message: "free: argument must be a heap pointer (created with `new`)"}
			}
			p.mu.Lock()
			defer p.mu.Unlock()
			if p.Value == nil || p.Value == NULL {
				return &Error{Message: "free: pointer already freed"}
			}
			// call destructor if the struct defines one
			if strct, ok := p.Value.(*Struct); ok && strct.ClassName != "" {
				if dtor, exists := strct.Properties["~"+strct.ClassName]; exists {
					if fn, ok := dtor.(*Function); ok {
						// Pass the pointer as 'this' to the destructor
						if err := applyFunction(fn, []Object{p}, ""); isError(err) {
							return err
						}
					}
				}
				strct.Properties = nil
			}
			// release the arena sentinel
			if p.ArenaAddr != 0 {
				if a := env.rootArena(); a != nil {
					a.Free(p.ArenaAddr)
				}
				p.ArenaAddr = 0
			}
			p.Value = NULL
			return NULL
		},
	})

	return env
}

// rootArena walks up to the root environment and returns its arena.
func (e *Environment) rootArena() *memory.Arena {
	if e.arena != nil {
		return e.arena
	}
	if e.outer != nil {
		return e.outer.rootArena()
	}
	return nil
}

func NewEnclosedEnvironment(outer *Environment) *Environment {
	s := make(map[string]Object)
	return &Environment{store: s, outer: outer}
}

func (e *Environment) Get(name string) (Object, bool) {
	obj, ok := e.store[name]
	if !ok && e.outer != nil {
		obj, ok = e.outer.Get(name)
	}
	return obj, ok
}

func (e *Environment) Set(name string, val Object) Object {
	e.store[name] = val
	return val
}

func objectToGoValue(obj Object) (interface{}, error) {
	switch o := obj.(type) {
	case *Null:
		return nil, nil
	case *Integer:
		return o.Value, nil
	case *Boolean:
		return o.Value, nil
	case *String:
		return o.Value, nil
	case *Array:
		res := make([]interface{}, len(o.Elements))
		for i, el := range o.Elements {
			val, err := objectToGoValue(el)
			if err != nil {
				return nil, err
			}
			res[i] = val
		}
		return res, nil
	case *Hash:
		res := make(map[string]interface{})
		for _, pair := range o.Pairs {
			keyStr, ok := pair.Key.(*String)
			if !ok {
				return nil, fmt.Errorf("hash keys must be strings for JSON serialization")
			}
			val, err := objectToGoValue(pair.Value)
			if err != nil {
				return nil, err
			}
			res[keyStr.Value] = val
		}
		return res, nil
	default:
		return nil, fmt.Errorf("type %s cannot be serialized to JSON", obj.Type())
	}
}

func goValueToObject(val interface{}) Object {
	if val == nil {
		return NULL
	}
	switch v := val.(type) {
	case bool:
		return nativeBoolToBooleanObject(v)
	case float64:
		return &Integer{Value: int64(v)}
	case string:
		return &String{Value: v}
	case []interface{}:
		elements := make([]Object, len(v))
		for i, el := range v {
			elements[i] = goValueToObject(el)
		}
		return &Array{Elements: elements}
	case map[string]interface{}:
		pairs := make(map[HashKey]HashPair)
		for k, valEl := range v {
			keyObj := &String{Value: k}
			valObj := goValueToObject(valEl)
			pairs[keyObj.HashKey()] = HashPair{Key: keyObj, Value: valObj}
		}
		return &Hash{Pairs: pairs}
	default:
		return NULL
	}
}

