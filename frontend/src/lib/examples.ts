import type { Example } from '../types'

export const examples: Example[] = [
  {
    id: 'hello-world',
    title: 'Hello, Nikium!',
    description: 'Write your first Nikium program.',
    content: `## Welcome to Nikium!

Nikium is an expressive scripting language designed for both rapid prototyping and systems-level manipulation.

### Basic Syntax
Statements **must** be terminated with a semicolon (\`;\`).

\`\`\`nikium
print "Hello, Nikium!";
print "Print accepts multiple args:", 42;
\`\`\`

> **Note**: \`print\` appends a newline automatically after each call.`,
    starterCode: 'print "Hello, Nikium!";\nprint "Welcome to the Playground.";\n',
    expectedOutput: 'Hello, Nikium!\nWelcome to the Playground.',
  },
  {
    id: 'variables',
    title: 'Variables & Types',
    description: 'Store and inspect different data types.',
    content: `## Variables & Data Types

Nikium is dynamically typed — no type declarations needed. Use \`=\` to bind a value to a name.

### Built-in Types
| Type | Example | Notes |
|---|---|---|
| Integer | \`42\` | 64-bit signed |
| String | \`"hello"\` | UTF-8 |
| Boolean | \`true\`, \`false\` | |
| Null | \`null\` | Absence of value |
| Array | \`[1, 2, 3]\` | Mixed types OK |
| Hash | \`{"a": 1}\` | Key-value map |

### Type Inspection
Use the built-in \`type()\` function to inspect a value's runtime type:
\`\`\`nikium
x = 42;
print type(x); // INTEGER
\`\`\`

### Type Conversion
- \`str(value)\` — converts any value to its string representation.
- \`int_parse(string)\` — parses a string into an integer.
- \`ord(char)\` — returns the ASCII/Unicode code point of a character.
- \`chr(code)\` — returns the character for a given code point.`,
    starterCode: 'name = "Nikium";\nversion = 2;\nactive = true;\n\nprint "Type of name: " + type(name);\nprint "Type of version: " + type(version);\nprint "Type of active: " + type(active);\n\nprint "Converted: " + str(version);\nprint "Parsed: " + str(int_parse("1337"));\nprint "ASCII of A: " + str(ord("A"));\nprint "Char 65: " + chr(65);\n',
  },
  {
    id: 'expressions',
    title: 'Expressions & Arithmetic',
    description: 'Math, modulo, and bitwise operations.',
    content: `## Arithmetic & Bitwise Operations

### Standard Math Operators
\`+\`  \`-\`  \`*\`  \`/\`  \`%\` (modulo)

\`\`\`nikium
print 10 + 3;  // 13
print 10 % 3;  // 1
print (2 + 3) * 4; // 20
\`\`\`

### Increment / Decrement
Use the prefix \`++\` and \`--\` to mutate a variable by 1:
\`\`\`nikium
x = 5;
++x;
print x; // 6
\`\`\`

### Bitwise Functions
| Function | Description |
|---|---|
| \`bit_and(a, b)\` | Bitwise AND |
| \`bit_or(a, b)\` | Bitwise OR |
| \`bit_xor(a, b)\` | Bitwise XOR |
| \`bit_not(a)\` | Bitwise NOT |

### Bit Shift Operators
Use \`<<\` and \`>>\` for left/right bit shifts.
\`\`\`nikium
print 1 << 4; // 16
print 64 >> 2; // 16
\`\`\``,
    starterCode: 'print "Math:";\nprint 10 + 5;\nprint 10 % 3;\n\nprint "Bitwise:";\nprint bit_and(12, 10);  // 8\nprint bit_or(12, 10);   // 14\nprint bit_xor(12, 10);  // 6\n\nprint "Shifts:";\nprint 1 << 4;  // 16\nprint 64 >> 2; // 16\n',
  },
  {
    id: 'conditionals',
    title: 'Conditionals (if / else)',
    description: 'Control flow and logical operators.',
    content: `## If / Else Branching

Braces \`{}\` are **required** for all branches.

### Logical Operators
| Operator | Meaning |
|---|---|
| \`==\`, \`!=\` | Equality |
| \`<\`, \`>\`, \`<=\`, \`>=\` | Relational |
| \`&&\` | Logical AND |
| \`\|\|\` | Logical OR |
| \`!\` | Logical NOT |

> Nikium treats \`null\` and \`false\` as falsy. Everything else is truthy.

\`\`\`nikium
x = 42;
if x > 50 {
  print "big";
} else {
  print "small";
}
\`\`\``,
    starterCode: 'temp = 75;\nraining = false;\n\nif temp > 70 && !raining {\n  print "Great weather!";\n} else {\n  print "Stay inside.";\n}\n\n// Chain conditions\ngrade = 85;\nif grade >= 90 {\n  print "A";\n} else {\n  if grade >= 80 {\n    print "B";\n  } else {\n    print "C";\n  }\n}\n',
  },
  {
    id: 'loops',
    title: 'Loops (while / for)',
    description: 'Repeat code with while and for loops.',
    content: `## Loops

### While Loop
Runs while the condition is truthy.
\`\`\`nikium
i = 0;
while i < 5 {
  print i;
  ++i;
}
\`\`\`

### For Loop
C-style for loop for compact iteration:
\`\`\`nikium
for (i = 0; i < 5; ++i) {
  print i;
}
\`\`\`

### Loop Control
- \`break;\` — exits the innermost loop immediately.
- \`continue;\` — skips to the next iteration.

\`\`\`nikium
i = 0;
while i < 10 {
  ++i;
  if i == 5 { break; }
  print i;
}
\`\`\``,
    starterCode: '// While loop\ni = 0;\nwhile i < 4 {\n  print "while: " + str(i);\n  ++i;\n}\n\n// For loop\nfor (j = 0; j < 4; ++j) {\n  print "for: " + str(j);\n}\n\n// Break example\ni = 0;\nwhile i < 100 {\n  if i == 3 { break; }\n  print "break at 3, now: " + str(i);\n  ++i;\n}\n',
  },
  {
    id: 'functions',
    title: 'Functions & Closures',
    description: 'First-class functions, lambdas, and closures.',
    content: `## First-Class Functions

Functions in Nikium are values — assign them, pass them, return them.

### Defining a Function
\`\`\`nikium
add = fn(a, b) {
  return a + b;
};
print add(3, 4); // 7
\`\`\`

### Higher-Order Functions
Functions can accept and return other functions:
\`\`\`nikium
apply = fn(f, x) { return f(x); };
double = fn(n) { return n * 2; };
print apply(double, 5); // 10
\`\`\`

### Closures
Functions capture their surrounding environment:
\`\`\`nikium
make_adder = fn(n) {
  return fn(x) { return x + n; };
};
add5 = make_adder(5);
print add5(10); // 15
\`\`\``,
    starterCode: '// Higher-order functions\napply = fn(f, x) { return f(x); };\ndouble = fn(n) { return n * 2; };\nprint apply(double, 5);\n\n// Closures\nmake_counter = fn() {\n  count = 0;\n  return fn() {\n    ++count;\n    return count;\n  };\n};\ncounter = make_counter();\nprint counter();\nprint counter();\nprint counter();\n',
  },
  {
    id: 'structs',
    title: 'Structs & OOP',
    description: 'Define custom types, constructors, and destructors.',
    content: `## Structs & Object-Oriented Programming

Use the \`struct\` keyword to define custom data types. Instantiate them with \`new\`, which allocates on the heap and returns a **pointer**.

### Defining a Struct
\`\`\`nikium
Point = struct {
  x: 0,
  y: 0,
  Point: fn(this, x, y) {  // constructor (same name as struct)
    this->x = x;
    this->y = y;
  }
};
\`\`\`

### Instantiation via \`new\`
\`\`\`nikium
p = new Point(10, 20);
\`\`\`

### Property Access
- **Pointer** (from \`new\`): use \`->\` (e.g., \`p->x\`)
- **Value** (from \`struct\` literal): use \`.\` (e.g., \`s.field\`)

### Destructors
Define a method named \`~ClassName\` and it will be called automatically when \`free(ptr)\` is invoked:
\`\`\`nikium
~Point: fn(this) {
  print "Point destroyed";
}
\`\`\`

> **Memory**: Pointers created via \`new\` are tracked in the Arena. Call \`free(ptr)\` to release them.`,
    starterCode: 'Point = struct {\n  x: 0,\n  y: 0,\n  Point: fn(this, x, y) {\n    this->x = x;\n    this->y = y;\n  },\n  describe: fn(this) {\n    print "Point(" + str(this->x) + ", " + str(this->y) + ")";\n  }\n};\n\np1 = new Point(3, 7);\np1->describe();\n\np1->x = 99;\np1->describe();\n\nfree(p1);\n',
  },
  {
    id: 'arrays',
    title: 'Arrays',
    description: 'Dynamic arrays and built-in array functions.',
    content: `## Arrays

Arrays are ordered, 0-indexed collections that can hold mixed types.

### Creation & Access
\`\`\`nikium
data = [10, "hello", true, null];
print data[0]; // 10
print data[1]; // hello
\`\`\`

### Built-in Array Functions
| Function | Description |
|---|---|
| \`len(arr)\` | Number of elements |
| \`push(arr, elem)\` | Returns new array with element appended |

\`\`\`nikium
nums = [1, 2, 3];
nums = push(nums, 4);
print len(nums); // 4
\`\`\`

### Iterating an Array
\`\`\`nikium
items = ["a", "b", "c"];
i = 0;
while i < len(items) {
  print items[i];
  ++i;
}
\`\`\``,
    starterCode: 'nums = [10, 20, 30];\nprint "Array: " + str(nums);\nprint "Length: " + str(len(nums));\nprint "Index 1: " + str(nums[1]);\n\nnums = push(nums, 40);\nprint "After push: " + str(nums);\n\ni = 0;\nwhile i < len(nums) {\n  print "Item: " + str(nums[i]);\n  ++i;\n}\n',
  },
  {
    id: 'hashmaps',
    title: 'Hash Maps',
    description: 'Key-value dictionaries with built-in manipulation functions.',
    content: `## Hash Maps

Hash maps store key-value pairs. Keys can be strings, integers, or booleans.

### Creation & Access
\`\`\`nikium
user = {"name": "Alice", "age": 30, "admin": true};
print user["name"]; // Alice
\`\`\`

### Built-in Hash Functions
| Function | Description |
|---|---|
| \`keys(hash)\` | Returns array of keys |
| \`values(hash)\` | Returns array of values |
| \`has_key(hash, key)\` | Returns true if key exists |
| \`set(hash, key, value)\` | Returns new hash with key set |
| \`delete_key(hash, key)\` | Returns new hash with key removed |
| \`len(hash)\` | Number of key-value pairs |

> All mutation functions return a **new copy** — they do not mutate in place.`,
    starterCode: 'user = {"name": "Nik", "role": "Developer"};\n\nprint "Name: " + user["name"];\nprint "Keys: " + str(keys(user));\nprint "Has role? " + str(has_key(user, "role"));\nprint "Has age? " + str(has_key(user, "age"));\n\nuser = set(user, "age", 25);\nprint "Updated keys: " + str(keys(user));\n\nuser = delete_key(user, "role");\nprint "After delete: " + str(keys(user));\nprint "Total fields: " + str(len(user));\n',
  },
  {
    id: 'generics',
    title: 'Generic Functions & Structs',
    description: 'Type-parameterized functions and data structures.',
    content: `## Generics

Nikium supports generic type parameters for both functions and structs.

### Generic Functions
Declare a type parameter with \`<T>\` after \`fn\`, then pass the concrete type when calling:
\`\`\`nikium
identity = fn<T>(x) {
  return x;
};
print identity<int>(42);
print identity<string>("hello");
\`\`\`

### Generic Structs
Structs can also hold generic type slots:
\`\`\`nikium
Box = struct {
  value: T,
  Box<T>: fn(this, v) {
    this->value = v;
  }
};
b = new Box<int>(100);
print b->value; // 100
\`\`\`

> If you pass a mismatched type (e.g. a string to an \`<int>\` call), Nikium throws a type mismatch error at runtime.`,
    starterCode: 'identity = fn<T>(x) {\n  return x;\n};\n\nprint identity<int>(99);\nprint identity<string>("Nikium");\n',
  },
  {
    id: 'json',
    title: 'JSON Serialization',
    description: 'Parse and stringify JSON data natively.',
    content: `## JSON Interoperability

Nikium provides native JSON support through two built-in functions:

| Function | Description |
|---|---|
| \`json_parse(str)\` | Parses a JSON string into Nikium objects |
| \`json_stringify(obj)\` | Serializes a Nikium value to a JSON string |

### Parsing JSON
\`\`\`nikium
raw = '{"status": "ok", "code": 200}';
data = json_parse(raw);
print data["status"]; // ok
print data["code"];   // 200
\`\`\`

### Stringifying
\`\`\`nikium
config = {"debug": true, "port": 8080};
print json_stringify(config);
// {"debug":true,"port":8080}
\`\`\`

Works with nested arrays and hashes.`,
    starterCode: 'config = {"debug": true, "port": 8080, "tags": ["v1", "stable"]};\njson_str = json_stringify(config);\nprint "JSON: " + json_str;\n\nparsed = json_parse(json_str);\nprint "Debug: " + str(parsed["debug"]);\nprint "Port: " + str(parsed["port"]);\nprint "Tags: " + str(parsed["tags"]);\n',
  },
  {
    id: 'time',
    title: 'Time & Sleep',
    description: 'Get the current time, sleep, and format timestamps.',
    content: `## Time Utilities

### Built-in Time Functions
| Function | Description |
|---|---|
| \`time_now()\` | Returns current time as Unix milliseconds |
| \`time_sleep(ms)\` | Pauses execution for \`ms\` milliseconds |
| \`time_format(ms)\` | Formats a Unix-ms timestamp to \`"YYYY-MM-DD HH:MM:SS"\` |

### Example
\`\`\`nikium
start = time_now();
time_sleep(100);
end = time_now();
print "Elapsed ms:", end - start;
\`\`\``,
    starterCode: 'start = time_now();\nprint "Now (unix ms): " + str(start);\nprint "Formatted: " + time_format(start);\n\ntime_sleep(50);\nend = time_now();\nprint "Elapsed: " + str(end - start) + "ms";\n',
  },
  {
    id: 'concurrency',
    title: 'Concurrency (spawn / await)',
    description: 'Spawn background tasks and collect their results.',
    content: `## Concurrency

Nikium supports lightweight concurrency via goroutine-backed tasks.

### Functions
| Function | Description |
|---|---|
| \`spawn(fn)\` | Runs a function in the background; returns a task ID |
| \`await(id)\` | Blocks until the task finishes; returns its result |

### Example
\`\`\`nikium
task = spawn(fn() {
  time_sleep(200);
  return "done";
});

print "Working while task runs...";
result = await(task);
print result;
\`\`\`

You can spawn multiple tasks and await them independently for parallel execution.`,
    starterCode: 'print "Spawning two tasks...";\n\nt1 = spawn(fn() {\n  time_sleep(100);\n  return "task 1 done";\n});\n\nt2 = spawn(fn() {\n  time_sleep(50);\n  return "task 2 done";\n});\n\nprint "Both running in background...";\nprint await(t1);\nprint await(t2);\nprint "All done!";\n',
  },
  {
    id: 'system-io',
    title: 'File I/O & System',
    description: 'Read, write, and manage files. Execute shell commands.',
    content: `## File I/O & System Calls

### File Functions
| Function | Description |
|---|---|
| \`file_read(path)\` | Reads file contents as a string |
| \`file_write(path, data)\` | Writes (overwrites) a file |
| \`file_append(path, data)\` | Appends to a file |
| \`file_exists(path)\` | Returns true if file exists |
| \`file_delete(path)\` | Deletes a file |

### Shell Execution
\`build(command)\` runs a shell command and returns its combined stdout+stderr output as a string. *(Not available in the WASM browser environment.)*

\`\`\`nikium
file_write("notes.txt", "Hello!");
print file_read("notes.txt");
file_append("notes.txt", " More data.");
print file_read("notes.txt");
\`\`\`

### Stdin / Input
- \`readline()\` — reads a full line from stdin.
- \`readchar()\` — reads a single character from stdin.`,
    starterCode: 'file_write("demo.txt", "Line 1\\n");\nfile_append("demo.txt", "Line 2\\n");\n\nif file_exists("demo.txt") {\n  print "File exists!";\n  print file_read("demo.txt");\n}\n\nfile_delete("demo.txt");\nprint "File deleted. Exists now?", file_exists("demo.txt");\n',
  },
  {
    id: 'network',
    title: 'Network Requests',
    description: 'Make HTTP GET requests and check status codes.',
    content: `## Network I/O

Nikium has built-in HTTP client functions for making outbound requests.

### Functions
| Function | Description |
|---|---|
| \`net_get(url)\` | Performs an HTTP GET; returns body as string |
| \`net_status(url)\` | Returns the HTTP status code (integer) |

### Example
\`\`\`nikium
body = net_get("https://api.example.com/data");
parsed = json_parse(body);
print parsed["value"];
\`\`\`

> **WASM Browser Note**: In the playground, network calls are handled via the browser's \`fetch\` API polyfill. CORS restrictions and mixed-content rules apply.`,
    starterCode: 'url = "https://httpbin.org/get";\nstatus = net_status(url);\nprint "HTTP Status: " + str(status);\n\nbody = net_get("https://httpbin.org/json");\ndata = json_parse(body);\nprint "Slideshow title: " + data["slideshow"]["title"];\n',
  },
  {
    id: 'modules',
    title: 'Modules & Standard Library',
    description: 'Import code with load and use the standard library.',
    content: `## Modules

Use \`load "filename.nik";\` to import code from another file. All top-level bindings merge into the current environment.

### Standard Library Modules
| Module | Contents |
|---|---|
| \`math.nik\` | \`abs\`, \`pow\`, \`min\`, \`max\`, \`floor\`, \`ceil\`, \`sqrt\` |
| \`stringutils.nik\` | \`trim\`, \`upper\`, \`lower\`, \`split\`, \`repeat\`, \`replace\` |
| \`arrayutils.nik\` | \`map\`, \`filter\`, \`reduce\`, \`reverse\`, \`sort\` |

### Example
\`\`\`nikium
load "math.nik";
print abs(-42);       // 42
print pow(2, 10);     // 1024
print min(5, 3);      // 3
print max(5, 3);      // 5
\`\`\``,
    starterCode: 'load "math.nik";\nload "stringutils.nik";\n\nprint abs(-99);\nprint pow(2, 8);\nprint max(100, 200);\n\nmsg = "  hello nikium  ";\nprint upper(trim(msg));\n',
  },
  {
    id: 'memory',
    title: 'Manual Memory Management',
    description: 'Allocate and manage raw heap memory via the arena.',
    content: `## Manual Memory Management

For systems-level control, Nikium exposes a raw arena allocator.

### Raw Memory Functions
| Function | Description |
|---|---|
| \`mem_alloc(size)\` | Allocates \`size\` bytes; returns integer address |
| \`mem_free(ptr)\` | Frees the allocated block |
| \`mem_write(ptr, offset, int)\` | Writes a 64-bit integer at byte offset |
| \`mem_read(ptr, offset)\` | Reads a 64-bit integer from byte offset |
| \`mem_stats()\` | Returns \`{heap_size, used_bytes, free_blocks}\` hash |

### Struct Pointer Lifecycle
Objects allocated via \`new\` also live in the arena. Use \`free(ptr)\` (not \`mem_free\`) to trigger the destructor and release them:
\`\`\`nikium
p = new MyStruct(args);
// ... use p->field ...
free(p); // calls ~MyStruct destructor + releases arena slot
\`\`\`

> **Caution**: Writing beyond allocated bounds causes undefined behavior inside the Nikium runtime.`,
    starterCode: 'ptr = mem_alloc(64);\n\nmem_write(ptr, 0, 1337);\nmem_write(ptr, 8, 42);\n\nprint "Offset 0: " + str(mem_read(ptr, 0));\nprint "Offset 8: " + str(mem_read(ptr, 8));\n\nstats = mem_stats();\nprint "Heap size: " + str(stats["heap_size"]);\nprint "Used bytes: " + str(stats["used_bytes"]);\n\nmem_free(ptr);\n',
  },
]
