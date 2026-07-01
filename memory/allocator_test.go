package memory

import (
	"testing"
)

// newTestArena creates a small (1 MB) arena suitable for unit tests.
func newTestArena(t *testing.T) *Arena {
	t.Helper()
	a, err := NewArena(1 * 1024 * 1024)
	if err != nil {
		t.Fatalf("NewArena failed: %v", err)
	}
	t.Cleanup(func() { _ = a.Destroy() })
	return a
}

func TestMallocBasic(t *testing.T) {
	a := newTestArena(t)
	p := a.Malloc(100)
	if p == 0 {
		t.Fatal("Malloc(100) returned 0")
	}
}

func TestFreeAndReuse(t *testing.T) {
	a := newTestArena(t)
	p1 := a.Malloc(100)
	if p1 == 0 {
		t.Fatal("Malloc(100) failed")
	}
	a.Free(p1)

	p2 := a.Malloc(100)
	if p2 != p1 {
		t.Errorf("expected freelist reuse: got %x, want %x", p2, p1)
	}
	a.Free(p2)
}

func TestCoalesceRight(t *testing.T) {
	a := newTestArena(t)

	p1 := a.Malloc(100)
	p2 := a.Malloc(100)
	p3 := a.Malloc(100)
	_ = p3

	a.Free(p1)
	a.Free(p2) // should merge into p1's block

	// A 200-byte request should land at the merged block starting at p1.
	p4 := a.Malloc(200)
	if p4 != p1 {
		t.Errorf("right-coalesce: expected %x, got %x", p1, p4)
	}
}

func TestCoalesceLeft(t *testing.T) {
	a := newTestArena(t)

	p1 := a.Malloc(100)
	p2 := a.Malloc(100)
	_ = a.Malloc(100) // p3 — keeps p2 from being at the frontier

	a.Free(p2)
	a.Free(p1) // p1 freed after p2 → left coalesce pulls p2 in

	p4 := a.Malloc(200)
	if p4 != p1 {
		t.Errorf("left-coalesce: expected %x, got %x", p1, p4)
	}
}

func TestTripleCoalesce(t *testing.T) {
	a := newTestArena(t)

	p1 := a.Malloc(100)
	p2 := a.Malloc(100)
	p3 := a.Malloc(100)
	_ = a.Malloc(100) // p4 — sentinel

	a.Free(p1)
	a.Free(p3)
	a.Free(p2) // middle free triggers merge with both neighbours

	p5 := a.Malloc(300)
	if p5 != p1 {
		t.Errorf("triple-coalesce: expected %x, got %x", p1, p5)
	}
}

func TestSplitting(t *testing.T) {
	a := newTestArena(t)

	p1 := a.Malloc(500) // becomes ~512-byte block (8-aligned + tags)
	a.Free(p1)

	// A 200-byte request should split the 512-byte block and land at p1.
	p2 := a.Malloc(200)
	if p2 != p1 {
		t.Errorf("splitting: expected %x, got %x", p1, p2)
	}

	// A second 200-byte request should land in the remainder.
	p3 := a.Malloc(200)
	if p3 == 0 {
		t.Error("second malloc after split returned 0")
	}
	if p3 == p2 {
		t.Error("remainder block not correctly split: both pointers identical")
	}
}

func TestOOMReturnsZero(t *testing.T) {
	// Tiny arena — only 512 bytes.
	a, err := NewArena(512)
	if err != nil {
		t.Fatalf("NewArena(512) failed: %v", err)
	}
	defer a.Destroy()

	// Exhaust the arena.
	for {
		p := a.Malloc(64)
		if p == 0 {
			break
		}
	}

	// Subsequent alloc must return 0, never panic.
	p := a.Malloc(1000)
	if p != 0 {
		t.Errorf("expected 0 on OOM, got %x", p)
	}
}

func TestFreeNilAndZeroSafe(t *testing.T) {
	a := newTestArena(t)
	// Neither of these should panic.
	a.Free(0)
	(*Arena)(nil).Free(0)
}

func TestMallocNilArenaSafe(t *testing.T) {
	p := (*Arena)(nil).Malloc(64)
	if p != 0 {
		t.Errorf("nil arena Malloc returned non-zero: %x", p)
	}
}

func TestStats(t *testing.T) {
	a := newTestArena(t)
	if a.Used() != 0 {
		t.Errorf("fresh arena should have 0 used bytes, got %d", a.Used())
	}
	_ = a.Malloc(64)
	if a.Used() == 0 {
		t.Error("used bytes should be > 0 after Malloc")
	}
}

func BenchmarkMallocFree(b *testing.B) {
	a, err := NewArena(10 * 1024 * 1024)
	if err != nil {
		b.Fatalf("NewArena failed: %v", err)
	}
	defer a.Destroy()

	ptrs := make([]uintptr, 1000)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		// Allocate 1000 blocks of varying sizes
		for j := 0; j < 1000; j++ {
			size := uint((j % 10) * 16 + 16)
			ptrs[j] = a.Malloc(size)
			if ptrs[j] == 0 {
				b.Fatal("OOM during benchmark allocation")
			}
		}
		// Free every second block
		for j := 0; j < 1000; j += 2 {
			a.Free(ptrs[j])
			ptrs[j] = 0
		}
		// Re-allocate the freed blocks
		for j := 0; j < 1000; j += 2 {
			size := uint((j % 10) * 16 + 16)
			ptrs[j] = a.Malloc(size)
			if ptrs[j] == 0 {
				b.Fatal("OOM during benchmark re-allocation")
			}
		}
		// Free all blocks
		for j := 0; j < 1000; j++ {
			if ptrs[j] != 0 {
				a.Free(ptrs[j])
				ptrs[j] = 0
			}
		}
	}
}

