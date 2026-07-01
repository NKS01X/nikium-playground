package evaluator

import (
	"Nikium/ast"
	"Nikium/lexer"
	"Nikium/memory"
	"Nikium/parser"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"
)

var (
	NULL             = &Null{}
	TRUE             = &Boolean{Value: true}
	FALSE            = &Boolean{Value: false}
	BREAK_OBJ_VAL    = &Break{}
	CONTINUE_OBJ_VAL = &Continue{}
	Stdout io.Writer = os.Stdout
)

// --- Eval ---

func Eval(node ast.Node, env *Environment) Object {
	obj := evalInner(node, env)
	if err, ok := obj.(*Error); ok {
		if !err.HasLocation && node != nil {
			tok := node.GetToken()
			err.Message = fmt.Sprintf("%s on line %d, col %d", err.Message, tok.Line, tok.Column)
			err.HasLocation = true
		}
	}
	return obj
}

func evalInner(node ast.Node, env *Environment) Object {
	switch node := node.(type) {

	case *ast.Program:
		return evalProgram(node, env)

	case *ast.ExpressionStatement:
		return Eval(node.Expression, env)

	case *ast.VarDeclaration:
		typeObj, ok := env.Get(node.Type)
		var val Object
		if !ok {
			if node.Type == "p" || node.Type == "string" || node.Type == "int" {
				val = NULL
			} else {
				return newError("unknown type: %s", node.Type)
			}
		} else {
			if strct, isStruct := typeObj.(*Struct); isStruct {
				if node.IsPointer {
					val = NULL
				} else {
					instance := instantiateStruct(strct, node.Type)
					callConstructor(instance, []Object{})
					// resolve generic type args: p<int> name
					if node.GenericType != "" && strct.GenericTypes != nil {
						for k := range instance.GenericTypes {
							instance.GenericTypes[k] = node.GenericType
						}
					}
					val = instance
				}
			} else {
				val = NULL
			}
		}

		if node.Value != nil {
			val = Eval(node.Value, env)
			if isError(val) {
				return val
			}
		}

		env.Set(node.Name.Value, val)
		return NULL

	case *ast.NewExpression:
		typeObj, ok := env.Get(node.Class)
		if !ok {
			return newError("unknown type: %s", node.Class)
		}
		if strct, isStruct := typeObj.(*Struct); isStruct {
			instance := instantiateStruct(strct, node.Class)
			callConstructor(instance, evalExpressions(node.Arguments, env))
			if node.GenericType != "" && instance.GenericTypes != nil {
				for k := range instance.GenericTypes {
					instance.GenericTypes[k] = node.GenericType
				}
			}
			ptr := &Pointer{Value: instance}
			if a := arenaFromEnv(env); a != nil {
				ptr.ArenaAddr = a.Malloc(memory.HeapSentinelSize)
			}
			return ptr
		}
		return newError("cannot instantiate %s", node.Class)

	case *ast.LetStatement:
		val := Eval(node.Value, env)
		if isError(val) {
			return val
		}
		// propagate generic type param name to struct/function object
		if node.GenericType != "" {
			if strct, ok := val.(*Struct); ok {
				if strct.GenericTypes == nil {
					strct.GenericTypes = make(map[string]string)
				}
				strct.GenericTypes[node.GenericType] = "" // unresolved
			} else if fn, ok := val.(*Function); ok {
				fn.GenericType = node.GenericType
			}
		}
		env.Set(node.Name.Value, val)
		return NULL

	case *ast.AssignExpression:
		val := Eval(node.Value, env)
		if isError(val) {
			return val
		}
		if pa, ok := node.Left.(*ast.PropertyAccessExpression); ok {
			object := Eval(pa.Object, env)
			if isError(object) {
				return object
			}
			if pa.Token.Literal == "->" {
				ptr, isPtr := object.(*Pointer)
				if !isPtr {
					return newError("-> applied to non-pointer in assignment")
				}
				return evalPropertyAssignment(ptr.Value, pa.Property, val)
			} else {
				if object.Type() == POINTER_OBJ {
					return newError(". applied to pointer in assignment")
				}
				return evalPropertyAssignment(object, pa.Property, val)
			}
		} else if id, ok := node.Left.(*ast.Identifier); ok {
			env.Set(id.Value, val)
			return val
		}
		return newError("invalid lvalue in assignment")

	case *ast.ReturnStatement:
		val := Eval(node.ReturnValue, env)
		if isError(val) {
			return val
		}
		return &ReturnValue{Value: val}

	case *ast.PrintStatement:
		val := Eval(node.Value, env)
		if isError(val) {
			return val
		}
		fmt.Fprintln(Stdout, val.Inspect())
		return NULL

	case *ast.BreakStatement:
		return BREAK_OBJ_VAL

	case *ast.ContinueStatement:
		return CONTINUE_OBJ_VAL

	case *ast.LoadStatement:
		return evalLoadStatement(node, env)

	case *ast.IntegerLiteral:
		return &Integer{Value: node.Value}

	case *ast.StringLiteral:
		return &String{Value: node.Value}

	case *ast.Boolean:
		return nativeBoolToBooleanObject(node.Value)

	case *ast.PrefixExpression:
		if node.Operator == "++" {
			return evalIncExpression(node, env)
		}
		if node.Operator == "*" {
			return NULL
		}
		right := Eval(node.Right, env)
		if isError(right) {
			return right
		}
		return evalPrefixExpression(node.Operator, right)

	case *ast.BinaryExpression:
		if node.Operator == "&&" {
			left := Eval(node.Left, env)
			if isError(left) {
				return left
			}
			if !isTruthy(left) {
				return FALSE
			}
			right := Eval(node.Right, env)
			if isError(right) {
				return right
			}
			if isTruthy(right) {
				return TRUE
			}
			return FALSE
		} else if node.Operator == "||" {
			left := Eval(node.Left, env)
			if isError(left) {
				return left
			}
			if isTruthy(left) {
				return TRUE
			}
			right := Eval(node.Right, env)
			if isError(right) {
				return right
			}
			if isTruthy(right) {
				return TRUE
			}
			return FALSE
		}
		left := Eval(node.Left, env)
		if isError(left) {
			return left
		}
		right := Eval(node.Right, env)
		if isError(right) {
			return right
		}
		return evalInfixExpression(node.Operator, left, right)

	case *ast.BlockStatement:
		return evalBlockStatement(node, env)

	case *ast.IfStatement:
		return evalIfExpression(node, env)

	case *ast.WhileStatement:
		return evalWhileStatement(node, env)

	case *ast.Identifier:
		return evalIdentifier(node, env)
	case *ast.ArrayLiteral:
		return evalArrayLiteral(node, env)

	case *ast.StructLiteral:
		return evalStructLiteral(node, env)

	case *ast.PropertyAccessExpression:
		object := Eval(node.Object, env)
		if isError(object) {
			return object
		}
		if node.Token.Literal == "->" {
			ptr, ok := object.(*Pointer)
			if !ok {
				return newError("-> applied to non-pointer")
			}
			return evalPropertyAccessExpression(ptr.Value, node.Property)
		} else {
			if object.Type() == POINTER_OBJ {
				return newError(". applied to pointer")
			}
			return evalPropertyAccessExpression(object, node.Property)
		}

	case *ast.ForStatement:
		return evalForStatement(node, env)

	case *ast.HashLiteral:
		return evalHashLiteral(node, env)

	case *ast.FunctionLiteral:
		return &Function{
			Parameters:  node.Parameters,
			Body:        node.Body,
			Env:         env,
			GenericType: node.GenericType,
		}

	case *ast.CallExpression:
		function := Eval(node.Function, env)
		if isError(function) {
			return function
		}
		args := evalExpressions(node.Arguments, env)
		if len(args) == 1 && isError(args[0]) {
			return args[0]
		}
		return applyFunction(function, args, node.TypeArg)

	case *ast.IndexExpression:
		left := Eval(node.Left, env)
		if isError(left) {
			return left
		}
		index := Eval(node.Index, env)
		if isError(index) {
			return index
		}
		return evalIndexExpression(left, index)

	case *ast.TimeExpression:
		if node.Standalone {
			return &Integer{Value: time.Now().UnixMilli()}
		}
		start := time.Now()
		val := Eval(node.Right, env)
		elapsed := time.Since(start).Milliseconds()
		fmt.Fprintf(Stdout, "Benchmark elapsed time: %d ms\n", elapsed)
		return val
	}

	return nil
}
func evalArrayLiteral(node *ast.ArrayLiteral, env *Environment) Object {
	elements := evalExpressions(node.Elements, env)
	return &Array{Elements: elements}
}

