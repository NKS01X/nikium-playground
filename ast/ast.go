package ast

import (
	"Nikium/token"
	"bytes"
	"strings"
)

type Node interface {
	TokenLiteral() string
	String() string
	GetToken() token.Token
}

type Statement interface {
	Node
	statementNode()
}

type Expression interface {
	Node
	expressionNode()
}

type Program struct {
	Statements []Statement
}

func (p *Program) TokenLiteral() string {
	if len(p.Statements) > 0 {
		return p.Statements[0].TokenLiteral()
	} else {
		return ""
	}
}

func (p *Program) String() string {
	var out bytes.Buffer

	for _, s := range p.Statements {
		out.WriteString(s.String())
	}

	return out.String()
}

type Boolean struct {
	Token token.Token
	Value bool
}

func (b *Boolean) expressionNode()      {}
func (b *Boolean) TokenLiteral() string { return b.Token.Literal }
func (b *Boolean) String() string       { return b.Token.Literal }

type LetStatement struct {
	Token       token.Token // the 'let' token
	Name        *Identifier
	Value       Expression
	Type        string
	GenericType string // e.g. "T" from generic<T>
}

type FunctionLiteral struct {
	Token         token.Token // the 'fn' token
	GenericType   string      // e.g. "T"
	Parameters    []*Identifier // Parameters will remain identifiers 
	Body          *BlockStatement
}

func (fl *FunctionLiteral) expressionNode()      {}
func (fl *FunctionLiteral) TokenLiteral() string { return fl.Token.Literal }
func (fl *FunctionLiteral) String() string {
	var out bytes.Buffer

	out.WriteString("fn(")

	for i, p := range fl.Parameters {
		out.WriteString(p.String())
		if i < len(fl.Parameters)-1 {
			out.WriteString(", ")
		}
	}

	out.WriteString(") ")
	out.WriteString(fl.Body.String())

	return out.String()
}

type CallExpression struct {
	Token     token.Token // the '(' token
	Function  Expression  // Identifier or FunctionLiteral
	TypeArg   string      // e.g. "int" from func<int>(...)
	Arguments []Expression
}

func (ce *CallExpression) expressionNode()      {}
func (ce *CallExpression) TokenLiteral() string { return ce.Token.Literal }
func (ce *CallExpression) String() string {
	var out bytes.Buffer

	out.WriteString(ce.Function.String())
	out.WriteString("(")

	for i, arg := range ce.Arguments {
		out.WriteString(arg.String())
		if i < len(ce.Arguments)-1 {
			out.WriteString(", ")
		}
	}

	out.WriteString(")")

	return out.String()
}

func (ls *LetStatement) statementNode()       {}
func (ls *LetStatement) TokenLiteral() string { return ls.Name.TokenLiteral() }
func (ls *LetStatement) String() string {
	var out bytes.Buffer

	out.WriteString(ls.Name.String())
	if ls.Type != "" {
		out.WriteString(":" + ls.Type)
	}
	out.WriteString(" = ")
	if ls.Value != nil {
		out.WriteString(ls.Value.String())
	}

	out.WriteString(";")

	return out.String()
}

type PrintStatement struct {
	Token token.Token
	Value Expression
}

func (ps *PrintStatement) statementNode()       {}
func (ps *PrintStatement) TokenLiteral() string { return ps.Token.Literal }
func (ps *PrintStatement) String() string {
	var out bytes.Buffer

	out.WriteString("print")
	out.WriteString(" ")
	if ps.Value != nil {
		out.WriteString(ps.Value.String())
	}

	out.WriteString(";")

	return out.String()
}

type ExpressionStatement struct {
	Token      token.Token // the first token of the expression
	Expression Expression
}

func (es *ExpressionStatement) statementNode()       {}
func (es *ExpressionStatement) TokenLiteral() string { return es.Token.Literal }
func (es *ExpressionStatement) String() string {
	if es.Expression != nil {
		return es.Expression.String()
	}
	return ""
}

type BlockStatement struct {
	Token      token.Token // the { token
	Statements []Statement
}

func (bs *BlockStatement) statementNode()       {}
func (bs *BlockStatement) TokenLiteral() string { return bs.Token.Literal }
func (bs *BlockStatement) String() string {
	var out bytes.Buffer

	for _, s := range bs.Statements {
		out.WriteString(s.String())
	}

	return out.String()
}

