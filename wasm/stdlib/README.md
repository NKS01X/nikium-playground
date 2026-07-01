# Nikium Standard Library

Import any stdlib file at the top of your `.nik` script using `load`.

---

## math.nik
| Function | Signature | Description |
|---|---|---|
| `abs` | `abs(a)` | Absolute value |
| `min` | `min(a, b)` | Smaller of two values |
| `max` | `max(a, b)` | Larger of two values |
| `pow` | `pow(base, exp)` | Integer exponentiation |
| `clamp` | `clamp(val, lo, hi)` | Clamp value to `[lo, hi]` |

```nikium
load "stdlib/math.nik";
print abs(-5);         // 5
print min(10, 5);      // 5
print max(10, 5);      // 10
print pow(2, 3);       // 8
print clamp(10, 0, 5); // 5
```

---

## arrayutils.nik
| Function | Signature | Description |
|---|---|---|
| `map` | `map(arr, f)` | Apply `f` to each element, return new array |
| `filter` | `filter(arr, pred)` | Keep elements where `pred` returns true |
| `reduce` | `reduce(arr, f, init)` | Fold array into single value |
| `contains` | `contains(arr, val)` | True if `val` in array |
| `sum` | `sum(arr)` | Sum of integer array |
| `reverse` | `reverse(arr)` | Reversed copy of array |
| `indexOf` | `indexOf(arr, val)` | Index of `val` or -1 |

```nikium
load "stdlib/arrayutils.nik";
arr = [1, 2, 3];
print map(arr, fn(x) { return x * 2; }); // [2, 4, 6]
print filter(arr, fn(x) { return x > 1; }); // [2, 3]
print reduce(arr, fn(acc, x) { return acc + x; }, 0); // 6
print contains(arr, 2); // true
print sum(arr);         // 6
print reverse(arr);     // [3, 2, 1]
print indexOf(arr, 2);  // 1
```

> Requires: `len` builtin (array support added in evaluator)

---

## stringutils.nik
| Function | Signature | Description |
|---|---|---|
| `upper` | `upper(s)` | Uppercase string |
| `lower` | `lower(s)` | Lowercase string |
| `trim` | `trim(s)` | Strip leading/trailing spaces and tabs |
| `repeat` | `repeat(s, n)` | Repeat string `n` times |
| `startsWith` | `startsWith(s, prefix)` | True if `s` starts with `prefix` |
| `endsWith` | `endsWith(s, suffix)` | True if `s` ends with `suffix` |
| `split` | `split(s, sep)` | Split string by separator char |
| `indexOf` | `indexOf(s, sub)` | Index of substring `sub` or -1 |

```nikium
load "stdlib/stringutils.nik";
print upper("hello");          // "HELLO"
print lower("HELLO");          // "hello"
print trim("  hi  ");          // "hi"
print repeat("hi ", 3);        // "hi hi hi "
print startsWith("hello", "h");// true
print endsWith("hello", "o");  // true
print split("a,b", ",");       // ["a", "b"]
print indexOf("hello", "ll");  // 2
```

> Requires: `ord` and `chr` builtins

---

## input.nik
| Function | Signature | Description |
|---|---|---|
| `readLine` | `readLine()` | Read raw line from stdin |
| `readString` | `readString()` | Read first whitespace-delimited token |
| `readInt` | `readInt()` | Read integer from stdin |
| `readArray` | `readArray()` | Read space-separated integers from stdin |

```nikium
load "stdlib/input.nik";
// Read a line of text
line = readLine(); 

// Read a token (stops at space)
token = readString();

// Read single integer
num = readInt();

// Read array of space separated ints
arr = readArray();
```

---

## Builtins (native)
| Name | Description |
|---|---|
| `len(x)` | Length of string or array |
| `push(arr, val)` | Append to array, return new array |
| `Print(...)` | Print values to stdout |
| `readline()` | Read line from stdin |
| `readchar()` | Read single char from stdin |
| `ord(c)` | Char to ASCII integer |
| `chr(n)` | ASCII integer to char |

---

## sql.nik
A SQL DSL for building queries using chainable functions, producing a struct with `sql` string and `args` array.