func evalHashLiteral(node *ast.HashLiteral, env *Environment) Object {
	pairs := make(map[HashKey]HashPair)
	for keyNode, valueNode := range node.Pairs {
		key := Eval(keyNode, env)
		if isError(key) {
			return key
		}
		hashable, ok := key.(Hashable)
		if !ok {
			return newError("unusable as hash key: %s", key.Type())
		}
		value := Eval(valueNode, env)
		if isError(value) {
			return value
		}
		hashed := hashable.HashKey()
		pairs[hashed] = HashPair{Key: key, Value: value}
	}
	return &Hash{Pairs: pairs}
}

// --- Indexing ---

func evalIndexExpression(left, index Object) Object {
	switch left := left.(type) {
	case *Array:
		idx, ok := index.(*Integer)
		if !ok {
			return newError("array index must be integer")
		}
		if idx.Value < 0 || idx.Value >= int64(len(left.Elements)) {
			return NULL
		}
		return left.Elements[idx.Value]
	case *String:
		idx, ok := index.(*Integer)
		if !ok {
			return newError("index must be integer")
		}
		if idx.Value < 0 || idx.Value >= int64(len(left.Value)) {
			return NULL
		}
		return &String{Value: string(left.Value[idx.Value])}
	case *Hash:
		hashable, ok := index.(Hashable)
		if !ok {
			return newError("unusable as hash key: %s", index.Type())
		}
		pair, ok := left.Pairs[hashable.HashKey()]
		if !ok {
			return NULL
		}
		return pair.Value
	default:
		return newError("index operator not supported on %s", left.Type())
	}
}