type Identifier struct {
	Token token.Token // the 'IDENT' token
	Value string
}

func (i *Identifier) expressionNode()      {}
func (i *Identifier) TokenLiteral() string { return i.Token.Literal }
func (i *Identifier) String() string       { return i.Value }

type IntegerLiteral struct {
	Token token.Token
	Value int64
}

func (il *IntegerLiteral) expressionNode()      {}
func (il *IntegerLiteral) TokenLiteral() string { return il.Token.Literal }
func (il *IntegerLiteral) String() string       { return il.Token.Literal }

type StringLiteral struct {
	Token token.Token
	Value string
}

func (sl *StringLiteral) expressionNode()      {}
func (sl *StringLiteral) TokenLiteral() string { return sl.Token.Literal }
func (sl *StringLiteral) String() string       { return sl.Token.Literal }

type PrefixExpression struct {
	Token    token.Token // The prefix token, e.g. !
	Operator string
	Right    Expression
}

func (pe *PrefixExpression) expressionNode()      {}
func (pe *PrefixExpression) TokenLiteral() string { return pe.Token.Literal }
func (pe *PrefixExpression) String() string {
	var out bytes.Buffer

	out.WriteString("(")
	out.WriteString(pe.Operator)
	out.WriteString(pe.Right.String())
	out.WriteString(")")

	return out.String()
}

type PostfixExpression struct {
	Token    token.Token // The postfix token, e.g. ++
	Operator string
	Left     Expression
}

func (pe *PostfixExpression) expressionNode()      {}
func (pe *PostfixExpression) TokenLiteral() string { return pe.Token.Literal }
func (pe *PostfixExpression) String() string {
	var out bytes.Buffer
	out.WriteString("(")
	out.WriteString(pe.Left.String())
	out.WriteString(pe.Operator)
	out.WriteString(")")
	return out.String()
}

type BinaryExpression struct {
	Token    token.Token // The operator token, e.g. +
	Left     Expression
	Operator string
	Right    Expression
}

func (oe *BinaryExpression) expressionNode()      {}
func (oe *BinaryExpression) TokenLiteral() string { return oe.Token.Literal }
func (oe *BinaryExpression) String() string {
	var out bytes.Buffer

	out.WriteString("(")
	out.WriteString(oe.Left.String())
	out.WriteString(" " + oe.Operator + " ")
	out.WriteString(oe.Right.String())
	out.WriteString(")")

	return out.String()
}

type IfStatement struct {
	Token       token.Token // The 'if' token
	Condition   Expression
	Consequence *BlockStatement
	Alternative *BlockStatement
}

func (ie *IfStatement) expressionNode()      {}
func (ie *IfStatement) TokenLiteral() string { return ie.Token.Literal }
func (ie *IfStatement) String() string {
	var out bytes.Buffer

	out.WriteString("if")
	out.WriteString(ie.Condition.String())
	out.WriteString(" ")
	out.WriteString(ie.Consequence.String())

	if ie.Alternative != nil {
		out.WriteString("else ")
		out.WriteString(ie.Alternative.String())
	}

	return out.String()
}

type WhileStatement struct {
	Token     token.Token // The 'while' token
	Condition Expression
	Body      *BlockStatement
}

func (ws *WhileStatement) expressionNode()      {}
func (ws *WhileStatement) TokenLiteral() string { return ws.Token.Literal }
func (ws *WhileStatement) String() string {
	var out bytes.Buffer

	out.WriteString("while")
	out.WriteString(ws.Condition.String())
	out.WriteString(" ")
	out.WriteString(ws.Body.String())

	return out.String()
}

type LoadStatement struct {
	Token token.Token // the 'load' token
	File  *StringLiteral
}

func (ls *LoadStatement) statementNode()       {}
func (ls *LoadStatement) TokenLiteral() string { return ls.Token.Literal }
func (ls *LoadStatement) String() string {
	return "load " + ls.File.String() + ";"
}

type ReturnStatement struct {
	Token       token.Token // the 'return' token
	ReturnValue Expression
}

func (rs *ReturnStatement) statementNode()       {}
func (rs *ReturnStatement) TokenLiteral() string { return rs.Token.Literal }
func (rs *ReturnStatement) String() string {
	var out bytes.Buffer

	out.WriteString("return ")
	if rs.ReturnValue != nil {
		out.WriteString(rs.ReturnValue.String())
	}
	out.WriteString(";")

	return out.String()
}