| Function | Signature | Description |
|---|---|---|
| `Select` | `Select(fields)` | Initialize a SELECT query |
| `Insert` | `Insert(table, fields, args)` | Initialize an INSERT query |
| `Update` | `Update(table, fields, args)` | Initialize an UPDATE query |
| `From`   | `From(q, table)` | Set the FROM table |
| `Where`  | `Where(q, field, op, value)` | Append a WHERE condition |
| `Limit`  | `Limit(q, limit)` | Set the LIMIT clause |
| `Offset` | `Offset(q, offset)` | Set the OFFSET clause |
| `toSql`  | `toSql(q)` | Compile the query to a SQL string and arguments |

### Example Usage
```nikium
load "stdlib/sql.nik";

q = Select(["id", "name", "email"]);
From(q, "users");
Where(q, "age", ">", 18);
Where(q, "status", "=", "active");
Limit(q, 10);

res = toSql(q);
print res.sql;  // SELECT id, name, email FROM users WHERE age > $1 AND status = $2 LIMIT $3;
print res.args; // [18, "active", 10]
```

### Internal Structs
The builder functions construct query and condition structs internally:
```nikium
query = struct {
    type: "",       // select | insert | update | delete
    table: "",
    alias: "",
    fields: [],
    joins: [],
    where: [],      // array of condition structs
    args: [],
    groupBy: [],
    having: "",
    orderBy: [],
    limit: 0,
    offset: 0,
    distinct: false
};

condition = struct {
    field: "",
    op: "=",
    value: ""
};

order = struct {
    field: "",
    direction: ""   // asc | desc
};

join = struct {
    type: "",    // inner, left, right
    table: "",
    on: ""
};
```

---

## Data Structures

The standard library includes advanced data structures implemented using heap-allocated struct pointers and native structures. 
**IMPORTANT**: Since these structures are pointer-based, they are modified in-place on the heap. You can pass them to functions directly, and field accesses must use the pointer arrow operator (`->`).

**Usage Pattern:**
```nikium
ll = LinkedList();
ll = LinkedList_push(ll, 10);
ll = LinkedList_popFront(ll);
print ll->popped;               // Popped value is stored in ->popped
ll = LinkedList_toArray(ll);
print ll->result;               // Return results are stored in ->result
```

### linkedlist.nik
| Function | Signature | Description |
|---|---|---|
| `LinkedList` | `LinkedList()` | Initialize a singly linked list |
| `LinkedList_push` | `ll = LinkedList_push(ll, val)` | Push value to tail |
| `LinkedList_popFront` | `ll = LinkedList_popFront(ll)` | Pop value from head (result in `->popped`) |
| `LinkedList_peek` | `ll = LinkedList_peek(ll)` | Peek head (result in `->result`) |
| `LinkedList_toArray` | `ll = LinkedList_toArray(ll)` | Get array (result in `->result`) |

### doublylinkedlist.nik
| Function | Signature | Description |
|---|---|---|
| `DoublyLinkedList` | `DoublyLinkedList()` | Initialize a doubly linked list |
| `DoublyLinkedList_push` | `dll = DoublyLinkedList_push(dll, val)` | Push value to tail |
| `DoublyLinkedList_pushFront` | `dll = DoublyLinkedList_pushFront(dll, val)` | Push value to head |
| `DoublyLinkedList_popBack` | `dll = DoublyLinkedList_popBack(dll)` | Pop tail (result in `->popped`) |
| `DoublyLinkedList_popFront` | `dll = DoublyLinkedList_popFront(dll)` | Pop head (result in `->popped`) |
| `DoublyLinkedList_toArray` | `dll = DoublyLinkedList_toArray(dll)` | Get array (result in `->result`) |

### stack.nik
| Function | Signature | Description |
|---|---|---|
| `Stack` | `Stack()` | Initialize LIFO stack |
| `Stack_push` | `s = Stack_push(s, val)` | Push value |
| `Stack_pop` | `s = Stack_pop(s)` | Pop value (result in `->popped`) |
| `Stack_peek` | `s = Stack_peek(s)` | Peek top (result in `->result`) |

