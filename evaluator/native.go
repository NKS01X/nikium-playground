package evaluator

import (
	"bufio"
	"os"
	"strings"
)

var stdinReader = bufio.NewReader(os.Stdin)

func nativeReadChar(args []Object) Object {
	ch, _, err := stdinReader.ReadRune()
	if err != nil {
		return &String{Value: ""}
	}
	return &String{Value: string(ch)}
}
func nativeReadLine(args []Object) Object {
	line, err := stdinReader.ReadString('\n')
	if err != nil {
		return &String{Value: ""}
	}
	return &String{Value: strings.TrimRight(line, "\r\n")}
}
