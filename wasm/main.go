package main

import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"syscall/js"

	"Nikium/evaluator"
	"Nikium/lexer"
	"Nikium/parser"
)

//go:embed stdlib/*.nik
var stdlibFS embed.FS

func main() {
	js.Global().Set("nikiumRun", js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		if len(args) < 1 {
			return "Error: missing code argument"
		}
		code := args[0].String()
		return runNikium(code)
	}))

	<-make(chan struct{})
}

func runNikium(code string) string {
	processed := preprocessLoads(code)

	var buf bytes.Buffer
	evaluator.Stdout = &buf

	errResult := func() error {
		l := lexer.New(processed)
		p := parser.New(l)
		program := p.ParseProgram()

		if len(p.Errors()) != 0 {
			return fmt.Errorf("parse error: %s", strings.Join(p.Errors(), "\n"))
		}

		env := evaluator.NewEnvironment()
		defer env.Destroy()

		result := evaluator.Eval(program, env)
		if result != nil && result.Type() == evaluator.ERROR_OBJ {
			return fmt.Errorf("%s", result.Inspect())
		}

		return nil
	}()

	evaluator.Stdout = os.Stdout

	output := strings.TrimSpace(buf.String())
	res := map[string]string{
		"output": output,
		"error":  "",
	}
	if errResult != nil {
		res["error"] = errResult.Error()
	}

	jsonBytes, _ := json.Marshal(res)
	return string(jsonBytes)
}

func preprocessLoads(code string) string {
	lines := strings.Split(code, "\n")
	var out []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, `load "`) && strings.HasSuffix(trimmed, `";`) {
			path := strings.TrimPrefix(trimmed, `load "`)
			path = strings.TrimSuffix(path, `";`)
			path = strings.TrimSpace(path)

			name := strings.TrimPrefix(path, "stdlib/")
			data, err := stdlibFS.ReadFile("stdlib/" + name)
			if err == nil {
				out = append(out, string(data))
				continue
			}
		}
		out = append(out, line)
	}
	return strings.Join(out, "\n")
}
