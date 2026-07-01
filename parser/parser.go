package parser

import (
	"Nikium/ast"
	"Nikium/lexer"
	"Nikium/token"
	"fmt"
	"strconv"
)

const (
	_ int = iota
	LOWEST
	ASSIGNMENT
	LOGICAL_OR
	LOGICAL_AND
	EQUALS
	LESSGREATER
	SUM
	PRODUCT
	PREFIX
	CALL
	INDEX
)

var precedences = map[token.TokenType]int{
	token.ASSIGN:   ASSIGNMENT,
	token.OR:       LOGICAL_OR,
	token.AND:      LOGICAL_AND,
	token.EQ:       EQUALS,
	token.NOT_EQ:   EQUALS,
	token.LT:       LESSGREATER,
	token.GT:       LESSGREATER,
	token.LTE:      LESSGREATER,
	token.GTE:      LESSGREATER,
	token.PLUS:     SUM,
	token.MINUS:    SUM,
	token.LSHIFT:   SUM,
	token.RSHIFT:   SUM,
	token.SLASH:    PRODUCT,
	token.ASTERISK: PRODUCT,
	token.MOD:      PRODUCT,
	token.LPAREN:   CALL,
	token.LBRACKET: INDEX,
	token.DOT:      INDEX,
	token.ARROW:    INDEX,
}

type (
	prefixParseFn func() ast.Expression
	infixParseFn  func(ast.Expression) ast.Expression
)

type ParserError struct {
	Message string
	Line    int
	Column  int
}

type Parser struct {
	l              *lexer.Lexer
	errors         []string
	detailedErrors []ParserError

	curToken  token.Token
	peekToken token.Token

	prefixParseFns map[token.TokenType]prefixParseFn
	infixParseFns  map[token.TokenType]infixParseFn
}

func New(l *lexer.Lexer) *Parser {
	p := &Parser{
		l:              l,
		errors:         []string{},
		detailedErrors: []ParserError{},
	}

	p.prefixParseFns = make(map[token.TokenType]prefixParseFn)
	p.registerPrefix(token.IDENT, p.parseIdentifier)
	p.registerPrefix(token.INT, p.parseIntegerLiteral)
	p.registerPrefix(token.STRING, p.parseStringLiteral)
	p.registerPrefix(token.TRUE, p.parseBoolean)
	p.registerPrefix(token.FALSE, p.parseBoolean)
	p.registerPrefix(token.BANG, p.parsePrefixExpression)
	p.registerPrefix(token.MINUS, p.parsePrefixExpression)
	p.registerPrefix(token.ASTERISK, p.parsePrefixExpression)
	p.registerPrefix(token.LPAREN, p.parseGroupedExpression)
	p.registerPrefix(token.IF, p.parseIfStatement)
	p.registerPrefix(token.WHILE, p.parseWhileStatement)
	p.registerPrefix(token.FOR, p.parseForStatement)
	p.registerPrefix(token.FUNCTION, p.parseFunctionLiteral)
	p.registerPrefix(token.LBRACKET, p.parseArrayLiteral)
	p.registerPrefix(token.LBRACE, p.parseHashLiteral)
	p.registerPrefix(token.STRUCT, p.parseStructLiteral)
	p.registerPrefix(token.NEW, p.parseNewExpression)
	p.registerPrefix(token.INC, p.parsePrefixExpression)
	p.registerPrefix(token.TIME, p.parseTimeExpression)
	p.registerPrefix(token.DATETIME, p.parseTimeExpression)
	p.registerPrefix(token.NOW, p.parseTimeExpression)

	p.infixParseFns = make(map[token.TokenType]infixParseFn)
	p.registerInfix(token.ASSIGN, p.parseAssignExpression)
	p.registerInfix(token.PLUS, p.parseInfixExpression)
	p.registerInfix(token.MINUS, p.parseInfixExpression)
	p.registerInfix(token.SLASH, p.parseInfixExpression)
	p.registerInfix(token.ASTERISK, p.parseInfixExpression)
	p.registerInfix(token.MOD, p.parseInfixExpression)
	p.registerInfix(token.LSHIFT, p.parseInfixExpression)
	p.registerInfix(token.RSHIFT, p.parseInfixExpression)
	p.registerInfix(token.EQ, p.parseInfixExpression)
	p.registerInfix(token.NOT_EQ, p.parseInfixExpression)
	p.registerInfix(token.LT, p.parseInfixExpression)
	p.registerInfix(token.GT, p.parseInfixExpression)
	p.registerInfix(token.LTE, p.parseInfixExpression)
	p.registerInfix(token.GTE, p.parseInfixExpression)
	p.registerInfix(token.AND, p.parseInfixExpression)
	p.registerInfix(token.OR, p.parseInfixExpression)
	p.registerInfix(token.LPAREN, p.parseCallExpression)
	p.registerInfix(token.LBRACKET, p.parseIndexExpression)
	p.registerInfix(token.DOT, p.parsePropertyAccessExpression)
	p.registerInfix(token.ARROW, p.parsePropertyAccessExpression)

	p.nextToken()
	p.nextToken()
	return p
}

