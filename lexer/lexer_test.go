package lexer

import (
	"testing"
)

func TestNextToken(t *testing.T) {
	input := `let five = 5;
let ten = 10;

let add = fn(x, y) {
  x + y;
};

let result = add(five, ten);
!-/*5;
5 < 10 > 5;

if (5 < 10) {
	return true;
} else {
	return false;
}

10 == 10;
10 != 9;
"foobar"
"foo bar"
// this is a comment
1 <= 2 >= 3 % 4;
"foo\n\t\\\"bar"
break continue
`

	tests := []struct {
		expectedType    string
		expectedLiteral string
	}{
		{"LET", "let"},
		{"IDENT", "five"},
		{"=", "="},
		{"INT", "5"},
		{";", ";"},
		{"LET", "let"},
		{"IDENT", "ten"},
		{"=", "="},
		{"INT", "10"},
		{";", ";"},
		{"LET", "let"},
		{"IDENT", "add"},
		{"=", "="},
		{"FUNCTION", "fn"},
		{"(", "("},
		{"IDENT", "x"},
		{",", ","},
		{"IDENT", "y"},
		{")", ")"},
		{"{", "{"},
		{"IDENT", "x"},
		{"+", "+"},
		{"IDENT", "y"},
		{";", ";"},
		{"}", "}"},
		{";", ";"},
		{"LET", "let"},
		{"IDENT", "result"},
		{"=", "="},
		{"IDENT", "add"},
		{"(", "("},
		{"IDENT", "five"},
		{",", ","},
		{"IDENT", "ten"},
		{")", ")"},
		{";", ";"},
		{"!", "!"},
		{"-", "-"},
		{"/", "/"},
		{"*", "*"},
		{"INT", "5"},
		{";", ";"},
		{"INT", "5"},
		{"<", "<"},
		{"INT", "10"},
		{">", ">"},
		{"INT", "5"},
		{";", ";"},
		{"IF", "if"},
		{"(", "("},
		{"INT", "5"},
		{"<", "<"},
		{"INT", "10"},
		{")", ")"},
		{"{", "{"},
		{"RETURN", "return"},
		{"TRUE", "true"},
		{";", ";"},
		{"}", "}"},
		{"ELSE", "else"},
		{"{", "{"},
		{"RETURN", "return"},
		{"FALSE", "false"},
		{";", ";"},
		{"}", "}"},
		{"INT", "10"},
		{"==", "=="},
		{"INT", "10"},
		{";", ";"},
		{"INT", "10"},
		{"!=", "!="},
		{"INT", "9"},
		{";", ";"},
		{"STRING", "foobar"},
		{"STRING", "foo bar"},
		{"INT", "1"},
		{"<=", "<="},
		{"INT", "2"},
		{">=", ">="},
		{"INT", "3"},
		{"%", "%"},
		{"INT", "4"},
		{";", ";"},
		{"STRING", "foo\n\t\\\"bar"},
		{"BREAK", "break"},
		{"CONTINUE", "continue"},
		{"EOF", ""},
	}

	l := New(input)

	for i, tt := range tests {
		tok := l.NextToken()

		if string(tok.Type) != tt.expectedType {
			t.Fatalf("tests[%d] - tokentype wrong. expected=%q, got=%q",
				i, tt.expectedType, tok.Type)
		}

		if tok.Literal != tt.expectedLiteral {
			t.Fatalf("tests[%d] - literal wrong. expected=%q, got=%q",
				i, tt.expectedLiteral, tok.Literal)
		}
	}
}
