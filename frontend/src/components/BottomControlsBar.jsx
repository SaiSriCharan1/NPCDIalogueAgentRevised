export default function BottomControlsBar({
  onOpenMap,
  nearbyNPC = null
}) {
  return (
    <footer className="bottom-controls-bar">
      <div className="controls-group-left">
        <span className={`control-item ${nearbyNPC ? "active-interact" : ""}`}>
          <kbd className="key-cap">E</kbd>
          <span className="control-text">
            {nearbyNPC ? `Talk to ${nearbyNPC.name}` : "Interact"}
          </span>
        </span>
        <span className="control-separator">•</span>
        <span className="control-item">
          <kbd className="key-cap">WASD</kbd>
          <span className="control-text">Move</span>
        </span>
        <span className="control-separator">•</span>
        <span className="control-item">
          <kbd className="key-cap">SHIFT</kbd>
          <span className="control-text">Sprint</span>
        </span>
        <span className="control-separator">•</span>
        <span className="control-item">
          <kbd className="key-cap">SPACE</kbd>
          <span className="control-text">Web-Zip</span>
        </span>
      </div>

      <div className="controls-group-right">
        <button className="city-map-btn" onClick={onOpenMap} title="Open City Map (M)">
          <kbd className="key-cap">M</kbd>
          <span className="control-text">City Map</span>
        </button>
      </div>
    </footer>
  );
}
