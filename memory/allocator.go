package memory

import (
	"fmt"
	"unsafe"
)

// Block layout: [header: uint32][payload][footer: uint32]
// tag = size | free_bit  (bit-0 = 1 → free, 0 → allocated)
// Minimum block: 8-byte aligned payload + 8 bytes of tags.

const tagSize = uint32(4)

// Arena is a boundary-tag heap allocator over a single mmap'd region.
type Arena struct {
	heap      []byte
	freeHead  uint32 // offset of first free block (0 = empty)
	heapStart uintptr
	heapEnd   uintptr
	cursor    uintptr
}

const DefaultArenaSize = 100 * 1024 * 1024 // 100 MB

// HeapSentinelSize is the number of bytes reserved in the arena for each `new` expression.
// It is 8 bytes (minimum block) so the intrusive free-list can manage it cleanly.
const HeapSentinelSize = uint(8)

func NewArena(size int) (*Arena, error) {
	buf, err := mmapHeap(size)
	if err != nil {
		return nil, err
	}
	a := &Arena{heap: buf}
	a.heapStart = uintptr(unsafe.Pointer(&a.heap[0]))
	a.heapEnd = a.heapStart + uintptr(size)
	a.cursor = a.heapStart
	return a, nil
}

func (a *Arena) Destroy() error {
	err := munmapHeap(a.heap)
	*a = Arena{}
	return err
}

func (a *Arena) Used() uintptr        { return a.cursor - a.heapStart }
func (a *Arena) CapacityBytes() int   { return len(a.heap) }

func (a *Arena) FreeBlocks() int {
	n, off := 0, a.freeHead
	for off != 0 {
		n++
		off = a.readNext(a.heapStart + uintptr(off))
	}
	return n
}

// ---------------------------------------------------------------------------
// tag helpers
// ---------------------------------------------------------------------------

func (a *Arena) writeTag(sz uint32, addr uintptr, free bool) {
	if addr+4 > a.heapEnd {
		return
	}
	val := sz &^ uint32(1)
	if free {
		val |= 1
	}
	*(*uint32)(unsafe.Pointer(&a.heap[addr-a.heapStart])) = val
}

func (a *Arena) readTag(addr uintptr) (size uint32, free bool) {
	val := *(*uint32)(unsafe.Pointer(&a.heap[addr-a.heapStart]))
	return val &^ uint32(1), val&1 == 1
}

// ---------------------------------------------------------------------------
// intrusive doubly-linked free list  (next/prev stored in payload bytes 0-7)
// ---------------------------------------------------------------------------

func (a *Arena) readNext(p uintptr) uint32 {
	return *(*uint32)(unsafe.Pointer(&a.heap[p-a.heapStart]))
}
func (a *Arena) writeNext(p uintptr, v uint32) {
	*(*uint32)(unsafe.Pointer(&a.heap[p-a.heapStart])) = v
}
func (a *Arena) readPrev(p uintptr) uint32 {
	return *(*uint32)(unsafe.Pointer(&a.heap[p-a.heapStart+4]))
}
func (a *Arena) writePrev(p uintptr, v uint32) {
	*(*uint32)(unsafe.Pointer(&a.heap[p-a.heapStart+4])) = v
}

func (a *Arena) addToFreelist(userPtr uintptr) {
	off := uint32(userPtr - a.heapStart)
	a.writeNext(userPtr, a.freeHead)
	a.writePrev(userPtr, 0)
	if a.freeHead != 0 {
		a.writePrev(a.heapStart+uintptr(a.freeHead), off)
	}
	a.freeHead = off
}

func (a *Arena) removeFromFreelist(userPtr uintptr) {
	next := a.readNext(userPtr)
	prev := a.readPrev(userPtr)
	if prev != 0 {
		a.writeNext(a.heapStart+uintptr(prev), next)
	} else {
		a.freeHead = next
	}
	if next != 0 {
		a.writePrev(a.heapStart+uintptr(next), prev)
	}
}

