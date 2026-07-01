package token

import "testing"

func TestGetTokenType(t *testing.T) {
	tests := []struct {
		literal string
		want    string
	}{
		{"fn", "FUNCTION"},
		{"let", "LET"},
		{"true", "TRUE"},
		{"false", "FALSE"},
		{"if", "IF"},
		{"else", "ELSE"},
		{"return", "RETURN"},
		{"print", "PRINT"},
		{"while", "WHILE"},
		{"myVar", "IDENT"},
		{"anotherVar", "IDENT"},
	}

	for _, tt := range tests {
		got := GetTokenType(tt.literal)
		if string(got) != tt.want {
			t.Errorf("GetTokenType(%q) = %q; want %q", tt.literal, got, tt.want)
		}
	}
}
