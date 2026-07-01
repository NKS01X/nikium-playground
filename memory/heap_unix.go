//go:build !windows && !js

package memory

import "syscall"

func mmapHeap(size int) ([]byte, error) {
	return syscall.Mmap(
		-1, 0, size,
		syscall.PROT_READ|syscall.PROT_WRITE,
		syscall.MAP_PRIVATE|syscall.MAP_ANON,
	)
}

func munmapHeap(heap []byte) error {
	return syscall.Munmap(heap)
}
