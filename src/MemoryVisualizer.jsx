import './MemoryVisualizer.css';

function MemoryVisualizer({ blocks, totalSize }) {
    return (
        <div className="memory-visualizer">
            <div className="memory-bar">
                {blocks.map((block, index) => {
                    const widthPercent = (block.size / totalSize) * 100;

                    return (
                        <div
                            key={index}
                            className={`memory-block ${block.isFree ? 'free' : 'allocated'}`}
                            style={{ width: `${widthPercent}%` }}
                            title={`${block.isFree ? 'Free' : `Block #${block.id}`}: ${block.size} KB`}
                        >
                            <span className="block-label">
                                {block.isFree ? `${block.size}KB` : `#${block.id}\n${block.size}KB`}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="memory-scale">
                <span>0 KB</span>
                <span>{totalSize} KB</span>
            </div>
        </div>
    );
}

export default MemoryVisualizer;
