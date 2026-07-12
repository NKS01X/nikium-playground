export interface Example {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown documentation
  starterCode: string;
}

export const examples: Example[] = [
  {
    id: 'hello-world',
    title: 'Hello, Nikium!',
    description: 'Write your very first Nikium program.',
    content: `## Welcome to Nikium!

Nikium is a powerful, expressive scripting language. It's designed to be simple enough for beginners to learn quickly, yet powerful enough for advanced systems programming.

### The Basics
In Nikium, you can print text to the screen using the \`print\` statement.
- Every statement must end with a semicolon (\`;\`).
- Text (called "strings") must be wrapped in double quotes (\`"\`).

### Example
\`\`\`nikium
print "Hello, Nikium!";
print "Print automatically adds a new line!";
\`\`\`

> **Tip:** Try modifying the starter code below. Change the text inside the quotes, click **Run**, and watch the Output tab!`,
    starterCode: 'print "Hello, Nikium!";\nprint "Welcome to the Playground.";\n',
  },
  {
    id: 'input-output',
    title: 'Input & Output',
    description: 'Interact with your program using stdin and stdout.',
    content: `## Input & Output

Making your programs interactive is a huge milestone! Nikium provides built-in functions to read input from the user and print results back.

### Printing Output
The \`print\` statement sends text to the output console. You can print strings, numbers, variables — anything!

\`\`\`nikium
print "Hello!";
print 42;
print result;
\`\`\`

### Reading Input
- \`readline()\`: Reads a full line of text from the user (waits until Enter is pressed).
- \`readchar()\`: Reads a single character from the user.

Both functions return the input as a **String**, so you can store it in a variable and use it later!

### Greeting Example
\`\`\`nikium
print "What is your name?";
name = readline();
print "Hello, " + name + "!";
\`\`\`

> **Tip:** Type your input in the **Input** tab (next to Output/Errors) before running, or the program will receive empty strings! Each line in the Input tab corresponds to one \`readline()\` call.`,
    starterCode: 'print "What is your name?";\nname = readline();\nprint "Hello, " + str(name) + "!";\n\nprint "How old are you?";\nage = readline();\nprint "You are " + str(age) + " years old!";\n',
  },
  {
    id: 'variables',
    title: 'Variables & Types',
    description: 'Learn how to store and manage data.',
    content: `## Variables & Data Types

Variables are like labeled boxes where you can store data to use later. You don't need to declare them with a special keyword (like \`var\` or \`let\`), just write a name and use the equals sign (\`=\`) to give it a value!

### Data Types
Nikium automatically figures out what kind of data you are storing:
- **Integers**: Whole numbers (e.g., \`42\`, \`-7\`)
- **Strings**: Text (e.g., \`"Hello"\`)
- **Booleans**: True or False values (\`true\`, \`false\`)
- **Null**: Represents "nothing" or "empty" (\`null\`)

### Example
\`\`\`nikium
name = "Alice";
age = 25;
is_student = true;

print name;
print age;
\`\`\`

> **Note:** You can use the \`type()\` function to see what kind of data a variable holds, and \`str()\` to convert numbers to strings so you can connect them to text!`,
    starterCode: 'message = "Hello, variables!";\nnumber = 42;\nis_awesome = true;\nempty = null;\n\nprint "Message is: " + str(message);\nprint "Number is: " + str(number);\nprint "Type of number is: " + str(type(number));\n\n// Connecting strings and numbers\ngreeting = "The answer is " + str(number);\nprint greeting;\n',
  },
  {
    id: 'expressions',
    title: 'Expressions & Math',
    description: 'Perform calculations and logical comparisons.',
    content: `## Math & Logic

Nikium can perform calculations just like a calculator, and it can compare values to make decisions.

### Arithmetic Operators
- Addition: \`+\`
- Subtraction: \`-\`
- Multiplication: \`*\`
- Division: \`/\`
- Modulo (Remainder): \`%\`

*You can also use \`+\` to glue strings together!*

### Comparison Operators
These compare two values and result in a **Boolean** (\`true\` or \`false\`):
- Equal to: \`==\`
- Not equal to: \`!=\`
- Greater/Less than: \`>\`, \`<\`, \`>=\`, \`<=\`

### Example
\`\`\`nikium
score = 10 * 5;
is_passing = score >= 50;
print "Did I pass? " + str(is_passing);
\`\`\``,
    starterCode: '// Math Operations\nx = 10;\ny = 3;\n\nprint "x + y = " + str(x + y);\nprint "x * y = " + str(x * y);\nprint "x / y = " + str(x / y); // Integer division\nprint "x % y = " + str(x % y); // Remainder\n\n// String concatenation\nfirst = "Nik";\nlast = "ium";\nprint "Language: " + first + last;\n\n// Comparisons\nprint "Is x greater than y?  " + str(x > y);\nprint "Is x equal to 10?  " + str(x == 10);\n',
  },
  {
    id: 'conditionals',
    title: 'Conditionals (If / Else)',
    description: 'Make decisions in your code using conditions.',
    content: `## Making Decisions

Conditionals allow your code to take different paths based on certain conditions. If a condition is \`true\`, the code inside the curly braces \`{ }\` runs.

### If / Else Syntax
\`\`\`nikium
if condition {
  // runs if condition is true
} else if other_condition {
  // runs if other_condition is true
} else {
  // runs if everything above is false
}
\`\`\`

### Logical Operators
You can combine multiple conditions:
- **AND** (\`&&\`): True only if BOTH sides are true.
- **OR** (\`||\`): True if AT LEAST ONE side is true.
- **NOT** (\`!\`): Flips true to false, and false to true.`,
    starterCode: 'age = 18;\nhas_license = true;\n\nprint "Age: " + str(age);\nprint "Has License: " + str(has_license);\n\nif age >= 18 && has_license {\n  print "You are legally allowed to drive.";\n} else {\n  if age >= 18 {\n    print "You are old enough, but you need a license first!";\n  } else {\n    print "You are too young to drive.";\n  }\n}\n',
  },
  {
    id: 'loops',
    title: 'Loops (While / For)',
    description: 'Repeat actions multiple times automatically.',
    content: `## Repeating Code

Loops let you repeat a block of code multiple times without writing it over and over.

### While Loops
A \`while\` loop keeps running its code block *as long as* its condition remains \`true\`.
\`\`\`nikium
count = 0;
while count < 3 {
  print count;
  count = count + 1;
}
\`\`\`

### For Loops
A \`for\` loop is a compact way to run a loop when you know exactly how many times it should run. It has 3 parts inside the parentheses:
1. **Setup**: e.g., \`i = 0\`
2. **Condition**: e.g., \`i < 5\`
3. **Step**: e.g., \`i = i + 1\` (or \`++i\`)

### Break and Continue
- \`break;\`: Instantly exits the loop completely.
- \`continue;\`: Skips the rest of the current loop cycle and moves to the next one.`,
    starterCode: 'print "--- While Loop ---";\ni = 0;\nwhile i < 3 {\n  print "While Count: " + str(i);\n  i = i + 1;\n}\n\nprint "\\n--- For Loop ---";\nfor (j = 0; j < 5; ++j) {\n  if j == 2 {\n    print "Skipping 2!";\n    continue;\n  }\n  print "For Count: " + str(j);\n}\n\nprint "\\n--- Break Example ---";\nfor (k = 0; k < 10; ++k) {\n  if k == 3 {\n    print "Stopping at 3!";\n    break;\n  }\n  print "K is " + str(k);\n}\n',
  },
  {
    id: 'functions',
    title: 'Functions & Closures',
    description: 'Group code into reusable, labeled blocks.',
    content: `## Reusable Code Blocks

A function is a reusable block of code that takes inputs (arguments), does some work, and gives back an output (return value). Functions help keep your code clean and organized.

### Defining a Function
You define a function using the \`fn\` keyword. 
\`\`\`nikium
add = fn(a, b) {
  return a + b;
};

// Calling the function
result = add(5, 10);
print result; // 15
\`\`\`

### Closures
Functions in Nikium are "first-class", which means you can treat them like any other variable. You can pass them as arguments, return them from other functions, and they can "remember" variables from the environment where they were created (this is called a Closure).`,
    starterCode: '// A basic function that greets a user\ngreet = fn(name) {\n  return "Hello, " + name + "!";\n};\n\nprint greet("Nikium User");\n\n// A function that creates and returns ANOTHER function (a closure)\nmake_multiplier = fn(x) {\n  return fn(y) {\n    return x * y;\n  };\n};\n\ndouble = make_multiplier(2);\ntriple = make_multiplier(3);\n\nprint "Double of 5 is: " + str(double(5));\nprint "Triple of 5 is: " + str(triple(5));\n',
  },
  {
    id: 'structs',
    title: 'Structs & Objects (OOP)',
    description: 'Create custom data types and blueprints.',
    content: `## Object-Oriented Programming

Structs allow you to create blueprints for your own complex data types. They combine data (properties) and behavior (methods) into a single object.

### Creating a Blueprint
Use the \`struct\` keyword to define your blueprint.
\`\`\`nikium
Animal = struct {
  name: "Unknown",
  sound: "...",
  
  // The Constructor (must match the struct name)
  Animal: fn(this, n, s) {
    this->name = n;
    this->sound = s;
  },

  // A Method
  speak: fn(this) {
    print this->name + " says " + this->sound;
  }
};
\`\`\`

### Using Objects
To create an actual object from your blueprint, use the \`new\` keyword. To call a method, use the \`->\` operator, which automatically passes the object itself as the \`this\` argument!

> **Memory Rule**: When you use \`new\`, memory is allocated. When you are done with the object, you must call \`free(obj)\` to release it!`,
    starterCode: 'Point = struct {\n  x: 0,\n  y: 0,\n  \n  // Constructor\n  Point: fn(this, x, y) {\n    this->x = x;\n    this->y = y;\n  },\n  \n  // Method\n  describe: fn(this) {\n    print "Point is at (" + str(this->x) + ", " + str(this->y) + ")";\n  }\n};\n\n// 1. Create a new object\np1 = new Point(10, 20);\n\n// 2. Call its method using -> \np1->describe();\n\n// 3. Modify its properties\np1->x = 99;\np1->describe();\n\n// 4. Free the memory!\nfree(p1);\nprint "Object successfully freed!";\n',
  },
  {
    id: 'arrays',
    title: 'Arrays (Lists)',
    description: 'Store an ordered list of multiple items.',
    content: `## Arrays

An array is a single variable that holds an ordered list of multiple items. They are enclosed in square brackets \`[ ]\`.

### Creating and Accessing
Arrays are "zero-indexed", meaning the first item is at position 0, the second is at position 1, and so on.
\`\`\`nikium
colors = ["red", "green", "blue"];
print colors[0]; // "red"
\`\`\`

### Modifying Arrays
- You can change an item by assigning a new value to its index: \`colors[1] = "yellow";\`
- You can find out how many items are in the array using \`len(colors)\`.
- You can add a new item to the end of the array using \`push(colors, "purple")\`. Note: \`push\` returns a *new* array!`,
    starterCode: '// Create an array of numbers\nnumbers = [10, 20, 30];\nprint "Initial array: " + str(numbers);\n\n// Accessing elements (0-indexed)\nprint "First element: " + str(numbers[0]);\nprint "Third element: " + str(numbers[2]);\n\n// Modifying elements\nnumbers[1] = 99;\nprint "After modification: " + str(numbers);\n\n// Adding a new element using push()\nnumbers = push(numbers, 40);\nprint "After push: " + str(numbers);\n\n// Looping through an array\nprint "\\nLooping through elements:";\nfor (i = 0; i < len(numbers); ++i) {\n  print "Index " + str(i) + " is " + str(numbers[i]);\n}\n',
  },
  {
    id: 'hashmaps',
    title: 'Hash Maps (Dictionaries)',
    description: 'Store data in key-value pairs.',
    content: `## Hash Maps

Hash Maps (also known as Dictionaries or Objects in other languages) store data in **key-value pairs**. Instead of finding data using a numerical index (like in arrays), you find it using a unique string "key".

They are enclosed in curly braces \`{ }\`, with a colon \`:\` separating the key and the value.

### Creating and Accessing
\`\`\`nikium
user = {
  "name": "Alex",
  "age": 30
};
print user["name"]; // "Alex"
\`\`\`

### Built-in Hash Functions
- \`keys(hash)\`: Returns an array of all keys.
- \`values(hash)\`: Returns an array of all values.
- \`has_key(hash, key)\`: Returns \`true\` if the key exists.
- \`set(hash, key, value)\`: Adds or updates a key-value pair (returns a new hash).
- \`delete_key(hash, key)\`: Removes a pair (returns a new hash).`,
    starterCode: '// Create a Hash Map\nprofile = {\n  "username": "NikCoder",\n  "level": 42,\n  "is_admin": true\n};\n\nprint "Profile: " + str(profile);\nprint "Username: " + str(profile["username"]);\n\n// Check if a key exists\nif has_key(profile, "is_admin") {\n  print "User is an admin!";\n}\n\n// Get all keys\nprint "Keys: " + str(keys(profile));\n\n// Update/Add a value (returns a new hashmap)\nprofile = set(profile, "score", 9999);\nprint "After setting score: " + str(profile["score"]);\n\n// Delete a key (returns a new hashmap)\nprofile = delete_key(profile, "level");\nprint "Has level now? " + str(has_key(profile, "level"));\n',
  },
  {
    id: 'generics',
    title: 'Generics (Type Parameters)',
    description: 'Write flexible code that works with any data type.',
    content: `## Generics

Sometimes you want to write a blueprint or a function that can handle *any* kind of data, but you still want to be strict about what goes in and out. Generics allow you to pass a **Type Parameter** (like \`<T>\`).

### Generic Structs
You can create a struct that wraps any type of data:
\`\`\`nikium
generic<T> Box = struct {
  value: T,
  Box: fn(this, v) {
    this->value = v;
  }
};
\`\`\`
When you create a Box, you specify the type it holds: \`new Box<int>(42)\`.

### Generic Functions
You can also write functions that enforce types when called:
\`\`\`nikium
generic<T> print_item = fn(item) {
  print "Item is: " + str(item);
};
print_item<string>("Hello");
\`\`\``,
    starterCode: '// 1. A Generic Struct\ngeneric<T> Container = struct {\n  item: T,\n  \n  Container: fn(this, val) {\n    this->item = val;\n  },\n  \n  get: fn(this) {\n    return this->item;\n  }\n};\n\n// Creating an integer container\nint_box = new Container<int>(100);\nprint "Integer in box: " + str(int_box->get());\nfree(int_box);\n\n// Creating a string container\nstr_box = new Container<string>("Nikium");\nprint "String in box: " + str(str_box->get());\nfree(str_box);\n\n// 2. A Generic Function\ngeneric<T> display_value = fn(val) {\n  print "Generic value: " + str(val);\n};\n\ndisplay_value<int>(55);\ndisplay_value<string>("Awesome");\n',
  },
  {
    id: 'json',
    title: 'JSON Serialization',
    description: 'Easily convert data to and from JSON.',
    content: `## JSON Processing

JSON (JavaScript Object Notation) is the standard way to send data across the internet. Nikium has built-in support to convert Hash Maps and Arrays into JSON strings, and vice versa!

### Functions
- \`json_stringify(data)\`: Takes a Hash Map or Array and converts it into a clean JSON text string.
- \`json_parse(json_string)\`: Takes a JSON text string and converts it back into usable Nikium Hash Maps and Arrays.

### Why is this useful?
Whenever you make a network request (like to an API) or read a configuration file, the data is almost always in JSON format.`,
    starterCode: '// 1. Converting a Hash Map to a JSON string\nuser_data = {\n  "name": "Nikhil",\n  "roles": ["admin", "developer"],\n  "active": true\n};\n\njson_text = json_stringify(user_data);\nprint "--- JSON String ---";\nprint json_text;\nprint "-------------------";\n\n// 2. Converting a JSON string back into a Hash Map\nraw_api_response = \'{"status": 200, "message": "Success", "data": [1, 2, 3]}\';\n\nparsed_data = json_parse(raw_api_response);\nprint "\\nParsed Status Code: " + str(parsed_data["status"]);\nprint "Parsed Message: " + str(parsed_data["message"]);\nprint "First item in array: " + str(parsed_data["data"][0]);\n',
  },
  {
    id: 'time',
    title: 'Time & Sleep',
    description: 'Work with dates, measure performance, and pause code.',
    content: `## Time Operations

Nikium allows you to check the current date/time, measure how long code takes to run, and pause execution.

### Built-in Time Functions
- \`time_now()\`: Returns the current time as a Unix timestamp (milliseconds since 1970).
- \`time_format(ms)\`: Converts a timestamp into a human-readable date/time string.
- \`time_sleep(ms)\`: Pauses (sleeps) the program for a specific number of milliseconds.

### The \`time\` Keyword
Nikium has a special built-in keyword to benchmark code. Just put \`time\` in front of any expression, and Nikium will print exactly how many milliseconds it took to run!
\`\`\`nikium
time do_heavy_work();
\`\`\``,
    starterCode: 'print "--- Current Time ---";\nnow_ms = time_now();\nprint "Unix Timestamp (ms): " + str(now_ms);\nprint "Formatted Date: " + str(time_format(now_ms));\n\nprint "\\n--- Sleeping ---";\nprint "Going to sleep for 1 second (1000ms)...";\ntime_sleep(1000);\nprint "Woke up!";\n\nprint "\\n--- Benchmarking ---";\nheavy_task = fn() {\n  sum = 0;\n  for (i = 0; i < 50000; ++i) {\n    sum = sum + 1;\n  }\n  return sum;\n};\n\n// The \'time\' keyword measures execution speed automatically!\nresult = time heavy_task();\nprint "Result of task: " + str(result);\n',
  },
  {
    id: 'concurrency',
    title: 'Concurrency (Async Tasks)',
    description: 'Run code in the background without freezing your program.',
    content: `## Concurrency

Sometimes a task takes a long time (like downloading a file or doing heavy math). Instead of freezing your entire program waiting for it, you can run it in the background concurrently!

### Spawn and Await
- \`spawn(function)\`: Starts a function running in the background immediately. It returns a **Task ID**.
- \`await(task_id)\`: Pauses the *main* program until the background task finishes, and then returns its result.

This is exactly like multi-threading in other languages, allowing your program to do multiple things at once!`,
    starterCode: '// A function that simulates a long-running task\nslow_task = fn(name, delay) {\n  print "Task \'" + name + "\' started...";\n  time_sleep(delay);\n  print "Task \'" + name + "\' finished!";\n  return name + " is complete.";\n};\n\nprint "--- Starting Background Tasks ---";\n\n// Spawn closures in the background. They run at the same time!\ntask1 = spawn(fn() { return slow_task("Download File A", 1500); });\ntask2 = spawn(fn() { return slow_task("Download File B", 800); });\n\nprint "Tasks are running in the background. Main program is not blocked!";\n\n// Wait for them to finish and get their results\nres1 = await(task1);\nres2 = await(task2);\n\nprint "\\n--- Results ---";\nprint res1;\nprint res2;\n',
  },
  {
    id: 'system-io',
    title: 'File I/O & System',
    description: 'Read, write, and manage files on the filesystem.',
    content: `## File Operations

Nikium provides simple functions to interact with the filesystem (creating, reading, and deleting files).

### File Functions
- \`file_read(path)\`: Reads file contents as a string.
- \`file_write(path, data)\`: Writes (and overwrites) a file.
- \`file_append(path, data)\`: Appends data to the end of a file.
- \`file_exists(path)\`: Returns \`true\` if the file exists.
- \`file_delete(path)\`: Deletes a file.

### System Shell Execution
- \`build("command")\`: Runs a shell command on the host machine and returns the terminal output!

> **Playground Environment Note**: 
> - Standard input functions (\`readline\`, \`readchar\`) are intentionally **disabled** in this web playground to prevent execution hangs, but they work perfectly when running Nikium on your own computer!
> - File operations in this playground automatically fall back to running on our backend server, as the browser (WASM) does not have a filesystem.`,
    starterCode: '// Nikium File I/O Operations\n\nfile = "playground_test.txt";\n\nprint "1. Writing to file...";\nfile_write(file, "Hello from the Nikium Backend!\\n");\n\nprint "2. Appending to file...";\nfile_append(file, "This is an appended line.\\n");\n\nprint "3. Verifying file exists: " + str(file_exists(file));\n\nif file_exists(file) {\n  print "\\n--- File Contents ---";\n  print file_read(file);\n  print "---------------------\\n";\n}\n\nprint "4. Deleting file...";\nfile_delete(file);\nprint "File deleted successfully. Exists now? " + str(file_exists(file));\n',
  },
  {
    id: 'network',
    title: 'Network Requests',
    description: 'Fetch data from the internet via HTTP.',
    content: `## Network I/O

Nikium makes it incredibly easy to communicate with other servers and APIs across the internet using built-in HTTP client functions.

### Functions
- \`net_get(url)\`: Performs an HTTP GET request to the URL and returns the raw text body of the response.
- \`net_status(url)\`: Returns just the HTTP status code (e.g., 200 for OK, 404 for Not Found) as an integer.

### Common Workflow
Usually, you will fetch data from an API using \`net_get()\`, and because APIs mostly return JSON data, you will immediately pass that result into \`json_parse()\` to turn it into a Hash Map you can use!

> **Browser Note**: When running in the playground, network calls use the browser's \`fetch\` API. This means strict CORS restrictions apply.`,
    starterCode: '// 1. Check if a website is online\nurl = "https://jsonplaceholder.typicode.com/todos/1";\nstatus = net_status(url);\nprint "HTTP Status: " + str(status);\n\n// 2. Fetch JSON data from an API\nprint "\\nFetching data from API...";\nbody = net_get(url);\n\n// 3. Parse the JSON string into a Hash Map\ndata = json_parse(body);\n\nprint "\\n--- API Response Data ---";\nprint "Title: " + data["title"];\nprint "Completed: " + str(data["completed"]);\n',
  },
  {
    id: 'modules',
    title: 'Modules & Libraries',
    description: 'Load code from other files and standard libraries.',
    content: `## Modules

As your programs get larger, you'll want to split your code into multiple files. Nikium lets you load code from other files easily using the \`load\` keyword.

### How it works
\`\`\`nikium
load "math_helpers.nik";
\`\`\`
When you load a file, all the variables, structs, and functions defined in that file are instantly merged into your current environment, so you can use them immediately.

### The Standard Library
Nikium comes with a built-in standard library of helpful tools. You can load them directly:
- \`load "math";\` — Trigonometry, max/min, random numbers.
- \`load "strings";\` — String splitting, casing, replacing.
- \`load "http";\` — Advanced server creation.

*(Note: Standard library loading is restricted in this web playground environment, but fully functional locally!)*`,
    starterCode: '// In a real environment, you might load a custom file like this:\n// load "my_script.nik";\n\n// Or load a standard library like this:\n// load "math";\n\nprint "Modules allow you to organize code beautifully!";\nprint "In this web playground, external file loading is simulated.";\n',
  },
  {
    id: 'memory',
    title: 'Manual Memory (Advanced)',
    description: 'For systems programmers: direct memory manipulation.',
    content: `## Raw Memory Management

While Nikium handles a lot of things automatically, it also exposes highly advanced tools for systems-level programmers to directly manipulate raw heap memory!

**Warning: This is for advanced users!**

### Memory Functions
- \`mem_alloc(bytes)\`: Requests a raw chunk of memory and returns an integer Pointer (address).
- \`mem_free(pointer)\`: Frees the raw memory at that address.
- \`mem_write(pointer, offset, value)\`: Writes a 64-bit integer directly to a memory address.
- \`mem_read(pointer, offset)\`: Reads a 64-bit integer from a memory address.
- \`mem_stats()\`: Returns a hash map showing heap size and usage.

This allows you to build custom, ultra-fast data structures entirely bypassing the standard variables!`,
    starterCode: 'print "--- Initial Memory Stats ---";\nprint mem_stats();\n\nprint "\\n1. Allocating 32 bytes of raw memory...";\nptr = mem_alloc(32);\nprint "Raw Memory Pointer Address: " + str(ptr);\n\nprint "\\n2. Writing data to memory...";\nmem_write(ptr, 0, 9999); // Write 9999 at offset 0\nmem_write(ptr, 8, 5555); // Write 5555 at offset 8\nprint "Data successfully written directly to RAM!";\n\nprint "\\n3. Reading data back from memory...";\nval1 = mem_read(ptr, 0);\nval2 = mem_read(ptr, 8);\nprint "Value at offset 0: " + str(val1);\nprint "Value at offset 8: " + str(val2);\n\nprint "\\n4. Freeing memory to prevent memory leaks...";\nmem_free(ptr);\nprint "Memory freed!";\n\nprint "\\n--- Final Memory Stats ---";\nprint mem_stats();\n',
  }
];
