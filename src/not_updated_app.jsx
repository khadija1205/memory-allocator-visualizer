import { useState } from 'react';
import './App.css';
import MemoryAllocator from './MemoryAllocator';
import MemoryVisualizer from './MemoryVisualizer';

function App() {
    const [allocator] = useState(() => new MemoryAllocator(64));
    const [blocks, setBlocks] = useState(allocator.getBlocks());
    const [allocateSize, setAllocateSize] = useState(10);
    const [freeBlockId, setFreeBlockId] = useState('');

    const handleAllocate = () => {
        const size = parseInt(allocateSize);
        if (isNaN(size) || size <= 0) {
            alert('Please enter a valid size');
            return;
        }

        const id = allocator.allocateFirstFit(size);
        if (id !== -1) {
            console.log(' Allocated block:', id);
        } else {
            alert('Allocation failed! Not enough memory.');
        }
        setBlocks([...allocator.getBlocks()]);
    };

    const handleFree = () => {
        const id = parseInt(freeBlockId);
        if (isNaN(id)) {
            alert('Please enter a valid block ID');
            return;
        }

        const success = allocator.free(id);
        if (success) {
            console.log('✓ Freed block', id);
        } else {
            alert(' Block not found or already free!');
        }
        setBlocks([...allocator.getBlocks()]);
        setFreeBlockId('');
    };

    const allocatedBlocks = blocks.filter((b) => !b.isFree);

    return (
        <div className="App">
            <header>
                <h1>Memory Allocator Visualizer</h1>
                <p>Interactive memory management simulator with First-Fit algorithm</p>
            </header>

            <div className="container">
                {/* Visual Memory Bar */}
                <section className="visualizer-section">
                    <h2>Memory Layout</h2>
                    <MemoryVisualizer blocks={blocks} totalSize={64} />
                </section>

                {/* Controls */}
                <section className="controls-section">
                    <div className="control-group">
                        <h3>Allocate Memory</h3>
                        <div className="input-group">
                            <input
                                type="number"
                                value={allocateSize}
                                onChange={(e) => setAllocateSize(e.target.value)}
                                placeholder="Size in KB"
                                min="1"
                            />
                            <button className="btn-primary" onClick={handleAllocate}>
                                Allocate
                            </button>
                        </div>
                    </div>

                    <div className="control-group">
                        <h3>Free Memory</h3>
                        <div className="input-group">
                            <input
                                type="number"
                                value={freeBlockId}
                                onChange={(e) => setFreeBlockId(e.target.value)}
                                placeholder="Block ID"
                            />
                            <button className="btn-secondary" onClick={handleFree}>
                                Free Block
                            </button>
                        </div>
                        <div className="allocated-blocks">
                            <strong>Allocated:</strong>{' '}
                            {allocatedBlocks.length === 0 ? (
                                <span className="no-blocks">None</span>
                            ) : (
                                allocatedBlocks.map((b) => (
                                    <span key={b.id} className="block-tag">
                                        #{b.id} ({b.size}KB)
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Statistics */}
                <section className="stats-section">
                    <h2>📊 Statistics</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Memory</div>
                            <div className="stat-value">{allocator.totalSize} KB</div>
                        </div>
                        <div className="stat-card used">
                            <div className="stat-label">Used Memory</div>
                            <div className="stat-value">
                                {allocator.getUsedMemory()} KB
                                <span className="stat-percent">
                                    ({((allocator.getUsedMemory() / allocator.totalSize) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                        <div className="stat-card free">
                            <div className="stat-label">Free Memory</div>
                            <div className="stat-value">
                                {allocator.getFreeMemory()} KB
                                <span className="stat-percent">
                                    ({((allocator.getFreeMemory() / allocator.totalSize) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                        <div className="stat-card fragmentation">
                            <div className="stat-label">Fragmentation</div>
                            <div className="stat-value">{allocator.getFragmentationPercent().toFixed(1)}%</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default App;