type BreakStatement struct {
	Token token.Token
}

func (bs *BreakStatement) statementNode()       {}
func (bs *BreakStatement) TokenLiteral() string { return bs.Token.Literal }
func (bs *BreakStatement) String() string       { return "break;" }

type ContinueStatement struct {
	Token token.Token
}

func (cs *ContinueStatement) statementNode()       {}
func (cs *ContinueStatement) TokenLiteral() string { return cs.Token.Literal }
func (cs *ContinueStatement) String() string       { return "continue;" }

type IndexExpression struct {
	Left  Expression
	Index Expression
}

func (ie *IndexExpression) expressionNode()      {}
func (ie *IndexExpression) TokenLiteral() string { return "[" } // optional
func (ie *IndexExpression) String() string {
	var out bytes.Buffer
	out.WriteString("(")
	out.WriteString(ie.Left.String())
	out.WriteString("[")
	out.WriteString(ie.Index.String())
	out.WriteString("])")
	return out.String()
}

type ArrayLiteral struct {
	Token    token.Token
	Elements []Expression
}

func (al *ArrayLiteral) expressionNode() {}

func (al *ArrayLiteral) TokenLiteral() string {
	return al.Token.Literal
}

func (al *ArrayLiteral) String() string {
	var out strings.Builder

	out.WriteString("[")
	for i, el := range al.Elements {
		if i > 0 {
			out.WriteString(", ")
		}
		out.WriteString(el.String())
	}
	out.WriteString("]")

	return out.String()
}

type HashLiteral struct {
	Token token.Token // the '{' token
	Pairs map[Expression]Expression
}

func (hl *HashLiteral) expressionNode()      {}
func (hl *HashLiteral) TokenLiteral() string { return hl.Token.Literal }
func (hl *HashLiteral) String() string {
	var out strings.Builder
	out.WriteString("{")
	i := 0
	for k, v := range hl.Pairs {
		if i > 0 {
			out.WriteString(", ")
		}
		out.WriteString(k.String())
		out.WriteString(": ")
		out.WriteString(v.String())
		i++
	}
	out.WriteString("}")
	return out.String()
}

type StructLiteral struct {
	Token       token.Token // the 'struct' token
	GenericType string      // e.g. "T"
	Pairs       map[string]Expression
}

func (sl *StructLiteral) expressionNode()      {}
func (sl *StructLiteral) TokenLiteral() string { return sl.Token.Literal }
func (sl *StructLiteral) String() string {
	var out strings.Builder
	out.WriteString("struct{")
	i := 0
	for k, v := range sl.Pairs {
		if i > 0 {
			out.WriteString(", ")
		}
		out.WriteString(k)
		out.WriteString(": ")
		out.WriteString(v.String())
		i++
	}
	out.WriteString("}")
	return out.String()
}

type PropertyAccessExpression struct {
	Token    token.Token // The . or -> token
	Object   Expression
	Property *Identifier
}

func (pa *PropertyAccessExpression) expressionNode()      {}
func (pa *PropertyAccessExpression) TokenLiteral() string { return pa.Token.Literal }
func (pa *PropertyAccessExpression) String() string {
	var out strings.Builder
	out.WriteString("(")
	out.WriteString(pa.Object.String())
	out.WriteString(pa.Token.Literal)
	out.WriteString(pa.Property.String())
	out.WriteString(")")
	return out.String()
}

type ForStatement struct {
	Token     token.Token // The 'for' token
	Init      Statement
	Condition Expression
	Post      Statement
	Body      *BlockStatement
}

func (fs *ForStatement) expressionNode()      {}
func (fs *ForStatement) TokenLiteral() string { return fs.Token.Literal }
func (fs *ForStatement) String() string {
	var out strings.Builder
	out.WriteString("for(")
	if fs.Init != nil {
		out.WriteString(fs.Init.String())
	}
	out.WriteString(" ")
	if fs.Condition != nil {
		out.WriteString(fs.Condition.String())
	}
	out.WriteString("; ")
	if fs.Post != nil {
		out.WriteString(fs.Post.String())
	}
	out.WriteString(") ")
	out.WriteString(fs.Body.String())
	return out.String()
}

