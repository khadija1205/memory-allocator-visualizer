class MemoryBlock {
    constructor(id, start, size, isFree) {
        this.id = id;
        this.start = start;
        this.size = size;
        this.isFree = isFree;
    }
}

class MemoryAllocator {
    constructor(size) {
        this.totalSize = size;
        this.nextId = 1;
        this.blocks = [];

        // statistics
        this.totalAllocations = 0;
        this.successfulAllocations = 0;
        this.failedAllocations = 0;

        // Initializing with one free block
        this.blocks.push(new MemoryBlock(0, 0, size, true));
    }

    // Helper: Next power of 2
    nextPowerOf2(n) {
        if (n <= 0) return 1;

        // If already power of 2, return it
        if ((n & (n - 1)) === 0) {
            return n;
        }

        // Find next power of 2
        let power = 1;
        while (power < n) {
            power *= 2;
        }

        return power;
    }

    allocateFirstFit(size) {
        this.totalAllocations++;

        // Finding first free block that fits
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].isFree && this.blocks[i].size >= size) {
                const blockId = this.nextId++;

                // Spliting if needed
                if (this.blocks[i].size > size) {
                    const remainingSize = this.blocks[i].size - size;
                    const remainingStart = this.blocks[i].start + size;

                    const leftover = new MemoryBlock(0, remainingStart, remainingSize, true);

                    this.blocks.splice(i + 1, 0, leftover);
                    this.blocks[i].size = size;
                }

                this.blocks[i].isFree = false;
                this.blocks[i].id = blockId;

                this.successfulAllocations++;
                return blockId;
            }
        }

        this.failedAllocations++;
        return -1;
    }

    allocateBestFit(size) {
        this.totalAllocations++;

        // Find SMALLEST free block that fits
        let bestIndex = -1;
        let smallestSize = -1;

        // Check ALL blocks to find the best fit
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].isFree && this.blocks[i].size >= size) {
                // the first fit found?
                if (bestIndex === -1) {
                    bestIndex = i;
                    smallestSize = this.blocks[i].size;
                }
                // smaller than current best?
                else if (this.blocks[i].size < smallestSize) {
                    bestIndex = i;
                    smallestSize = this.blocks[i].size;
                }
            }
        }

        // No suitable block found
        if (bestIndex === -1) {
            this.failedAllocations++;
            return -1;
        }

        // Allocate in the best-fit block
        const i = bestIndex;
        const blockId = this.nextId++;

        // Split if needed
        if (this.blocks[i].size > size) {
            const remainingSize = this.blocks[i].size - size;
            const remainingStart = this.blocks[i].start + size;

            const leftover = new MemoryBlock(0, remainingStart, remainingSize, true);

            this.blocks.splice(i + 1, 0, leftover);
            this.blocks[i].size = size;
        }

        this.blocks[i].isFree = false;
        this.blocks[i].id = blockId;

        this.successfulAllocations++;
        return blockId;
    }

    // Buddy System Allocation
    allocateBuddySystem(size) {
        this.totalAllocations++;

        const requiredSize = this.nextPowerOf2(size);

        let bestIndex = -1;
        let smallestSize = -1;

        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].isFree && this.blocks[i].size >= requiredSize) {
                if ((this.blocks[i].size & (this.blocks[i].size - 1)) === 0) {
                    if (bestIndex === -1 || this.blocks[i].size < smallestSize) {
                        bestIndex = i;
                        smallestSize = this.blocks[i].size;
                    }
                }
            }
        }

        if (bestIndex === -1) {
            this.failedAllocations++;
            this.history.push(`✗ Failed to allocate ${size} KB (needed ${requiredSize} KB) - Buddy System`);
            return -1;
        }

        let i = bestIndex;
        while (this.blocks[i].size > requiredSize) {
            const halfSize = this.blocks[i].size / 2;

            const rightBuddy = new MemoryBlock(0, this.blocks[i].start + halfSize, halfSize, true);

            this.blocks[i].size = halfSize;
            this.blocks.splice(i + 1, 0, rightBuddy);
        }

        const blockId = this.nextId++;
        this.blocks[i].isFree = false;
        this.blocks[i].id = blockId;

        this.successfulAllocations++;
        this.history.push(`✓ Allocated Block #${blockId} (${requiredSize} KB for ${size} KB request) - Buddy System`);
        return blockId;
    }

    free(blockId) {
        for (let i = 0; i < this.blocks.length; i++) {
            if (!this.blocks[i].isFree && this.blocks[i].id === blockId) {
                this.blocks[i].isFree = true;
                this.blocks[i].id = 0;

                // Merging adjacent free blocks
                this.mergeAdjacentFreeBlocks();

                return true;
            }
        }
        return false;
    }

    mergeAdjacentFreeBlocks() {
        for (let i = 0; i < this.blocks.length - 1; ) {
            if (this.blocks[i].isFree && this.blocks[i + 1].isFree) {
                // Merge and expand current block and remove next block
                this.blocks[i].size += this.blocks[i + 1].size;
                // Remove 1 item at position i+1
                this.blocks.splice(i + 1, 1);
            } else {
                i++;
            }
        }
    }

    // Reset Memory
    // reset() {
    //     this.blocks = [new MemoryBlock(0, 0, this.totalSize, true)];
    //     this.nextId = 1;
    //     this.totalAllocations = 0;
    //     this.successfulAllocations = 0;
    //     this.failedAllocations = 0;
    //     this.history.push('🔄 Memory Reset');
    // }

    getUsedMemory() {
        let used = 0;
        for (let i = 0; i < this.blocks.length; i++) {
            if (!this.blocks[i].isFree) {
                used += this.blocks[i].size;
            }
        }
        return used;
    }

    getFreeMemory() {
        return this.totalSize - this.getUsedMemory();
    }

    getLargestFreeBlock() {
        let largest = 0;
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].isFree && this.blocks[i].size > largest) {
                largest = this.blocks[i].size;
            }
        }
        return largest;
    }

    getFreeBlockCount() {
        let count = 0;
        for (let i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].isFree) {
                count++;
            }
        }
        return count;
    }

    getFragmentationPercent() {
        const totalFree = this.getFreeMemory();
        if (totalFree === 0) return 0;

        const largestFree = this.getLargestFreeBlock();
        const fragmentation = (1 - largestFree / totalFree) * 100;

        return fragmentation;
    }

    getBlocks() {
        return this.blocks;
    }

    // getHistory() {
    //     return this.history;
    // }
}

export default MemoryAllocator;
