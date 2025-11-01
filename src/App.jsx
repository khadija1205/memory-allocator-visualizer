import { useState } from 'react';
import './App.css';
import MemoryAllocator from './MemoryAllocator';
import MemoryVisualizer from './MemoryVisualizer';

function App() {
    const [allocator] = useState(() => new MemoryAllocator(64));
    const [blocks, setBlocks] = useState(allocator.getBlocks());
    // const [history, setHistory] = useState(allocator.getHistory());
    // const [history, setHistory] = useState([]);
    const [allocateSize, setAllocateSize] = useState(10);
    const [freeBlockId, setFreeBlockId] = useState('');
    const [strategy, setStrategy] = useState('first-fit');

    // useEffect(() => {
    //     setHistory(allocator.getHistory());
    // }, []);

    const updateState = () => {
        setBlocks([...allocator.getBlocks()]);
        // setHistory([...allocator.getHistory()]);
    };

    const handleAllocate = () => {
        const size = parseInt(allocateSize);
        if (isNaN(size) || size <= 0) {
            alert('Please enter a valid size greater than 0');
            return;
        }

        let id;
        switch (strategy) {
            case 'first-fit':
                id = allocator.allocateFirstFit(size);
                break;
            case 'best-fit':
                id = allocator.allocateBestFit(size);
                break;
            case 'buddy-system':
                id = allocator.allocateBuddySystem(size);
                break;
            default:
                id = allocator.allocateFirstFit(size);
        }

        if (id === -1) {
            alert(' Allocation failed! Not enough contiguous memory.');
        }
        updateState();
    };

    const handleFree = () => {
        const id = parseInt(freeBlockId);
        if (isNaN(id)) {
            alert('Please enter a valid block ID');
            return;
        }

        const success = allocator.free(id);
        if (!success) {
            alert(' Block not found or already free!');
        }
        updateState();
        setFreeBlockId('');
    };

    const handleReset = () => {
        if (window.confirm('Reset all memory? This will clear all allocations.')) {
            allocator.reset();
            updateState();
        }
    };

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            if (action === 'allocate') {
                handleAllocate();
            } else if (action === 'free') {
                handleFree();
            }
        }
    };

    const allocatedBlocks = blocks.filter((b) => !b.isFree);

    return (
        <div className="App">
            <header>
                <h1>Memory Allocator Visualizer</h1>
                <p>Interactive memory management simulator with multiple allocation strategies</p>
            </header>

            <div className="container">
                {/* Strategy Selector */}
                <section className="strategy-section">
                    <h2>Allocation Strategy</h2>
                    <div className="strategy-selector">
                        <label className={strategy === 'first-fit' ? 'active' : ''}>
                            <input
                                type="radio"
                                name="strategy"
                                value="first-fit"
                                checked={strategy === 'first-fit'}
                                onChange={(e) => setStrategy(e.target.value)}
                            />
                            <span className="strategy-name">First-Fit</span>
                            <span className="strategy-desc">Uses first available space (fast)</span>
                        </label>

                        <label className={strategy === 'best-fit' ? 'active' : ''}>
                            <input
                                type="radio"
                                name="strategy"
                                value="best-fit"
                                checked={strategy === 'best-fit'}
                                onChange={(e) => setStrategy(e.target.value)}
                            />
                            <span className="strategy-name">Best-Fit</span>
                            <span className="strategy-desc">Uses smallest fitting space (efficient)</span>
                        </label>

                        <label className={strategy === 'buddy-system' ? 'active' : ''}>
                            <input
                                type="radio"
                                name="strategy"
                                value="buddy-system"
                                checked={strategy === 'buddy-system'}
                                onChange={(e) => setStrategy(e.target.value)}
                            />
                            <span className="strategy-name">Buddy System</span>
                            <span className="strategy-desc">Power-of-2 splitting (low fragmentation)</span>
                        </label>
                    </div>
                </section>

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
                                onKeyPress={(e) => handleKeyPress(e, 'allocate')}
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
                                onKeyPress={(e) => handleKeyPress(e, 'free')}
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

                    <div className="control-group full-width">
                        <button className="btn-reset" onClick={handleReset}>
                            Reset Memory
                        </button>
                    </div>
                </section>

                {/* Statistics */}
                <section className="stats-section">
                    <h2>Statistics</h2>
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
                        <div className="stat-card success">
                            <div className="stat-label">Success Rate</div>
                            <div className="stat-value">
                                {allocator.totalAllocations === 0
                                    ? '0'
                                    : ((allocator.successfulAllocations / allocator.totalAllocations) * 100).toFixed(0)}
                                %
                                <span className="stat-percent">
                                    ({allocator.successfulAllocations}/{allocator.totalAllocations})
                                </span>
                            </div>
                        </div>
                        <div className="stat-card blocks">
                            <div className="stat-label">Free Blocks</div>
                            <div className="stat-value">{allocator.getFreeBlockCount()}</div>
                        </div>
                    </div>
                </section>

                {/* History */}
                {/* <section className="history-section">
                    <h2> History</h2>
                    <div className="history-log">
                        {history.length === 0 ? (
                            <div className="no-history">No operations yet</div>
                        ) : (
                            history
                                .slice()
                                .reverse()
                                .slice(0, 10)
                                .map((entry, index) => (
                                    <div key={index} className="history-entry">
                                        {entry}
                                    </div>
                                ))
                        )}
                    </div>
                </section> */}
            </div>

            <footer>
                <p>Built with React • Memory Management Algorithms Visualized</p>
            </footer>
        </div>
    );
}

export default App;