type AssignExpression struct {
	Token token.Token // "="
	Left  Expression
	Value Expression
}

func (ae *AssignExpression) expressionNode()      {}
func (ae *AssignExpression) TokenLiteral() string { return ae.Token.Literal }
func (ae *AssignExpression) String() string {
	return "(" + ae.Left.String() + " = " + ae.Value.String() + ")"
}


type VarDeclaration struct {
	Token       token.Token // The 'IDENT' token of the type
	Type        string
	GenericType string // e.g. "T"
	IsPointer   bool
	Name        *Identifier
	Value       Expression
}

func (vd *VarDeclaration) statementNode()       {}
func (vd *VarDeclaration) TokenLiteral() string { return vd.Token.Literal }
func (vd *VarDeclaration) String() string {
	var out strings.Builder
	out.WriteString(vd.Type)
	if vd.IsPointer {
		out.WriteString("*")
	}
	out.WriteString(" ")
	out.WriteString(vd.Name.String())

	if vd.Value != nil {
		out.WriteString(" = ")
		out.WriteString(vd.Value.String())
	}
	out.WriteString(";")

	return out.String()
}

type NewExpression struct {
	Token       token.Token // The 'new' token
	Class       string
	GenericType string      // e.g. "int"
	Arguments   []Expression
}

func (ne *NewExpression) expressionNode()      {}
func (ne *NewExpression) TokenLiteral() string { return ne.Token.Literal }
func (ne *NewExpression) String() string {
	var out strings.Builder
	out.WriteString("new ")
	out.WriteString(ne.Class)
	out.WriteString("()")
	return out.String()
}



func (n *Program) GetToken() token.Token { if len(n.Statements) > 0 { return n.Statements[0].GetToken() }; return token.Token{} }
func (n *Boolean) GetToken() token.Token { return n.Token }
func (n *LetStatement) GetToken() token.Token { return n.Token }
func (n *FunctionLiteral) GetToken() token.Token { return n.Token }
func (n *CallExpression) GetToken() token.Token { return n.Token }
func (n *PrintStatement) GetToken() token.Token { return n.Token }
func (n *ExpressionStatement) GetToken() token.Token { return n.Token }
func (n *BlockStatement) GetToken() token.Token { return n.Token }
func (n *Identifier) GetToken() token.Token { return n.Token }
func (n *IntegerLiteral) GetToken() token.Token { return n.Token }
func (n *StringLiteral) GetToken() token.Token { return n.Token }
func (n *PrefixExpression) GetToken() token.Token { return n.Token }
func (n *PostfixExpression) GetToken() token.Token { return n.Token }
func (n *BinaryExpression) GetToken() token.Token { return n.Token }
func (n *IfStatement) GetToken() token.Token { return n.Token }
func (n *WhileStatement) GetToken() token.Token { return n.Token }
func (n *LoadStatement) GetToken() token.Token { return n.Token }
func (n *ReturnStatement) GetToken() token.Token { return n.Token }
func (n *BreakStatement) GetToken() token.Token { return n.Token }
func (n *ContinueStatement) GetToken() token.Token { return n.Token }
func (n *IndexExpression) GetToken() token.Token { return n.Left.GetToken() }
func (n *ArrayLiteral) GetToken() token.Token { return n.Token }
func (n *HashLiteral) GetToken() token.Token { return n.Token }
func (n *StructLiteral) GetToken() token.Token { return n.Token }
func (n *PropertyAccessExpression) GetToken() token.Token { return n.Token }
func (n *ForStatement) GetToken() token.Token { return n.Token }
func (n *AssignExpression) GetToken() token.Token { return n.Token }
func (n *VarDeclaration) GetToken() token.Token { return n.Token }
func (n *NewExpression) GetToken() token.Token { return n.Token }

type TimeExpression struct {
	Token      token.Token // The 'time', 'datetime', or 'now' token
	Standalone bool
	Right      Expression
}

func (te *TimeExpression) expressionNode()      {}
func (te *TimeExpression) TokenLiteral() string { return te.Token.Literal }
func (te *TimeExpression) String() string {
	if te.Standalone {
		return te.Token.Literal
	}
	return "(" + te.Token.Literal + " " + te.Right.String() + ")"
}
func (te *TimeExpression) GetToken() token.Token { return te.Token }

