const fs = require('fs');
const path = './frontend/src/lib/examples.ts';
let content = fs.readFileSync(path, 'utf8');

// Regex to match: print "something", variable;
// We will just do a global replace for common patterns
content = content.replace(/print "([^"]+)", (.*?);/g, (match, p1, p2) => {
  return `print "${p1} " + str(${p2});`;
});

// There is also: print "K is", k; (no colon inside string)
// The regex above captures any string "..." followed by , then expression.
// Let's also check for print var1, var2; which shouldn't exist.

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed prints!");