func (a *Arena) findFree(size uint32) uint32 {
	off := a.freeHead
	for off != 0 {
		ptr := a.heapStart + uintptr(off)
		sz, _ := a.readTag(ptr - uintptr(tagSize))
		if sz >= size {
			return off
		}
		off = a.readNext(ptr)
	}
	return 0
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

func (a *Arena) Malloc(size uint) uintptr {
	if a == nil || a.heap == nil {
		return 0
	}
	if size%8 != 0 {
		size = (size/8 + 1) * 8
	}
	blockSize := uint32(size) + tagSize*2
	const minBlock = tagSize*2 + 8

	if off := a.findFree(blockSize); off != 0 {
		freePtr := a.heapStart + uintptr(off)
		hdr := freePtr - uintptr(tagSize)
		tagSz, _ := a.readTag(hdr)
		a.removeFromFreelist(freePtr)

		if tagSz >= blockSize+minBlock {
			remSz := tagSz - blockSize
			remPtr := freePtr + uintptr(blockSize)
			a.writeTag(blockSize, hdr, false)
			a.writeTag(blockSize, hdr+uintptr(blockSize)-uintptr(tagSize), false)
			a.writeTag(remSz, remPtr-uintptr(tagSize), true)
			a.writeTag(remSz, remPtr-uintptr(tagSize)+uintptr(remSz)-uintptr(tagSize), true)
			a.addToFreelist(remPtr)
			return freePtr
		}
		a.writeTag(tagSz, hdr, false)
		a.writeTag(tagSz, hdr+uintptr(tagSz)-uintptr(tagSize), false)
		return freePtr
	}

	if a.cursor+uintptr(blockSize) > a.heapEnd {
		return 0
	}
	userPtr := a.cursor + uintptr(tagSize)
	a.writeTag(blockSize, a.cursor, false)
	a.cursor += uintptr(blockSize)
	a.writeTag(blockSize, a.cursor-uintptr(tagSize), false)
	return userPtr
}

// Free returns a block to the arena, coalescing adjacent free blocks.
func (a *Arena) Free(ptr uintptr) {
	if a == nil || ptr == 0 {
		return
	}
	hdr := ptr - uintptr(tagSize)
	sz, _ := a.readTag(hdr)
	sz &^= 1

	if hdr > a.heapStart {
		leftFtrAddr := hdr - uintptr(tagSize)
		leftSz, leftFree := a.readTag(leftFtrAddr)
		if leftFree {
			leftHdr := hdr - uintptr(leftSz)
			a.removeFromFreelist(leftHdr + uintptr(tagSize))
			sz += leftSz
			hdr = leftHdr
		}
	}

	rightHdr := hdr + uintptr(sz)
	if rightHdr < a.cursor {
		rightSz, rightFree := a.readTag(rightHdr)
		if rightFree {
			a.removeFromFreelist(rightHdr + uintptr(tagSize))
			sz += rightSz
		}
	}

	userPtr := hdr + uintptr(tagSize)
	a.writeTag(sz, hdr, true)
	a.writeTag(sz, hdr+uintptr(sz)-uintptr(tagSize), true)
	a.addToFreelist(userPtr)
}

func (a *Arena) WriteInt64(ptr, offset uintptr, val int64) error {
	addr := ptr + offset
	if addr < a.heapStart || addr+8 > a.heapEnd {
		return fmt.Errorf("address %x out of arena bounds", addr)
	}
	*(*int64)(unsafe.Pointer(&a.heap[addr-a.heapStart])) = val
	return nil
}

func (a *Arena) ReadInt64(ptr, offset uintptr) (int64, error) {
	addr := ptr + offset
	if addr < a.heapStart || addr+8 > a.heapEnd {
		return 0, fmt.Errorf("address %x out of arena bounds", addr)
	}
	return *(*int64)(unsafe.Pointer(&a.heap[addr-a.heapStart])), nil
}
