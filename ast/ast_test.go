package ast

import (
	"Nikium/token"
	"testing"
)

func TestString(t *testing.T) {
	program := &Program{
		Statements: []Statement{
			&LetStatement{
				Token: token.Token{Type: "IDENT", Literal: "myVar"},
				Name: &Identifier{
					Token: token.Token{Type: "IDENT", Literal: "myVar"},
					Value: "myVar",
				},
				Value: &Identifier{
					Token: token.Token{Type: "IDENT", Literal: "anotherVar"},
					Value: "anotherVar",
				},
				Type: "i32",
			},
		},
	}

	if program.String() != "myVar:i32 = anotherVar;" {
		t.Errorf("program.String() wrong. got=%q", program.String())
	}
}