// --- Helpers ---

func evalProgram(program *ast.Program, env *Environment) Object {
	var result Object
	for _, stmt := range program.Statements {
		result = Eval(stmt, env)
		switch r := result.(type) {
		case *ReturnValue:
			return r.Value
		case *Error:
			return r
		}
	}
	return result
}

func evalLoadStatement(node *ast.LoadStatement, env *Environment) Object {
	filePath := node.File.Value
	content, err := os.ReadFile(filePath)
	if err != nil {
		resolved := false
		baseName := filePath
		if strings.HasPrefix(filePath, "stdlib/") {
			baseName = strings.TrimPrefix(filePath, "stdlib/")
		}

		var searchDirs []string
		if env.ScriptDir != "" {
			searchDirs = append(searchDirs, env.ScriptDir)
		}
		searchDirs = append(searchDirs, ".")
		if np := os.Getenv("NIKIUM_PATH"); np != "" {
			searchDirs = append(searchDirs, np)
		}
		if home, err := os.UserHomeDir(); err == nil {
			searchDirs = append(searchDirs, filepath.Join(home, ".local", "lib", "nikium"))
		}
		searchDirs = append(searchDirs, filepath.Join("/usr/local", "lib", "nikium"))

		for _, dir := range searchDirs {
			candidates := []string{
				filepath.Join(dir, filePath),
				filepath.Join(dir, "stdlib", baseName),
				filepath.Join(dir, baseName),
			}
			for _, candidate := range candidates {
				if data, err := os.ReadFile(candidate); err == nil {
					content = data
					resolved = true
					break
				}
			}
			if resolved {
				break
			}
		}

		if !resolved {
			return newError("could not read file: %s", filePath)
		}
	}

	l := lexer.New(string(content))
	p := parser.New(l)
	program := p.ParseProgram()

	if len(p.Errors()) != 0 {
		return newError("failed to parse loaded file: %s", filePath)
	}

	return Eval(program, env)
}

func evalBlockStatement(block *ast.BlockStatement, env *Environment) Object {
	var result Object
	for _, stmt := range block.Statements {
		result = Eval(stmt, env)
		if result != nil {
			switch result.Type() {
			case RETURN_VALUE_OBJ, ERROR_OBJ, BREAK_OBJ, CONTINUE_OBJ:
				return result
			}
		}
	}
	return result
}

func evalWhileStatement(ws *ast.WhileStatement, env *Environment) Object {
	for {
		cond := Eval(ws.Condition, env)
		if isError(cond) {
			return cond
		}
		if !isTruthy(cond) {
			break
		}
		result := Eval(ws.Body, env)
		if result != nil {
			switch result.Type() {
			case RETURN_VALUE_OBJ, ERROR_OBJ:
				return result
			case BREAK_OBJ:
				return NULL
			case CONTINUE_OBJ:
				continue
			}
		}
	}
	return NULL
}

