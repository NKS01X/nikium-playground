const fs = require('fs');
require('./frontend/public/wasm_exec.js');

const go = new Go();
const wasmBuffer = fs.readFileSync('./frontend/public/nikium.wasm');

WebAssembly.instantiate(wasmBuffer, go.importObject).then((result) => {
  go.run(result.instance);
  
  const code = `
// A basic function that greets a user
greet = fn(name) {
  return "Hello, " + name + "!";
};

print greet("Nikium User");
  `;
  
  const res = nikiumRun(code);
  console.log("Result:", res);
  process.exit(0);
});
