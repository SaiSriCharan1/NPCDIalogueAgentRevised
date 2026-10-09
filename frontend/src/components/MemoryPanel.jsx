function MemoryPanel({ memory }) {
  return (
    <div className="memory-panel">
      <div className="memory-header">
        <span className="memory-icon">✧</span>
        <span>RECENT MEMORIES</span>
      </div>

      {memory.length === 0 ? (
        <div className="empty-memory">
          <span>◇</span>
          <p>Your decisions will be recorded here.</p>
        </div>
      ) : (
        <div className="memory-list">
          {memory.map((item, index) => (
            <div className="memory-item" key={index}>
              <span className="memory-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <p>{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MemoryPanel;