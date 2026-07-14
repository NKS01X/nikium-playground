package evaluator

import (
	"Nikium/ast"
	"bytes"
	"fmt"
	"hash/fnv"
	"strings"
	"sync"
)

type ObjectType string

type NativeFn func(args []Object) Object

const (
	INTEGER_OBJ      = "INTEGER"
	BOOLEAN_OBJ      = "BOOLEAN"
	NULL_OBJ         = "NULL"
	RETURN_VALUE_OBJ = "RETURN_VALUE"
	ERROR_OBJ        = "ERROR"
	FUNCTION_OBJ     = "FUNCTION"
	STRING_OBJ       = "STRING"
	NATIVE_OBJ       = "NATIVE"
	ARRAY_OBJ        = "ARRAY"
	HASH_OBJ         = "HASH"
	STRUCT_OBJ       = "STRUCT"
	POINTER_OBJ      = "POINTER"
	BREAK_OBJ        = "BREAK"
	CONTINUE_OBJ     = "CONTINUE"
)

type Object interface {
	Type() ObjectType
	Inspect() string
}

// --- HashKey ---

type HashKey struct {
	Type  ObjectType
	Value uint64
}

type Hashable interface {
	HashKey() HashKey
}

type HashPair struct {
	Key   Object
	Value Object
}

type Hash struct {
	Pairs map[HashKey]HashPair
}

func (h *Hash) Type() ObjectType { return HASH_OBJ }
func (h *Hash) Inspect() string {
	var out strings.Builder
	out.WriteString("{")
	i := 0
	for _, pair := range h.Pairs {
		if i > 0 {
			out.WriteString(", ")
		}
		out.WriteString(pair.Key.Inspect())
		out.WriteString(": ")
		out.WriteString(pair.Value.Inspect())
		i++
	}
	out.WriteString("}")
	return out.String()
}

// --- Primitives ---

type Integer struct {
	Value int64
}

func (i *Integer) Type() ObjectType { return INTEGER_OBJ }
func (i *Integer) Inspect() string  { return fmt.Sprintf("%d", i.Value) }
func (i *Integer) HashKey() HashKey {
	return HashKey{Type: INTEGER_OBJ, Value: uint64(i.Value)}
}

type Boolean struct {
	Value bool
}

func (b *Boolean) Type() ObjectType { return BOOLEAN_OBJ }
func (b *Boolean) Inspect() string  { return fmt.Sprintf("%t", b.Value) }
func (b *Boolean) HashKey() HashKey {
	var val uint64
	if b.Value {
		val = 1
	}
	return HashKey{Type: BOOLEAN_OBJ, Value: val}
}

type Null struct{}

func (n *Null) Type() ObjectType { return NULL_OBJ }
func (n *Null) Inspect() string  { return "null" }

type Break struct{}

func (b *Break) Type() ObjectType { return BREAK_OBJ }
func (b *Break) Inspect() string  { return "break" }

type Continue struct{}

func (c *Continue) Type() ObjectType { return CONTINUE_OBJ }
func (c *Continue) Inspect() string  { return "continue" }

type ReturnValue struct {
	Value Object
}

func (rv *ReturnValue) Type() ObjectType { return RETURN_VALUE_OBJ }
func (rv *ReturnValue) Inspect() string  { return rv.Value.Inspect() }

type Error struct {
	Message     string
	HasLocation bool
}

func (e *Error) Type() ObjectType { return ERROR_OBJ }
func (e *Error) Inspect() string  { return "Error: " + e.Message }

type Function struct {
	Parameters  []*ast.Identifier
	Body        *ast.BlockStatement
	Env         *Environment
	Native      NativeFn
	GenericType string // e.g. "T" — unresolved generic param name
}

func (f *Function) Type() ObjectType {
	if f.Native != nil {
		return NATIVE_OBJ
	}
	return FUNCTION_OBJ
}
func (f *Function) Inspect() string {
	if f.Native != nil {
		return "native function"
	}
	var out bytes.Buffer

	params := []string{}
	for _, p := range f.Parameters {
		params = append(params, p.String())
	}

	out.WriteString("fn")
	out.WriteString("(")
	out.WriteString(strings.Join(params, ", "))
	out.WriteString(") {\n")
	out.WriteString(f.Body.String())
	out.WriteString("\n}")

	return out.String()
}

type String struct {
	Value string
}

func (s *String) Type() ObjectType { return STRING_OBJ }
func (s *String) Inspect() string  { return s.Value }
func (s *String) HashKey() HashKey {
	h := fnv.New64a()
	h.Write([]byte(s.Value))
	return HashKey{Type: STRING_OBJ, Value: h.Sum64()}
}

type Array struct {
	Elements []Object
}

func (a *Array) Type() ObjectType { return ARRAY_OBJ }

func (a *Array) Inspect() string {
	var out strings.Builder
	out.WriteString("[")
	for i, el := range a.Elements {
		out.WriteString(el.Inspect())
		if i != len(a.Elements)-1 {
			out.WriteString(", ")
		}
	}
	out.WriteString("]")
	return out.String()
}

type Struct struct {
	Properties   map[string]Object
	GenericTypes map[string]string // e.g. "T" → "int" — resolved generic bindings
	ClassName    string            // e.g. "p"
}

func (s *Struct) Type() ObjectType { return STRUCT_OBJ }
func (s *Struct) Inspect() string {
	var out strings.Builder
	out.WriteString("struct{")
	i := 0
	for k, v := range s.Properties {
		if i > 0 {
			out.WriteString(", ")
		}
		out.WriteString(k)
		out.WriteString(": ")
		out.WriteString(v.Inspect())
		i++
	}
	out.WriteString("}")
	return out.String()
}

// Pointer wraps a heap-allocated value.
// ArenaAddr holds the arena sentinel slot allocated when `new` was called;
// 0 means the pointer was not arena-tracked.
// mu protects against concurrent free() calls on the same pointer.
type Pointer struct {
	Value     Object
	ArenaAddr uintptr
	mu        sync.Mutex
}

func (p *Pointer) Type() ObjectType { return POINTER_OBJ }
func (p *Pointer) Inspect() string {
	if p.ArenaAddr != 0 {
		return fmt.Sprintf("*(%x) %s", p.ArenaAddr, p.Value.Inspect())
	}
	return "*" + p.Value.Inspect()
}