### queue.nik
| Function | Signature | Description |
|---|---|---|
| `Queue` | `Queue()` | Initialize FIFO queue |
| `Queue_enqueue` | `q = Queue_enqueue(q, val)` | Enqueue value |
| `Queue_dequeue` | `q = Queue_dequeue(q)` | Dequeue value (result in `->popped`) |
| `Queue_peek` | `q = Queue_peek(q)` | Peek front (result in `->result`) |

### priorityqueue.nik
| Function | Signature | Description |
|---|---|---|
| `PriorityQueue` | `PriorityQueue()` | Initialize min-heap PQ |
| `PriorityQueue_push` | `pq = PriorityQueue_push(pq, val, pri)` | Push with priority |
| `PriorityQueue_pop` | `pq = PriorityQueue_pop(pq)` | Pop min pri (result in `.popped`) |

### trie.nik
| Function | Signature | Description |
|---|---|---|
| `Trie` | `Trie()` | Initialize Trie |
| `Trie_insert` | `tr = Trie_insert(tr, word)` | Insert word |
| `Trie_search` | `tr = Trie_search(tr, word)` | Search (result in `->result`) |
| `Trie_startsWith` | `tr = Trie_startsWith(tr, pre)` | Prefix search (result in `->result`) |

### bst.nik
| Function | Signature | Description |
|---|---|---|
| `BST` | `BST()` | Initialize BST |
| `BST_insert` | `tree = BST_insert(tree, val)` | Insert value |
| `BST_search` | `tree = BST_search(tree, val)` | Search (result in `->result`) |
| `BST_inorder` | `tree = BST_inorder(tree)` | In-order array (result in `->result`) |

### hashmap.nik
| Function | Signature | Description |
|---|---|---|
| `HashMap` | `HashMap()` | Initialize array-backed map |
| `HashMap_put` | `hm = HashMap_put(hm, k, v)` | Put key-value pair |
| `HashMap_get` | `hm = HashMap_get(hm, k)` | Get value (result in `->result`) |
| `HashMap_contains` | `hm = HashMap_contains(hm, k)` | Check key (result in `->result`) |

### graph.nik
| Function | Signature | Description |
|---|---|---|
| `Graph` | `Graph()` | Initialize directed graph |
| `Graph_addNode` | `g = Graph_addNode(g, n)` | Add node |
| `Graph_addEdge` | `g = Graph_addEdge(g, n1, n2)` | Add directed edge |
| `Graph_getNeighbors` | `g = Graph_getNeighbors(g, n)` | Get neighbors (result in `->result`) |

### unittest.nik
| Function | Signature | Description |
|---|---|---|
| `assert_true` | `assert_true(cond, msg)` | Assert condition is true |
| `assert_false` | `assert_false(cond, msg)` | Assert condition is false |
| `assert_eq` | `assert_eq(act, exp, msg)` | Assert two values are equal |
| `test_report` | `test_report()` | Output total test suite results and reset stats |

### set.nik
| Function | Signature | Description |
|---|---|---|
| `Set` | `Set()` | Initialize unique Set collection |
| `Set_add` | `s = Set_add(s, val)` | Add value to set |
| `Set_remove` | `s = Set_remove(s, val)` | Remove value from set |
| `Set_contains` | `Set_contains(s, val)` | Check if set contains value |
| `Set_size` | `Set_size(s)` | Get count of elements in set |
| `Set_toArray` | `s = Set_toArray(s)` | Retrieve set elements (result in `->result`) |

### datetime.nik
| Function | Signature | Description |
|---|---|---|
| `now` | `now()` | Get current epoch time (unix millisecond integer) |
| `sleep` | `sleep(ms)` | Blocks execution for given milliseconds |
| `format` | `format(unix_ms)` | Formats unix timestamp into human-readable string |
| `benchmark` | `res = benchmark(f)` | Measures and prints execution elapsed time of function `f` |

### hashing.nik
| Function | Signature | Description |
|---|---|---|
| `djb2` | `djb2(str_val)` | Computes classic DJB2 hash of string |
| `sdbm` | `sdbm(str_val)` | Computes classic SDBM hash of string |
| `fnv1a` | `fnv1a(str_val)` | Computes 32-bit FNV-1a hash of string |

