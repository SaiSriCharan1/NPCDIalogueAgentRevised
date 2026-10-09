function NPCSelector({ npcs, selectedNPC, onSelectNPC }) {
  return (
    <div className="npc-list">
      {npcs.map((npc) => (
        <button
          key={npc.id}
          className={
            selectedNPC.id === npc.id
              ? "npc-card selected"
              : "npc-card"
          }
          onClick={() => onSelectNPC(npc)}
        >
          <div className="npc-card-avatar">
            {npc.avatar}
          </div>

          <div className="npc-card-info">
            <strong>{npc.name}</strong>
            <span>{npc.role}</span>
          </div>

          <div className="npc-card-arrow">›</div>
        </button>
      ))}
    </div>
  );
}

export default NPCSelector;