func evalIfExpression(ie *ast.IfStatement, env *Environment) Object {
	cond := Eval(ie.Condition, env)
	if isError(cond) {
		return cond
	}
	if isTruthy(cond) {
		return Eval(ie.Consequence, env)
	} else if ie.Alternative != nil {
		return Eval(ie.Alternative, env)
	}
	return NULL
}

func evalIdentifier(node *ast.Identifier, env *Environment) Object {
	if val, ok := env.Get(node.Value); ok {
		return val
	}
	if node.Value == "string" { return &String{Value: ""} }
	if node.Value == "int" { return &Integer{Value: 0} }
	return newError("identifier not found: %s", node.Value)
}

func evalExpressions(exps []ast.Expression, env *Environment) []Object {
	var result []Object
	for _, e := range exps {
		evaluated := Eval(e, env)
		if isError(evaluated) {
			return []Object{evaluated}
		}
		result = append(result, evaluated)
	}
	return result
}

func applyFunction(fn Object, args []Object, typeArg string) Object {
	switch fn := fn.(type) {
	case *Function:
		if fn.Native != nil {
			return fn.Native(args)
		}
		// type-check args if generic
		if typeArg != "" && fn.GenericType != "" {
			for _, arg := range args {
				if !typeMatchesGeneric(arg, typeArg) {
					return newError("generic type mismatch: expected %s, got %s", typeArg, arg.Type())
				}
			}
		}
		env := NewEnclosedEnvironment(fn.Env)
		for i, param := range fn.Parameters {
			env.Set(param.Value, args[i])
		}
		result := unwrapReturnValue(Eval(fn.Body, env))
		cleanupEnvironment(env, result)
		return result
	default:
		return newError("not a function: %s", fn.Type())
	}
}

func unwrapReturnValue(obj Object) Object {
	if rv, ok := obj.(*ReturnValue); ok {
		return rv.Value
	}
	return obj
}

// --- Boolean / Null ---

func nativeBoolToBooleanObject(input bool) *Boolean {
	if input {
		return TRUE
	}
	return FALSE
}

func isTruthy(obj Object) bool {
	switch obj {
	case NULL:
		return false
	case TRUE:
		return true
	case FALSE:
		return false
	default:
		return true
	}
}

// --- Prefix Expressions ---

func evalPrefixExpression(operator string, right Object) Object {
	switch operator {
	case "!":
		return evalBangOperatorExpression(right)
	case "-":
		return evalMinusPrefixOperatorExpression(right)
	default:
		return newError("unknown operator: %s%s", operator, right.Type())
	}
}

func evalBangOperatorExpression(right Object) Object {
	switch right {
	case TRUE:
		return FALSE
	case FALSE:
		return TRUE
	case NULL:
		return TRUE
	default:
		return FALSE
	}
}

func evalMinusPrefixOperatorExpression(right Object) Object {
	if right.Type() != INTEGER_OBJ {
		return newError("unknown operator: -%s", right.Type())
	}
	return &Integer{Value: -right.(*Integer).Value}
}

// --- Infix Expressions ---

