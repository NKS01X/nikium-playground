import type { Lesson } from '../types'

export const lessons: Lesson[] = [
  {
    id: 'hello-world',
    title: 'Hello, Nikium!',
    description: 'Write your first Nikium program',
    content: `## Hello, Nikium!

Nikium is a simple, expressive scripting language. Let's start with the classic first program.

The \`print\` keyword outputs text to the console. Try it out:

\`\`\`nikium
print "Hello, Nikium!";
\`\`\`

Click **Run** to see the output!`,
    starterCode: 'print "Hello, Nikium!";\n',
    expectedOutput: 'Hello, Nikium!',
  },
  {
    id: 'variables',
    title: 'Variables & Values',
    description: 'Store and manipulate data',
    content: `## Variables

Use \`=\` to bind a value to a name:

\`\`\`nikium
name = "Nikium";
version = 1;
print name;
print version;
\`\`\`

Nikium supports strings, integers, booleans, and more.`,
    starterCode: 'name = "Nikium";\nversion = 1;\nprint name;\nprint version;\n',
  },
  {
    id: 'expressions',
    title: 'Expressions & Arithmetic',
    description: 'Math operations in Nikium',
    content: `## Arithmetic

Nikium supports standard math operators:

\`\`\`nikium
sum = 10 + 5;
diff = 10 - 5;
product = 10 * 5;
quotient = 10 / 5;
print sum;
print diff;
print product;
print quotient;
\`\`\`

Try modifying the numbers and see what happens!`,
    starterCode: 'sum = 10 + 5;\nprint sum;\n',
  },
  {
    id: 'conditionals',
    title: 'Conditionals (if/else)',
    description: 'Make decisions in your code',
    content: `## If / Else

Use \`if\` and \`else\` to branch your code:

\`\`\`nikium
x = 42;
if x > 50 {
  print "big";
} else {
  print "small";
}
\`\`\`

Comparison operators: \`==\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\``,
    starterCode: 'x = 42;\nif x > 50 {\n  print "big";\n} else {\n  print "small";\n}\n',
  },
  {
    id: 'loops',
    title: 'Loops (while)',
    description: 'Repeat code with while loops',
    content: `## While Loops

Use \`while\` to repeat a block:

\`\`\`nikium
i = 0;
while i < 5 {
  print i;
  ++i;
}
\`\`\`

The \`++i\` increments \`i\` by one. Try counting down with \`--i\`!`,
    starterCode: 'i = 0;\nwhile i < 5 {\n  print i;\n  ++i;\n}\n',
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Define reusable code blocks',
    content: `## Functions

Define functions with \`fn\`:

\`\`\`nikium
greet = fn(name) {
  return "Hello, " + name + "!";
};
print greet("Nikium");
\`\`\`

Functions are values — they can be passed around, stored in variables, and returned from other functions.`,
    starterCode: 'greet = fn(name) {\n  return "Hello, " + name + "!";\n};\nprint greet("Nikium");\n',
  },
  {
    id: 'arrays',
    title: 'Arrays',
    description: 'Work with collections of data',
    content: `## Arrays

Create arrays with \`[\` \`]\`:

\`\`\`nikium
nums = [1, 2, 3, 4, 5];
print nums;
print nums[0];
print len(nums);
\`\`\`

Access elements with \`[index]\` (0-based). Use \`len\` to get the length.`,
    starterCode: 'nums = [1, 2, 3, 4, 5];\nprint nums;\nprint "First:", nums[0];\nprint "Length:", len(nums);\n',
  },
  {
    id: 'load-module',
    title: 'Loading Modules',
    description: 'Import code from other files',
    content: `## The \`load\` Keyword

Reuse code across files with \`load\`:

\`\`\`nikium
load "math.nik";
print abs(-42);
print pow(2, 10);
\`\`\`

The playground includes a standard library with useful modules like \`math.nik\`, \`stringutils.nik\`, and \`arrayutils.nik\`.`,
    starterCode: 'load "math.nik";\nprint abs(-42);\nprint pow(2, 10);\n',
  },
  {
    id: 'strings',
    title: 'String Utilities',
    description: 'Manipulate text with stringutils',
    content: `## String Operations

Load the \`stringutils.nik\` module:

\`\`\`nikium
load "stringutils.nik";
msg = "  hello world  ";
print trim(msg);
print upper(trim(msg));
print repeat("*", 10);
\`\`\`

Try combining \`split\` with \`trim\` to parse text!`,
    starterCode: 'load "stringutils.nik";\nmsg = "  hello world  ";\nprint trim(msg);\nprint upper(trim(msg));\n',
  },
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Use hash maps and arrays',
    content: `## Hash Maps

Nikium has built-in hash maps:

\`\`\`nikium
user = {"name": "Alice", "age": 30};
print user["name"];
print user["age"];
\`\`\`

Use \`keys\` and \`values\` to iterate:

\`\`\`nikium
print keys(user);
print values(user);
\`\`\``,
    starterCode: 'user = {"name": "Alice", "age": 30};\nprint user["name"];\nprint keys(user);\n',
  },
  {
    id: 'generics',
    title: 'Generic Functions',
    description: 'Write flexible, reusable functions',
    content: `## Generics

Define type-parameterized functions with angle brackets:

\`\`\`nikium
identity = fn<T>(x) {
  return x;
};
print identity<10>;
print identity<"hello">;
\`\`\`

Generics let you write one function that works with any type.`,
    starterCode: 'identity = fn<T>(x) {\n  return x;\n};\nprint identity<10>;\nprint identity<"hello">;\n',
  },
  {
    id: 'memory',
    title: 'Manual Memory Management',
    description: 'Allocate and manage memory manually',
    content: `## Memory Management

Nikium gives you low-level control:

\`\`\`nikium
ptr = mem_alloc(64);
mem_write(ptr, 0, 42);
val = mem_read(ptr, 0);
print val;
mem_free(ptr);
\`\`\`

Use with care — manual memory management is powerful but error-prone!`,
    starterCode: 'ptr = mem_alloc(64);\nmem_write(ptr, 0, 42);\nval = mem_read(ptr, 0);\nprint val;\nmem_free(ptr);\n',
  },
]
