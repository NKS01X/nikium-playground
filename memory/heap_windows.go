//go:build windows

package memory

func mmapHeap(size int) ([]byte, error) {
	// Windows doesn't expose mmap-style anonymous mappings via stdlib syscall.
	// We use a plain Go-managed byte slice as the backing store.
	// Semantics are identical; we lose the OS-level address-space reservation.
	return make([]byte, size), nil
}

func munmapHeap(_ []byte) error {
	// Go GC handles the slice — nothing to do.
	return nil
}