### hashset.nik
| Function | Signature | Description |
|---|---|---|
| `HashSet` | `HashSet()` | Initialize a unique HashSet |
| `HashSet_add` | `hs = HashSet_add(hs, val)` | Add element to HashSet |
| `HashSet_remove` | `hs = HashSet_remove(hs, val)` | Remove element from HashSet |
| `HashSet_contains` | `HashSet_contains(hs, val)` | Check membership in HashSet |
| `HashSet_size` | `HashSet_size(hs)` | Get size of HashSet |

### bitmanip.nik
| Function | Signature | Description |
|---|---|---|
| `get_bit` | `get_bit(val, idx)` | Gets bit value at index (0 or 1) |
| `set_bit` | `set_bit(val, idx)` | Sets bit value to 1 at index |
| `clear_bit` | `clear_bit(val, idx)` | Clears bit value to 0 at index |
| `toggle_bit` | `toggle_bit(val, idx)` | Toggles bit value at index |
| `count_ones` | `count_ones(val)` | Popcount (counts 1s in 64-bit integer) |
| `count_zeros` | `count_zeros(val)` | Counts 0s in 64-bit integer |

### bitset.nik
| Function | Signature | Description |
|---|---|---|
| `BitSet` | `BitSet(num_bits)` | Allocates in-place BitSet in arena memory |
| `BitSet_free` | `BitSet_free(bs)` | Frees the BitSet raw memory and struct |
| `BitSet_set` | `bs = BitSet_set(bs, idx)` | Set bit to 1 at index |
| `BitSet_clear` | `bs = BitSet_clear(bs, idx)` | Set bit to 0 at index |
| `BitSet_toggle` | `bs = BitSet_toggle(bs, idx)` | Toggles bit at index |
| `BitSet_test` | `BitSet_test(bs, idx)` | Check if bit is set at index |

---

## Time Keywords

The keywords `time`, `now`, and `datetime` can be used in two ways:

1. **Standalone**: Retrieves the current epoch time in milliseconds.
   ```nikium
   t = time;
   print t;
   ```
2. **Timing block/expression**: Benchmarks the evaluation time of the expression that follows it.
   ```nikium
   result = time my_function();
   ```

---

## Multi-Containers

### multimap.nik / multihashmap.nik
Associative containers mapping keys to multiple values.
- `MultiMap()` / `MultiHashMap()`: Initialize a multimap.
- `MultiMap_put(m, k, v)`: Put key-value pair.
- `MultiMap_get(m, k)`: Retrieve array of values mapped to key (result in `->result`).
- `MultiMap_contains(m, k)`: Check if key exists (result in `->result`).
- `MultiMap_remove(m, k, v)`: Remove single occurrence of `v` under key `k`.
- `MultiMap_removeAll(m, k)`: Remove key completely.
- `MultiMap_size(m)`: Get total number of values across all keys.
- `MultiMap_keys(m)`: Get list of unique keys (result in `->result`).

### multiset.nik / multihashset.nik
Sets that allow duplicate elements.
- `MultiSet()` / `MultiHashSet()`: Initialize a multiset.
- `MultiSet_add(s, val)`: Add element.
- `MultiSet_remove(s, val)`: Remove single occurrence of element.
- `MultiSet_removeAll(s, val)`: Remove all occurrences of element.
- `MultiSet_contains(s, val)`: Check if element exists.
- `MultiSet_count(s, val)`: Retrieve number of occurrences of element.
- `MultiSet_size(s)`: Retrieve total number of elements.
- `MultiSet_clear(s)`: Empty the multiset.
- `MultiSet_toArray(s)`: Convert multiset elements to array (result in `->result`).

---

## JSON Builtins

- `json_stringify(obj)`: Serializes a Nikium object (null, integer, boolean, string, array, or hash) into a JSON-encoded string.
- `json_parse(json_str)`: Deserializes a JSON-encoded string into the corresponding Nikium objects.

---

## CLI Arguments

- `ARGV`: A globally accessible array containing all command-line arguments passed to the script after the filename.