func (p *Parser) Errors() []string { return p.errors }

func (p *Parser) ErrorsDetailed() []ParserError { return p.detailedErrors }

func (p *Parser) addError(msg string, tok token.Token) {
	p.errors = append(p.errors, msg)
	p.detailedErrors = append(p.detailedErrors, ParserError{
		Message: msg,
		Line:    tok.Line,
		Column:  tok.Column,
	})
}

func (p *Parser) nextToken() {
	p.curToken = p.peekToken
	p.peekToken = p.l.NextToken()
}

func (p *Parser) ParseProgram() *ast.Program {
	program := &ast.Program{}
	for p.curToken.Type != token.EOF {
		stmt := p.parseStatement()
		if stmt != nil {
			program.Statements = append(program.Statements, stmt)
		}
		p.nextToken()
	}
	return program
}
func (p *Parser) parseArrayLiteral() ast.Expression {
	array := &ast.ArrayLiteral{Token: p.curToken}
	array.Elements = p.parseExpressionList(token.RBRACKET)
	return array
}
func (p *Parser) parseExpressionList(end token.TokenType) []ast.Expression {
	list := []ast.Expression{}

	if p.peekTokenIs(end) {
		p.nextToken()
		return list
	}

	p.nextToken()
	list = append(list, p.parseExpression(LOWEST))

	for p.peekTokenIs(token.COMMA) {
		p.nextToken()
		p.nextToken()
		list = append(list, p.parseExpression(LOWEST))
	}

	if !p.expectPeek(end) {
		return nil
	}
	return list
}

func (p *Parser) parseStatement() ast.Statement {
	switch p.curToken.Type {
	case token.GENERIC:
		// generic<T> name = struct{...}; or generic<T> name = fn(...){};
		return p.parseGenericLetStatement()
	case token.IDENT:
		if p.peekToken.Type == token.LT {
			// p<int>* name or p<int> name
			return p.parseVarDeclaration(false)
		}
		if p.peekToken.Type == token.ASSIGN || p.peekToken.Type == token.COLON {
			return p.parseLetStatement()
		}
		if p.peekToken.Type == token.IDENT {
			return p.parseVarDeclaration(false)
		}
		if p.peekToken.Type == token.ASTERISK && p.peekPeekTokenIs(token.IDENT) {
			return p.parseVarDeclaration(true)
		}
		return p.parseExpressionStatement()
	case token.PRINT:
		return p.parsePrintStatement()
	case token.RETURN:
		return p.parseReturnStatement()
	case token.BREAK:
		return p.parseBreakStatement()
	case token.CONTINUE:
		return p.parseContinueStatement()
	case token.LOAD:
		return p.parseLoadStatement()
	default:
		return p.parseExpressionStatement()
	}
}

func (p *Parser) parseLoadStatement() *ast.LoadStatement {
	stmt := &ast.LoadStatement{Token: p.curToken}

	p.nextToken() // move past 'load'
	if p.curToken.Type != token.STRING {
		p.addError("expected string next to load", p.curToken)
		return nil
	}
	stmt.File = p.parseStringLiteral().(*ast.StringLiteral)

	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}

	return stmt
}

