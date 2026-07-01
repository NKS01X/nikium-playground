//go:build js

package memory

func mmapHeap(size int) ([]byte, error) {
	return make([]byte, size), nil
}

func munmapHeap(heap []byte) error {
	return nil
}