func evalInfixExpression(op string, left, right Object) Object {
	switch {
	case left.Type() == INTEGER_OBJ && right.Type() == INTEGER_OBJ:
		return evalIntegerInfixExpression(op, left, right)

	case left.Type() == STRING_OBJ && right.Type() == STRING_OBJ:
		lstr := left.(*String).Value
		rstr := right.(*String).Value

		if op == "+" {
			return &String{Value: lstr + rstr}
		}

		if op == "==" {
			return nativeBoolToBooleanObject(lstr == rstr)
		}
		if op == "!=" {
			return nativeBoolToBooleanObject(lstr != rstr)
		}

		if len(lstr) == 1 && len(rstr) == 1 {
			lv := int64(lstr[0])
			rv := int64(rstr[0])
			switch op {
			case "-":
				return &Integer{Value: lv - rv}
			case "*":
				return &Integer{Value: lv * rv}
			case "/":
				return &Integer{Value: lv / rv}
			case "==":
				return nativeBoolToBooleanObject(lv == rv)
			case "!=":
				return nativeBoolToBooleanObject(lv != rv)
			case "<":
				return nativeBoolToBooleanObject(lv < rv)
			case ">":
				return nativeBoolToBooleanObject(lv > rv)
			case "<=":
				return nativeBoolToBooleanObject(lv <= rv)
			case ">=":
				return nativeBoolToBooleanObject(lv >= rv)
			default:
				return newError("unknown operator for chars: %s", op)
			}
		}

		return newError("unknown operator for strings: %s", op)

	case left.Type() == STRING_OBJ && right.Type() == INTEGER_OBJ:
		lstr := left.(*String).Value
		if len(lstr) != 1 {
			return newError("cannot perform arithmetic on multi-char string")
		}
		lv := int64(lstr[0])
		rv := right.(*Integer).Value
		switch op {
		case "+":
			return &Integer{Value: lv + rv}
		case "-":
			return &Integer{Value: lv - rv}
		case "*":
			return &Integer{Value: lv * rv}
		case "/":
			return &Integer{Value: lv / rv}
		default:
			return newError("unknown operator for char and int: %s", op)
		}

	case left.Type() == INTEGER_OBJ && right.Type() == STRING_OBJ:
		rstr := right.(*String).Value
		if len(rstr) != 1 {
			return newError("cannot perform arithmetic on multi-char string")
		}
		lv := left.(*Integer).Value
		rv := int64(rstr[0])
		switch op {
		case "+":
			return &Integer{Value: lv + rv}
		case "-":
			return &Integer{Value: lv - rv}
		case "*":
			return &Integer{Value: lv * rv}
		case "/":
			return &Integer{Value: lv / rv}
		default:
			return newError("unknown operator for int and char: %s", op)
		}

	case op == "==":
		return nativeBoolToBooleanObject(left == right)
	case op == "!=":
		return nativeBoolToBooleanObject(left != right)

	default:
		return newError("type mismatch: %s %s %s", left.Type(), op, right.Type())
	}
}

func evalIntegerInfixExpression(op string, left, right Object) Object {
	lv := left.(*Integer).Value
	rv := right.(*Integer).Value
	switch op {
	case "+":
		return &Integer{Value: lv + rv}
	case "-":
		return &Integer{Value: lv - rv}
	case "*":
		return &Integer{Value: lv * rv}
	case "/":
		if rv == 0 {
			return newError("division by zero")
		}
		return &Integer{Value: lv / rv}
	case "%":
		if rv == 0 {
			return newError("modulo by zero")
		}
		return &Integer{Value: lv % rv}
	case "<<":
		return &Integer{Value: lv << rv}
	case ">>":
		return &Integer{Value: lv >> rv}
	case "<":
		return nativeBoolToBooleanObject(lv < rv)
	case ">":
		return nativeBoolToBooleanObject(lv > rv)
	case "<=":
		return nativeBoolToBooleanObject(lv <= rv)
	case ">=":
		return nativeBoolToBooleanObject(lv >= rv)
	case "==":
		return nativeBoolToBooleanObject(lv == rv)
	case "!=":
		return nativeBoolToBooleanObject(lv != rv)
	default:
		return newError("unknown operator: %s %s %s", left.Type(), op, right.Type())
	}
}

// --- Utility ---

func newError(format string, a ...interface{}) *Error {
	return &Error{Message: fmt.Sprintf(format, a...)}
}

func isError(obj Object) bool {
	return obj != nil && obj.Type() == ERROR_OBJ
}

func evalStructLiteral(node *ast.StructLiteral, env *Environment) Object {
	properties := make(map[string]Object)
	for key, valueNode := range node.Pairs {
		// If this is a generic struct definition, fields whose type/value
		// match the generic param should be evaluated as placeholders (NULL)
		if node.GenericType != "" {
			if ident, ok := valueNode.(*ast.Identifier); ok && ident.Value == node.GenericType {
				properties[key] = NULL
				continue
			}
		}

		value := Eval(valueNode, env)
		if isError(value) {
			return value
		}
		properties[key] = value
	}
	return &Struct{Properties: properties}
}

func evalPropertyAccessExpression(object Object, property *ast.Identifier) Object {
	strct, ok := object.(*Struct)
	if !ok {
		return newError("property access not supported on %s", object.Type())
	}
	val, ok := strct.Properties[property.Value]
	if !ok {
		return NULL
	}
	return val
}

