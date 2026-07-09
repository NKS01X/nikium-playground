import { examples } from './frontend/src/lib/examples.ts';

async function testExample(example) {
  try {
    const resp = await fetch('http://localhost:8080/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: example.starterCode }),
    });
    const data = await resp.json();
    const hasError = !!data.error;
    
    if (hasError) {
      console.log(`  ✗ ${example.id}: ERROR`);
      console.log(`    Error: ${data.error.substring(0, 150).replace(/\n/g, ' ')}`);
      return false;
    } else {
      console.log(`  ✓ ${example.id}: OK`);
      return true;
    }
  } catch (err) {
    console.log(`  ✗ ${example.id}: FETCH ERROR: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n=== Testing REAL Nikium examples against server ===\n');
  let passed = 0;
  let failed = 0;
  
  for (const example of examples) {
    const ok = await testExample(example);
    if (ok) passed++;
    else failed++;
  }
  
  console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${examples.length} ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
