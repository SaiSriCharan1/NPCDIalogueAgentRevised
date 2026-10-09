import { useEffect, useRef } from "react";
import { WORLD_WIDTH, WORLD_HEIGHT, NPCS, BUILDINGS } from "../game/constants";

export default function Minimap({
  playerPosRef,
  questActiveId,
  onOpenMap
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    const size = canvas.width;
    const scaleX = size / WORLD_WIDTH;
    const scaleY = size / WORLD_HEIGHT;

    function renderRadar(time) {
      ctx.clearRect(0, 0, size, size);

      // Radar Background
      ctx.fillStyle = "rgba(10, 15, 29, 0.92)";
      ctx.fillRect(0, 0, size, size);

      // Grid Lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      ctx.lineWidth = 1;
      for (let i = 20; i < size; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }

      // Streets
      ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
      // Parkway horizontal
      ctx.fillRect(4, 660 * scaleY, size - 8, 120 * scaleY);
      // Avenues vertical
      ctx.fillRect(550 * scaleX, 4, 110 * scaleX, size - 8);
      ctx.fillRect(1110 * scaleX, 4, 110 * scaleX, size - 8);

      // Buildings
      BUILDINGS.forEach((b) => {
        ctx.fillStyle = "rgba(51, 65, 85, 0.8)";
        ctx.fillRect(
          b.x * scaleX,
          b.y * scaleY,
          b.w * scaleX,
          b.h * scaleY
        );
        ctx.strokeStyle = "rgba(71, 85, 105, 0.9)";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          b.x * scaleX,
          b.y * scaleY,
          b.w * scaleX,
          b.h * scaleY
        );
      });

      // NPCs
      NPCS.forEach((npc) => {
        const nx = npc.x * scaleX;
        const ny = npc.y * scaleY;
        const isTarget = questActiveId && npc.id === questActiveId;

        if (isTarget) {
          const pulse = (Math.sin(time * 0.007) + 1) * 3;
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(nx, ny, 6 + pulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Player Blip
      if (playerPosRef && playerPosRef.current) {
        const px = playerPosRef.current.x * scaleX;
        const py = playerPosRef.current.y * scaleY;
        const facing = playerPosRef.current.facing || "down";

        // Radar sweep effect
        const sweepAngle = (time * 0.002) % (Math.PI * 2);
        ctx.strokeStyle = "rgba(239, 68, 68, 0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(
          px + Math.cos(sweepAngle) * 35,
          py + Math.sin(sweepAngle) * 35
        );
        ctx.stroke();

        // Player marker
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Facing indicator tick
        let fx = px;
        let fy = py;
        if (facing === "up") fy -= 8;
        else if (facing === "down") fy += 8;
        else if (facing === "left") fx -= 8;
        else if (facing === "right") fx += 8;

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(fx, fy);
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderRadar);
    }

    animId = requestAnimationFrame(renderRadar);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playerPosRef, questActiveId]);

  return (
    <div className="minimap-panel" onClick={onOpenMap} title="Click to open Full Tactical Map (M)">
      <div className="minimap-header">
        <span className="radar-badge">RADAR SCAN</span>
        <span className="expand-hint">[M] EXPAND</span>
      </div>

      <div className="minimap-radar-frame">
        <canvas ref={canvasRef} width={150} height={150} className="minimap-canvas" />
        <div className="radar-crosshair-h" />
        <div className="radar-crosshair-v" />
      </div>

      <div className="minimap-legend">
        <span className="legend-item"><i className="dot dot-ally" />Allies</span>
        <span className="legend-item"><i className="dot dot-threat" />Villains</span>
        <span className="legend-item"><i className="dot dot-unresp" />Flash</span>
      </div>
    </div>
  );
}