func (p *Parser) parseLetStatement() *ast.LetStatement {
	stmt := &ast.LetStatement{Token: p.curToken}
	stmt.Name = &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}

	if p.peekTokenIs(token.COLON) {
		p.nextToken()
		p.nextToken()
		stmt.Type = p.curToken.Literal
	}

	if !p.expectPeek(token.ASSIGN) {
		return nil
	}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)

	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

// parseGenericLetStatement handles: generic<T> name = struct{...}; or generic<T> name = fn(...){};
func (p *Parser) parseGenericLetStatement() *ast.LetStatement {
	stmt := &ast.LetStatement{Token: p.curToken}

	// consume < T >
	if !p.expectPeek(token.LT) {
		return nil
	}
	if !p.expectPeek(token.IDENT) {
		return nil
	}
	stmt.GenericType = p.curToken.Literal // e.g. "T"
	if !p.expectPeek(token.GT) {
		return nil
	}

	// now expect name
	if !p.expectPeek(token.IDENT) {
		return nil
	}
	stmt.Name = &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}

	if !p.expectPeek(token.ASSIGN) {
		return nil
	}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)

	// propagate generic type to the parsed value node
	if sl, ok := stmt.Value.(*ast.StructLiteral); ok {
		sl.GenericType = stmt.GenericType
	} else if fl, ok := stmt.Value.(*ast.FunctionLiteral); ok {
		fl.GenericType = stmt.GenericType
	}

	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseVarDeclaration(isPointer bool) *ast.VarDeclaration {
	decl := &ast.VarDeclaration{Token: p.curToken, Type: p.curToken.Literal, IsPointer: isPointer}

	// Check for type args: p<int> or p<int>*
	if p.peekTokenIs(token.LT) {
		p.nextToken() // <
		if p.peekTokenIs(token.IDENT) {
			p.nextToken() // type arg e.g. "int"
			decl.GenericType = p.curToken.Literal
		}
		if p.peekTokenIs(token.GT) {
			p.nextToken() // >
		}
		// allow pointer after >: p<int>*
		if p.peekTokenIs(token.ASTERISK) {
			decl.IsPointer = true
			p.nextToken()
		}
	} else if isPointer {
		p.nextToken() // move past curType, so now on *
	}
	if !p.expectPeek(token.IDENT) {
		return nil
	}
	decl.Name = &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}

	if p.peekTokenIs(token.LPAREN) {
		p.nextToken()
		if !p.expectPeek(token.RPAREN) {
			return nil
		}
	} else if p.peekTokenIs(token.ASSIGN) {
		p.nextToken()
		p.nextToken()
		decl.Value = p.parseExpression(LOWEST)
	}

	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return decl
}

