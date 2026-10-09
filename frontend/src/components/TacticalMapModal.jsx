import { NPCS, BUILDINGS } from "../game/constants";

export default function TacticalMapModal({
  isOpen,
  onClose,
  playerPosRef,
  questActiveId
}) {
  if (!isOpen) return null;

  const player = playerPosRef?.current || { x: 880, y: 720 };

  return (
    <div className="tactical-map-backdrop" onClick={onClose}>
      <div className="tactical-map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tactical-modal-header">
          <div className="tactical-title-group">
            <span className="tactical-tag">TACTICAL RECONNAISSANCE</span>
            <h2>QUEENS BOROUGH - MIDTOWN SECTOR MAP</h2>
          </div>
          <button className="tactical-close-btn" onClick={onClose}>
            ✕ CLOSE [ESC]
          </button>
        </div>

        <div className="tactical-map-canvas-frame">
          {/* Map Grid and Layout */}
          <div className="tactical-borough-grid">
            {/* Buildings */}
            {BUILDINGS.map((b) => (
              <div
                key={b.id}
                className="tactical-building-card"
                style={{
                  left: `${(b.x / 1800) * 100}%`,
                  top: `${(b.y / 1400) * 100}%`,
                  width: `${(b.w / 1800) * 100}%`,
                  height: `${(b.h / 1400) * 100}%`
                }}
              >
                <span className="building-card-title">{b.label}</span>
              </div>
            ))}

            {/* Central Park Area */}
            <div
              className="tactical-park-area"
              style={{
                left: `${(700 / 1800) * 100}%`,
                top: `${(560 / 1400) * 100}%`,
                width: `${(360 / 1800) * 100}%`,
                height: `${(320 / 1400) * 100}%`
              }}
            >
              <span>CENTRAL PLAZA & PARK</span>
            </div>

            {/* NPC Pins */}
            {NPCS.map((npc) => {
              const isTarget = questActiveId === npc.id;
              return (
                <div
                  key={npc.id}
                  className={`tactical-npc-pin ${isTarget ? "target-pin" : ""}`}
                  style={{
                    left: `${(npc.x / 1800) * 100}%`,
                    top: `${(npc.y / 1400) * 100}%`
                  }}
                >
                  <div
                    className="pin-icon"
                    style={{ borderColor: npc.color, backgroundColor: "#0f172a" }}
                  >
                    <span>{npc.avatar}</span>
                  </div>
                  <div className="pin-tooltip">
                    <strong>{npc.name}</strong>
                    <span className="pin-role">{npc.role}</span>
                    <span className={`pin-align ${npc.alignment.toLowerCase()}`}>
                      {npc.alignment}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Player Pin */}
            <div
              className="tactical-player-pin"
              style={{
                left: `${(player.x / 1800) * 100}%`,
                top: `${(player.y / 1400) * 100}%`
              }}
            >
              <div className="player-pulse-ring" />
              <div className="player-dot">🕷️</div>
              <span className="player-label">HERO</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="tactical-legend-bar">
          <div className="legend-group">
            <span className="legend-chip ally-chip">
              <i className="chip-dot" /> Allies (Ned, MJ, Aunt May)
            </span>
            <span className="legend-chip threat-chip">
              <i className="chip-dot" /> Villains (Goblin, Doc Ock, Mysterio)
            </span>
            <span className="legend-chip unresp-chip">
              <i className="chip-dot" /> Unresponsive (Flash)
            </span>
            <span className="legend-chip target-chip">
              <i className="chip-dot" /> Active Mission Beacon
            </span>
          </div>
          <span className="tactical-controls-note">
            Tip: Walk to any NPC in the world and press [E] to begin conversation.
          </span>
        </div>
      </div>
    </div>
  );
}
