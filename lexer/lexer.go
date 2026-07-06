package lexer

import (
	"Nikium/token"
)

type Lexer struct {
	input        string
	position     int
	readPosition int
	ch           byte
	line         int
	column       int
}

func New(input string) *Lexer {
	l := &Lexer{input: input, line: 1, column: 0}
	l.readChar()
	return l
}

func (l *Lexer) readChar() {
	if l.readPosition >= len(l.input) {
		l.ch = 0
	} else {
		l.ch = l.input[l.readPosition]
	}
	l.position = l.readPosition
	l.readPosition++

	if l.ch == '\n' {
		l.line++
		l.column = 0
	} else {
		l.column++
	}
}

func (l *Lexer) NextToken() token.Token {
	var tok token.Token
	l.skipWhitespace()
	
	tokLine := l.line
	if tokLine == 0 { tokLine = 1 }
	tokCol := l.column
	if tokCol == 0 { tokCol = 1 }

	switch l.ch {
	case '=':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.EQ, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.ASSIGN, l.ch)
		}
	case '+':
		if l.peekChar() == '+' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.INC, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.PLUS, l.ch)
		}
	case '-':
		if l.peekChar() == '>' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.ARROW, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.MINUS, l.ch)
		}
	case '!':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.NOT_EQ, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.BANG, l.ch)
		}
	case '/':
		if l.peekChar() == '/' {
			l.skipLineComment()
			return l.NextToken()
		}
		tok = l.newToken(token.SLASH, l.ch)
	case '%':
		tok = l.newToken(token.MOD, l.ch)
	case '*':
		tok = l.newToken(token.ASTERISK, l.ch)
	case '<':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.LTE, Literal: string(ch) + string(l.ch)}
		} else if l.peekChar() == '<' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.LSHIFT, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.LT, l.ch)
		}
	case '>':
		if l.peekChar() == '=' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.GTE, Literal: string(ch) + string(l.ch)}
		} else if l.peekChar() == '>' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.RSHIFT, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.GT, l.ch)
		}
	case '.':
		tok = l.newToken(token.DOT, l.ch)
	case ';':
		tok = l.newToken(token.SEMICOLON, l.ch)
	case ':':
		tok = l.newToken(token.COLON, l.ch)
	case '(':
		tok = l.newToken(token.LPAREN, l.ch)
	case ')':
		tok = l.newToken(token.RPAREN, l.ch)
	case ',':
		tok = l.newToken(token.COMMA, l.ch)
	case '{':
		tok = l.newToken(token.LBRACE, l.ch)
	case '}':
		tok = l.newToken(token.RBRACE, l.ch)
	case '[':
		tok = l.newToken(token.LBRACKET, l.ch)
	case ']':
		tok = l.newToken(token.RBRACKET, l.ch)
	case '"', '\'':
		tok.Type = token.STRING
		tok.Literal = l.readString(l.ch)
		tok.Line = tokLine
		tok.Column = tokCol
	case '&':
		if l.peekChar() == '&' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.AND, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.AMPERSAND, l.ch)
		}
	case '|':
		if l.peekChar() == '|' {
			ch := l.ch
			l.readChar()
			tok = token.Token{Line: tokLine, Column: tokCol, Type: token.OR, Literal: string(ch) + string(l.ch)}
		} else {
			tok = l.newToken(token.ILLEGAL, l.ch)
		}
	case 0:
		tok.Type = token.EOF
		tok.Literal = ""
		tok.Line = tokLine
		tok.Column = tokCol
	default:
		if isLetter(l.ch) {
			lit := l.readIdentifier()
			tok.Type = token.GetTokenType(lit)
			tok.Literal = lit
			tok.Line = tokLine
			tok.Column = tokCol
			return tok
		} else if isDigit(l.ch) {
			lit := l.readNumber()
			tok.Type = token.INT
			tok.Literal = lit
			tok.Line = tokLine
			tok.Column = tokCol
			return tok
		} else {
			tok = l.newToken(token.ILLEGAL, l.ch)
		}
	}

	l.readChar()
	return tok
}

func (l *Lexer) skipWhitespace() {
	for l.ch == ' ' || l.ch == '\t' || l.ch == '\n' || l.ch == '\r' {
		l.readChar()
	}
}

func (l *Lexer) readIdentifier() string {
	pos := l.position
	for isLetter(l.ch) || isDigit(l.ch) {
		l.readChar()
	}
	return l.input[pos:l.position]
}

func (l *Lexer) readNumber() string {
	pos := l.position
	for isDigit(l.ch) {
		l.readChar()
	}
	return l.input[pos:l.position]
}

func (l *Lexer) readString(quoteChar byte) string {
	var str string
	for {
		l.readChar()
		if l.ch == quoteChar || l.ch == 0 {
			break
		}
		if l.ch == '\\' {
			l.readChar()
			switch l.ch {
			case 'n':
				str += "\n"
			case 't':
				str += "\t"
			case '\\':
				str += "\\"
			case quoteChar:
				str += string(quoteChar)
			case 0:
				break
			default:
				str += "\\" + string(l.ch)
			}
		} else {
			str += string(l.ch)
		}
	}
	return str
}

func (l *Lexer) skipLineComment() {
	for l.ch != '\n' && l.ch != 0 {
		l.readChar()
	}
	l.skipWhitespace()
}

func (l *Lexer) peekChar() byte {
	if l.readPosition >= len(l.input) {
		return 0
	}
	return l.input[l.readPosition]
}

func (l *Lexer) newToken(tokenType token.TokenType, ch byte) token.Token {
	return token.Token{Type: tokenType, Literal: string(ch), Line: l.line, Column: l.column}
}

func isLetter(ch byte) bool {
	return ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z') || ch == '_' || ch == '~'
}

func isDigit(ch byte) bool {
	return '0' <= ch && ch <= '9'
}