func (p *Parser) parsePrintStatement() *ast.PrintStatement {
	stmt := &ast.PrintStatement{Token: p.curToken}
	p.nextToken()
	stmt.Value = p.parseExpression(LOWEST)
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseReturnStatement() *ast.ReturnStatement {
	stmt := &ast.ReturnStatement{Token: p.curToken}
	p.nextToken()
	stmt.ReturnValue = p.parseExpression(LOWEST)
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseBreakStatement() *ast.BreakStatement {
	stmt := &ast.BreakStatement{Token: p.curToken}
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseContinueStatement() *ast.ContinueStatement {
	stmt := &ast.ContinueStatement{Token: p.curToken}
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseExpressionStatement() *ast.ExpressionStatement {
	stmt := &ast.ExpressionStatement{Token: p.curToken}
	stmt.Expression = p.parseExpression(LOWEST)
	if p.peekTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	return stmt
}

func (p *Parser) parseExpression(precedence int) ast.Expression {
	prefix := p.prefixParseFns[p.curToken.Type]
	if prefix == nil {
		p.addError("no prefix parse function for "+string(p.curToken.Type), p.curToken)
		return nil
	}
	leftExp := prefix()

	for !p.peekTokenIs(token.SEMICOLON) && precedence < p.peekPrecedence() {
		infix := p.infixParseFns[p.peekToken.Type]
		if infix == nil {
			return leftExp
		}
		p.nextToken()
		leftExp = infix(leftExp)
	}
	return leftExp
}

/* ---------- expressions ---------- */

func (p *Parser) parseIdentifier() ast.Expression {
	return &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
}

func (p *Parser) parseIntegerLiteral() ast.Expression {
	val, err := strconv.ParseInt(p.curToken.Literal, 0, 64)
	if err != nil {
		p.addError("invalid integer", p.curToken)
		return nil
	}
	return &ast.IntegerLiteral{Token: p.curToken, Value: val}
}

func (p *Parser) parseStringLiteral() ast.Expression {
	return &ast.StringLiteral{Token: p.curToken, Value: p.curToken.Literal}
}

func (p *Parser) parseBoolean() ast.Expression {
	return &ast.Boolean{
		Token: p.curToken,
		Value: p.curTokenIs(token.TRUE),
	}
}

func (p *Parser) parsePrefixExpression() ast.Expression {
	expr := &ast.PrefixExpression{
		Token:    p.curToken,
		Operator: p.curToken.Literal,
	}
	p.nextToken()
	expr.Right = p.parseExpression(PREFIX)
	return expr
}

func (p *Parser) parseInfixExpression(left ast.Expression) ast.Expression {
	// Detect generic function call: ident<type>(args)
	// cur token is <, left is Identifier, peek is IDENT (type arg)
	if p.curToken.Literal == "<" {
		if _, isIdent := left.(*ast.Identifier); isIdent {
			// peek ahead: if next is IDENT and then > then ( → generic call
			if p.peekTokenIs(token.IDENT) && p.peekPeekTokenIs(token.GT) {
				p.nextToken() // move to type arg
				typeArg := p.curToken.Literal
				p.nextToken() // move to >
				if p.peekTokenIs(token.LPAREN) {
					p.nextToken() // move to (
					return p.parseGenericCallExpression(left, typeArg)
				}
			}
		}
	}

	expr := &ast.BinaryExpression{
		Token:    p.curToken,
		Left:     left,
		Operator: p.curToken.Literal,
	}
	prec := p.curPrecedence()
	p.nextToken()
	expr.Right = p.parseExpression(prec)
	return expr
}

func (p *Parser) parseGroupedExpression() ast.Expression {
	p.nextToken()
	exp := p.parseExpression(LOWEST)
	if !p.expectPeek(token.RPAREN) {
		return nil
	}
	return exp
}

/* ---------- control ---------- */

func (p *Parser) parseIfStatement() ast.Expression {
	expr := &ast.IfStatement{Token: p.curToken}
	p.nextToken()
	expr.Condition = p.parseExpression(LOWEST)

	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	expr.Consequence = p.parseBlockStatement()

	if p.peekTokenIs(token.ELSE) {
		p.nextToken()
		if !p.expectPeek(token.LBRACE) {
			return nil
		}
		expr.Alternative = p.parseBlockStatement()
	}
	return expr
}

func (p *Parser) parseWhileStatement() ast.Expression {
	expr := &ast.WhileStatement{Token: p.curToken}
	p.nextToken()
	expr.Condition = p.parseExpression(LOWEST)

	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	expr.Body = p.parseBlockStatement()
	return expr
}

func (p *Parser) parseBlockStatement() *ast.BlockStatement {
	block := &ast.BlockStatement{Token: p.curToken}
	p.nextToken()

	for !p.curTokenIs(token.RBRACE) && !p.curTokenIs(token.EOF) {
		stmt := p.parseStatement()
		if stmt != nil {
			block.Statements = append(block.Statements, stmt)
		}
		p.nextToken()
	}
	return block
}

/* ---------- functions & calls ---------- */

func (p *Parser) parseFunctionLiteral() ast.Expression {
	lit := &ast.FunctionLiteral{Token: p.curToken}

	if p.peekTokenIs(token.LT) {
		p.nextToken()
		if p.peekTokenIs(token.IDENT) {
			p.nextToken()
			lit.GenericType = p.curToken.Literal
		}
		if p.peekTokenIs(token.GT) {
			p.nextToken()
		}
	}

	if !p.expectPeek(token.LPAREN) {
		return nil
	}
	lit.Parameters = p.parseFunctionParameters()

	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	lit.Body = p.parseBlockStatement()
	return lit
}

func (p *Parser) parseFunctionParameters() []*ast.Identifier {
	params := []*ast.Identifier{}

	if p.peekTokenIs(token.RPAREN) {
		p.nextToken()
		return params
	}

	p.nextToken()
	ident := &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
	params = append(params, ident)

	// Allow optional :type
	if p.peekTokenIs(token.COLON) {
		p.nextToken() // :
		p.nextToken() // type name
	}

	for p.peekTokenIs(token.COMMA) {
		p.nextToken() // ,
		p.nextToken() // param name
		ident := &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
		params = append(params, ident)

		if p.peekTokenIs(token.COLON) {
			p.nextToken() // :
			p.nextToken() // type name
		}
	}

	if !p.expectPeek(token.RPAREN) {
		return nil
	}
	return params
}

func (p *Parser) parseCallExpression(fn ast.Expression) ast.Expression {
	exp := &ast.CallExpression{Token: p.curToken, Function: fn}
	exp.Arguments = p.parseCallArguments()
	return exp
}

// parseGenericCallExpression handles: func<int>(args...)
// Called from parseInfixExpression when we detect identifier < type > (
func (p *Parser) parseGenericCallExpression(fn ast.Expression, typeArg string) ast.Expression {
	exp := &ast.CallExpression{Token: p.curToken, Function: fn, TypeArg: typeArg}
	exp.Arguments = p.parseCallArguments()
	return exp
}

func (p *Parser) parseCallArguments() []ast.Expression {
	args := []ast.Expression{}

	if p.peekTokenIs(token.RPAREN) {
		p.nextToken()
		return args
	}

	p.nextToken()
	args = append(args, p.parseExpression(LOWEST))

	for p.peekTokenIs(token.COMMA) {
		p.nextToken()
		p.nextToken()
		args = append(args, p.parseExpression(LOWEST))
	}

	if !p.expectPeek(token.RPAREN) {
		return nil
	}
	return args
}

func (p *Parser) parseIndexExpression(left ast.Expression) ast.Expression {
	exp := &ast.IndexExpression{Left: left}
	p.nextToken()
	exp.Index = p.parseExpression(LOWEST)
	if !p.expectPeek(token.RBRACKET) {
		return nil
	}
	return exp
}

func (p *Parser) parseHashLiteral() ast.Expression {
	hash := &ast.HashLiteral{Token: p.curToken}
	hash.Pairs = make(map[ast.Expression]ast.Expression)

	for !p.peekTokenIs(token.RBRACE) {
		p.nextToken()
		key := p.parseExpression(LOWEST)

		if !p.expectPeek(token.COLON) {
			return nil
		}

		p.nextToken()
		value := p.parseExpression(LOWEST)

		hash.Pairs[key] = value

		if !p.peekTokenIs(token.RBRACE) && !p.expectPeek(token.COMMA) {
			return nil
		}
	}

	if !p.expectPeek(token.RBRACE) {
		return nil
	}
	return hash
}

/* ---------- helpers ---------- */

func (p *Parser) curTokenIs(t token.TokenType) bool  { return p.curToken.Type == t }
func (p *Parser) peekTokenIs(t token.TokenType) bool { return p.peekToken.Type == t }

func (p *Parser) peekPeekTokenIs(t token.TokenType) bool {
	lClone := *p.l
	next := lClone.NextToken()
	return next.Type == t
}

func (p *Parser) expectPeek(t token.TokenType) bool {
	if p.peekTokenIs(t) {
		p.nextToken()
		return true
	}
	p.addError(fmt.Sprintf("expected next token %s, got %s", t, p.peekToken.Type), p.peekToken)
	return false
}

func (p *Parser) peekPrecedence() int {
	if p, ok := precedences[p.peekToken.Type]; ok {
		return p
	}
	return LOWEST
}

func (p *Parser) curPrecedence() int {
	if p, ok := precedences[p.curToken.Type]; ok {
		return p
	}
	return LOWEST
}

func (p *Parser) registerPrefix(t token.TokenType, fn prefixParseFn) {
	p.prefixParseFns[t] = fn
}

func (p *Parser) registerInfix(t token.TokenType, fn infixParseFn) {
	p.infixParseFns[t] = fn
}

func (p *Parser) parseStructLiteral() ast.Expression {
	strct := &ast.StructLiteral{Token: p.curToken}
	strct.Pairs = make(map[string]ast.Expression)

	if !p.expectPeek(token.LBRACE) {
		return nil
	}

	for !p.peekTokenIs(token.RBRACE) {
		p.nextToken()
		if p.curToken.Type != token.IDENT {
			return nil
		}
		key := p.curToken.Literal

		if !p.expectPeek(token.COLON) {
			return nil
		}
		p.nextToken()
		value := p.parseExpression(LOWEST)

		strct.Pairs[key] = value

		if !p.peekTokenIs(token.RBRACE) && !p.expectPeek(token.COMMA) {
			return nil
		}
	}
	if !p.expectPeek(token.RBRACE) {
		return nil
	}
	return strct
}

func (p *Parser) parseNewExpression() ast.Expression {
	exp := &ast.NewExpression{Token: p.curToken}
	if !p.expectPeek(token.IDENT) {
		return nil
	}
	exp.Class = p.curToken.Literal

	// parse type args: new p<int>()
	if p.peekTokenIs(token.LT) {
		p.nextToken() // <
		if p.peekTokenIs(token.IDENT) {
			p.nextToken() // type arg e.g. "int"
			exp.GenericType = p.curToken.Literal
		}
		if p.peekTokenIs(token.GT) {
			p.nextToken() // >
		}
	}

	if !p.expectPeek(token.LPAREN) {
		return nil
	}
	exp.Arguments = p.parseCallArguments()
	return exp
}

func (p *Parser) parseAssignExpression(left ast.Expression) ast.Expression {
	exp := &ast.AssignExpression{Token: p.curToken, Left: left}
	p.nextToken()
	exp.Value = p.parseExpression(LOWEST)
	return exp
}

func (p *Parser) parsePropertyAccessExpression(left ast.Expression) ast.Expression {
	exp := &ast.PropertyAccessExpression{Token: p.curToken, Object: left}
	p.nextToken() 
	if p.curToken.Type != token.IDENT {
		p.addError("expected identifier after property access", p.curToken)
		return nil
	}
	exp.Property = &ast.Identifier{Token: p.curToken, Value: p.curToken.Literal}
	return exp
}

func (p *Parser) parseForStatement() ast.Expression {
	expr := &ast.ForStatement{Token: p.curToken}
	
	if !p.expectPeek(token.LPAREN) {
		return nil
	}
	p.nextToken()
	
	if !p.curTokenIs(token.SEMICOLON) {
		expr.Init = p.parseStatement()
	}
	for !p.curTokenIs(token.SEMICOLON) && p.curToken.Type != token.EOF {
		p.nextToken()
	}
	if p.curTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	
	if !p.curTokenIs(token.SEMICOLON) {
		expr.Condition = p.parseExpression(LOWEST)
	}
	for !p.curTokenIs(token.SEMICOLON) && p.curToken.Type != token.EOF {
		p.nextToken()
	}
	if p.curTokenIs(token.SEMICOLON) {
		p.nextToken()
	}
	
	if !p.curTokenIs(token.RPAREN) {
		expr.Post = p.parseStatement()
	}
	for !p.curTokenIs(token.RPAREN) && p.curToken.Type != token.EOF {
		p.nextToken()
	}
	
	if !p.expectPeek(token.LBRACE) {
		return nil
	}
	expr.Body = p.parseBlockStatement()

	return expr
}

func (p *Parser) parseTimeExpression() ast.Expression {
	tok := p.curToken
	if p.peekTokenIs(token.SEMICOLON) || p.peekTokenIs(token.COMMA) ||
		p.peekTokenIs(token.RPAREN) || p.peekTokenIs(token.RBRACKET) ||
		p.peekTokenIs(token.RBRACE) || p.peekTokenIs(token.EOF) {
		return &ast.TimeExpression{Token: tok, Standalone: true}
	}
	p.nextToken()
	right := p.parseExpression(PREFIX)
	return &ast.TimeExpression{Token: tok, Standalone: false, Right: right}
}