func evalForStatement(node *ast.ForStatement, env *Environment) Object {
	loopEnv := NewEnclosedEnvironment(env)
	if node.Init != nil {
		Eval(node.Init, loopEnv)
	}
	var result Object
	for {
		if node.Condition != nil {
			cond := Eval(node.Condition, loopEnv)
			if isError(cond) {
				return cond
			}
			if !isTruthy(cond) {
				break
			}
		}
		result = Eval(node.Body, loopEnv)
		if result != nil {
			if result.Type() == RETURN_VALUE_OBJ || result.Type() == ERROR_OBJ {
				cleanupEnvironment(loopEnv, unwrapReturnValue(result))
				return result
			}
			if result.Type() == BREAK_OBJ {
				break
			}
			// if CONTINUE_OBJ, just let post execute
		}
		if node.Post != nil {
			Eval(node.Post, loopEnv)
		}
	}
	cleanupEnvironment(loopEnv, nil)
	return NULL
}

func evalIncExpression(node *ast.PrefixExpression, env *Environment) Object {
	ident, ok := node.Right.(*ast.Identifier)
	if !ok {
		return newError("++ requires ident")
	}
	val, ok := env.Get(ident.Value)
	if !ok {
		return newError("ident not found")
	}
	intVal, ok := val.(*Integer)
	if !ok {
		return newError("++ only integer")
	}
	newVal := &Integer{Value: intVal.Value + 1}
	env.Set(ident.Value, newVal)
	return newVal
}

func instantiateStruct(s *Struct, className string) *Struct {
	newProps := make(map[string]Object)
	for k, v := range s.Properties {
		newProps[k] = v
	}
	// copy generic types map
	var gt map[string]string
	if s.GenericTypes != nil {
		gt = make(map[string]string)
		for k, v := range s.GenericTypes {
			gt[k] = v
		}
	}
	return &Struct{Properties: newProps, GenericTypes: gt, ClassName: className}
}

func callConstructor(instance *Struct, args []Object) {
	if instance.ClassName == "" {
		return
	}
	if initProp, exists := instance.Properties[instance.ClassName]; exists {
		if fn, ok := initProp.(*Function); ok {
			applyFunction(fn, args, "")
		}
	}
}

func cleanupEnvironment(env *Environment, exclude Object) {
	a := arenaFromEnv(env)
	for _, obj := range env.store {
		if obj == exclude {
			continue
		}
		clearObjectMemoryWithArena(obj, a)
	}
}

// arenaFromEnv retrieves the root arena from any environment in the chain.
func arenaFromEnv(env *Environment) *memory.Arena {
	if env == nil {
		return nil
	}
	return env.rootArena()
}

func clearObjectMemory(obj Object) {
	clearObjectMemoryWithArena(obj, nil)
}

func clearObjectMemoryWithArena(obj Object, arena interface{ Free(uintptr) }) {
	switch val := obj.(type) {
	case *Struct:
		if val.ClassName != "" && val.Properties != nil {
			if delProp, exists := val.Properties["~"+val.ClassName]; exists {
				if fn, ok := delProp.(*Function); ok {
					applyFunction(fn, []Object{}, "")
				}
			}
		}
		val.Properties = nil
	}
}

func evalPropertyAssignment(object Object, property *ast.Identifier, val Object) Object {
	if s, ok := object.(*Struct); ok {
		// type-check against generic types
		if s.GenericTypes != nil {
			// check if the property's original value was a generic placeholder
			if existing, exists := s.Properties[property.Value]; exists {
				if existing.Type() == NULL_OBJ {
					// property was unset (generic placeholder), check against resolved type
					for _, resolvedType := range s.GenericTypes {
						if resolvedType != "" && !typeMatchesGeneric(val, resolvedType) {
							return newError("generic type mismatch: property %s expects %s, got %s",
								property.Value, resolvedType, val.Type())
						}
					}
				}
			}
		}
		s.Properties[property.Value] = val
		return val
	}
	return newError("property assignment not supported on %s", object.Type())
}

// typeMatchesGeneric checks if an object matches a generic type name
func typeMatchesGeneric(obj Object, typeName string) bool {
	switch typeName {
	case "int":
		return obj.Type() == INTEGER_OBJ
	case "string":
		return obj.Type() == STRING_OBJ
	case "bool":
		return obj.Type() == BOOLEAN_OBJ
	default:
		return true // unknown types pass through
	}
}

