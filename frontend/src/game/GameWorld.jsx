import { useEffect, useRef } from "react";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  PLAYER_SPEED,
  SPRINT_SPEED,
  WEB_ZIP_SPEED,
  INTERACTION_RADIUS,
  NPCS,
  BUILDINGS,
  STREETLIGHTS,
  SEWER_GRATES
} from "./constants";
import { sounds } from "./audio";

export default function GameWorld({
  activeNPC,
  onInteract,
  questActiveId,
  isDialogueOpen,
  playerPosRef,
  onLocationChange,
  onNearbyNPCChange
}) {
  const canvasRef = useRef(null);

  // Persistent Player State across all React re-renders
  const playerRef = useRef({
    x: 880,
    y: 640, // Spawn on the open plaza path north of the fountain
    radius: 16,
    vx: 0,
    vy: 0,
    facing: "down",
    isSprinting: false,
    isZipping: false,
    zipTimer: 0,
    animFrame: 0,
    stepTimer: 0
  });

  const cameraRef = useRef({ x: 0, y: 0 });
  const lastDistrictRef = useRef("");
  const nearbyNPCRef = useRef(null);

  // Keep changing props in ref so useEffect runs ONCE without re-mounting
  const propsRef = useRef({});
  propsRef.current = {
    activeNPC,
    onInteract,
    questActiveId,
    isDialogueOpen,
    playerPosRef,
    onLocationChange,
    onNearbyNPCChange
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const player = playerRef.current;
    const camera = cameraRef.current;

    // Sync initial playerPosRef for Minimap
    if (propsRef.current.playerPosRef) {
      propsRef.current.playerPosRef.current = {
        x: player.x,
        y: player.y,
        facing: player.facing
      };
    }

    const keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false,
      Shift: false,
      Space: false
    };

    // Environmental particles (steam & dust)
    const steamParticles = [];
    SEWER_GRATES.forEach((grate) => {
      for (let i = 0; i < 6; i++) {
        steamParticles.push({
          x: grate.x + (Math.random() * 16 - 8),
          y: grate.y + (Math.random() * 16 - 8),
          grateX: grate.x,
          grateY: grate.y,
          vy: -15 - Math.random() * 25,
          vx: Math.random() * 8 - 4,
          radius: 6 + Math.random() * 10,
          alpha: Math.random() * 0.4
        });
      }
    });

    const webTrails = [];
    let lastTime = performance.now();
    let animId = null;

    // Handle Window Resizing
    function resizeCanvas() {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Keyboard Listeners
    function handleKeyDown(e) {
      const { isDialogueOpen: inDialogue, onInteract: triggerInteract } = propsRef.current;

      if (inDialogue) {
        return; // Don't process game inputs while dialogue modal is active
      }

      if (e.key === "e" || e.key === "E") {
        const nearby = nearbyNPCRef.current;
        if (nearby && triggerInteract) {
          e.preventDefault();
          sounds.playDialogueOpen(nearby.alignment);
          triggerInteract(nearby);
          return;
        }
      }

      if (e.key === " " && !player.isZipping) {
        e.preventDefault();
        player.isZipping = true;
        player.zipTimer = 0.22; // 220ms zip burst
        sounds.playZip();

        // Spawn web burst particle effect
        for (let i = 0; i < 8; i++) {
          webTrails.push({
            x: player.x,
            y: player.y,
            alpha: 1.0,
            radius: 4 + Math.random() * 4
          });
        }
      }

      if (e.key in keys) {
        keys[e.key] = true;
      }
      if (e.key === "Shift") {
        keys.Shift = true;
      }
    }

    function handleKeyUp(e) {
      if (e.key in keys) {
        keys[e.key] = false;
      }
      if (e.key === "Shift") {
        keys.Shift = false;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Collision Check with Map Boundaries and Buildings
    function checkCollision(px, py, radius) {
      // Map outer boundaries
      if (
        px - radius < 30 ||
        px + radius > WORLD_WIDTH - 30 ||
        py - radius < 30 ||
        py + radius > WORLD_HEIGHT - 30
      ) {
        return true;
      }

      // Buildings
      for (const b of BUILDINGS) {
        if (
          px + radius > b.x &&
          px - radius < b.x + b.w &&
          py + radius > b.y &&
          py - radius < b.y + b.h
        ) {
          return true;
        }
      }
      return false;
    }

    // Determine current district nameplate
    function checkDistrict(px, py) {
      let district = "Queens Midtown Central Plaza";
      if (py < 480) {
        if (px < 600) district = "Daily Chronicle District - West 4th St";
        else if (px > 1100) district = "Queens Radio Relay Sector - East Ave";
        else district = "St. Jude Historic Heights - North Overlook";
      } else if (py > 800) {
        if (px < 600) district = "Midtown High Grounds - South Athletic Field";
        else if (px > 1100) district = "Oscorp Industrial Basin - Pier 12";
        else district = "Park View Historic Residential Row";
      } else {
        if (px < 500) district = "Majestic Grand Theater Alleyway";
      }

      if (district !== lastDistrictRef.current) {
        lastDistrictRef.current = district;
        if (propsRef.current.onLocationChange) {
          propsRef.current.onLocationChange(district);
        }
      }
    }

    // Main 60 FPS Game Loop
    function loop(currentTime) {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const { isDialogueOpen: inDialogue, questActiveId, onNearbyNPCChange } = propsRef.current;

      // -----------------------------
      // 1. UPDATE HERO MOVEMENT
      // -----------------------------
      if (!inDialogue) {
        let moveX = 0;
        let moveY = 0;

        if (keys.w || keys.ArrowUp) moveY -= 1;
        if (keys.s || keys.ArrowDown) moveY += 1;
        if (keys.a || keys.ArrowLeft) moveX -= 1;
        if (keys.d || keys.ArrowRight) moveX += 1;

        if (moveX !== 0 || moveY !== 0) {
          // Normalize movement vector
          const len = Math.hypot(moveX, moveY);
          moveX /= len;
          moveY /= len;

          if (Math.abs(moveX) > Math.abs(moveY)) {
            player.facing = moveX > 0 ? "right" : "left";
          } else {
            player.facing = moveY > 0 ? "down" : "up";
          }

          let speed = PLAYER_SPEED;
          if (keys.Shift) speed = SPRINT_SPEED;
          if (player.isZipping) speed = WEB_ZIP_SPEED;

          const dx = moveX * speed * dt;
          const dy = moveY * speed * dt;

          // Slide along X axis
          if (!checkCollision(player.x + dx, player.y, player.radius)) {
            player.x += dx;
          }
          // Slide along Y axis
          if (!checkCollision(player.x, player.y + dy, player.radius)) {
            player.y += dy;
          }

          // Step sound rhythm
          player.stepTimer += dt;
          const stepInterval = keys.Shift ? 0.22 : 0.32;
          if (player.stepTimer > stepInterval) {
            player.stepTimer = 0;
            sounds.playStep();
          }

          player.animFrame += dt * (keys.Shift ? 14 : 9);
        } else {
          player.stepTimer = 0;
        }

        // Handle Zip Timer
        if (player.isZipping) {
          player.zipTimer -= dt;
          webTrails.push({
            x: player.x,
            y: player.y,
            alpha: 0.8,
            radius: player.radius * 0.9
          });
          if (player.zipTimer <= 0) {
            player.isZipping = false;
          }
        }
      }

      // Keep parent playerPosRef in sync (for Minimap radar)
      if (propsRef.current.playerPosRef) {
        propsRef.current.playerPosRef.current = {
          x: player.x,
          y: player.y,
          facing: player.facing
        };
      }

      checkDistrict(player.x, player.y);

      // Check proximity to all 7 NPCs
      let foundNearby = null;
      for (const npc of NPCS) {
        const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
        if (dist <= INTERACTION_RADIUS) {
          foundNearby = npc;
          break;
        }
      }

      if (foundNearby !== nearbyNPCRef.current) {
        nearbyNPCRef.current = foundNearby;
        if (onNearbyNPCChange) {
          onNearbyNPCChange(foundNearby);
        }
      }

      // Update Web Trails
      for (let i = webTrails.length - 1; i >= 0; i--) {
        webTrails[i].alpha -= dt * 3.5;
        if (webTrails[i].alpha <= 0) webTrails.splice(i, 1);
      }

      // Update Steam Particles
      steamParticles.forEach((p) => {
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.radius += dt * 4;
        p.alpha -= dt * 0.25;
        if (p.alpha <= 0 || p.y < p.grateY - 70) {
          p.x = p.grateX + (Math.random() * 16 - 8);
          p.y = p.grateY;
          p.radius = 6 + Math.random() * 8;
          p.alpha = 0.35 + Math.random() * 0.2;
        }
      });

      // Smooth Camera Tracking
      const targetCamX = player.x - canvas.width / 2;
      const targetCamY = player.y - canvas.height / 2;
      camera.x += (targetCamX - camera.x) * 0.12;
      camera.y += (targetCamY - camera.y) * 0.12;

      // Clamp Camera to World Bounds
      camera.x = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, camera.x));
      camera.y = Math.max(0, Math.min(WORLD_HEIGHT - canvas.height, camera.y));

      // -----------------------------
      // 2. RENDER THE GAME WORLD
      // -----------------------------
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-camera.x, -camera.y);

      // --- Ground / Dark Asphalt ---
      ctx.fillStyle = "#0c111a";
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // --- Sidewalk Pavement Grid ---
      ctx.fillStyle = "#161f2e";
      ctx.fillRect(40, 360, WORLD_WIDTH - 80, 70); // North sidewalk
      ctx.fillRect(40, 1020, WORLD_WIDTH - 80, 70); // South sidewalk
      ctx.fillRect(480, 40, 70, WORLD_HEIGHT - 80); // West sidewalk
      ctx.fillRect(1220, 40, 70, WORLD_HEIGHT - 80); // East sidewalk

      // --- Roads / Avenues ---
      ctx.fillStyle = "#090d14";
      ctx.fillRect(40, 660, WORLD_WIDTH - 80, 120); // Midtown Parkway (Horizontal)
      ctx.fillRect(550, 40, 110, WORLD_HEIGHT - 80); // 1st Avenue (Vertical)
      ctx.fillRect(1110, 40, 110, WORLD_HEIGHT - 80); // 2nd Avenue (Vertical)

      // Road markings (yellow dashed lines)
      ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      ctx.lineWidth = 3;
      ctx.setLineDash([24, 20]);
      ctx.beginPath();
      ctx.moveTo(40, 720);
      ctx.lineTo(WORLD_WIDTH - 40, 720);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(605, 40);
      ctx.lineTo(605, WORLD_HEIGHT - 40);
      ctx.moveTo(1165, 40);
      ctx.lineTo(1165, WORLD_HEIGHT - 40);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // Painted Crosswalks
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      const crosswalkLocations = [
        { x: 550, y: 640, w: 110, h: 20 },
        { x: 550, y: 780, w: 110, h: 20 },
        { x: 1110, y: 640, w: 110, h: 20 },
        { x: 1110, y: 780, w: 110, h: 20 }
      ];
      crosswalkLocations.forEach((cw) => {
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(cw.x + i * 18, cw.y, 10, cw.h);
        }
      });

      // --- Central Plaza & Park Lawn ---
      ctx.fillStyle = "#0d2b1f"; // Dark green grass
      ctx.beginPath();
      ctx.roundRect(700, 560, 360, 320, 24);
      ctx.fill();
      ctx.strokeStyle = "#1b4332";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Stone pathways through park
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(860, 560, 40, 320);
      ctx.fillRect(700, 700, 360, 40);

      // Park Fountain in Center
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(880, 720, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fountain bubbling water with animated ripple
      const ripple = (Math.sin(currentTime * 0.004) + 1) * 6;
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(880, 720, 26 + ripple, 0, Math.PI * 2);
      ctx.fill();

      // --- Buildings & Landmarks ---
      BUILDINGS.forEach((b) => {
        // Drop shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(b.x + 10, b.y + 10, b.w, b.h);

        // Building facade
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        // Rooftop inset
        ctx.fillStyle = b.roofColor;
        ctx.fillRect(b.x + 12, b.y + 12, b.w - 24, b.h - 24);

        // Rooftop machinery details
        ctx.fillStyle = "#334155";
        ctx.fillRect(b.x + 30, b.y + 30, 40, 30);
        ctx.fillRect(b.x + 85, b.y + 30, 24, 24);

        // Illuminated architectural windows
        ctx.fillStyle = "rgba(253, 230, 138, 0.38)";
        for (let wx = b.x + 30; wx < b.x + b.w - 30; wx += 44) {
          for (let wy = b.y + 70; wy < b.y + b.h - 40; wy += 36) {
            ctx.fillRect(wx, wy, 20, 14);
          }
        }

        // Illuminated Neon Sign on roof
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.fillRect(b.x + 20, b.y - 18, b.w - 40, 24);
        ctx.strokeStyle = b.signColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x + 20, b.y - 18, b.w - 40, 24);

        ctx.fillStyle = b.signColor;
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(b.label, b.x + b.w / 2, b.y - 3);
      });

      // --- Sewer Grates & Rising Steam ---
      SEWER_GRATES.forEach((grate) => {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(grate.x - 12, grate.y - 12, 24, 24);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.strokeRect(grate.x - 12, grate.y - 12, 24, 24);
      });

      // Render Steam Particles
      steamParticles.forEach((p) => {
        ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Streetlights & Ambient Radial Cones ---
      STREETLIGHTS.forEach((light) => {
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(light.x, light.y, 4, 0, Math.PI * 2);
        ctx.fill();

        const grad = ctx.createRadialGradient(
          light.x,
          light.y,
          5,
          light.x,
          light.y,
          light.radius
        );
        grad.addColorStop(0, "rgba(253, 224, 71, 0.25)");
        grad.addColorStop(0.6, "rgba(253, 224, 71, 0.08)");
        grad.addColorStop(1, "rgba(253, 224, 71, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Render NPCs ---
      NPCS.forEach((npc) => {
        const isTarget = questActiveId && npc.id === questActiveId;
        const isNearby = nearbyNPCRef.current && nearbyNPCRef.current.id === npc.id;

        // Ground shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.ellipse(npc.x, npc.y + 12, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing Proximity Ring
        if (isNearby) {
          const ringPulse = (Math.sin(currentTime * 0.008) + 1) * 4;
          ctx.strokeStyle = npc.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(npc.x, npc.y, 24 + ringPulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = `${npc.color}22`;
          ctx.fill();
        } else if (isTarget) {
          // Objective beacon
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(npc.x, npc.y, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // NPC Character Body Silhouette
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(npc.x, npc.y - 4, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // NPC Avatar Symbol inside
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(npc.avatar, npc.x, npc.y - 4);

        // NPC Nameplate Above
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.roundRect(npc.x - 55, npc.y - 42, 110, 22, 6);
        ctx.fill();
        ctx.strokeStyle = npc.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(npc.name, npc.x, npc.y - 28);

        // Alignment badge dot
        ctx.fillStyle =
          npc.alignment === "Villain"
            ? "#ef4444"
            : npc.alignment === "Unresponsive"
            ? "#94a3b8"
            : "#22c55e";
        ctx.beginPath();
        ctx.arc(npc.x - 44, npc.y - 31, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Render Web Trails (When Zipping) ---
      webTrails.forEach((trail) => {
        ctx.fillStyle = `rgba(239, 68, 68, ${trail.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Render Playable Hero ---
      // Ground shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + 14, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hero Suit Body (Spider-Red & Midnight Blue)
      ctx.fillStyle = "#dc2626"; // Crimson suit red
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Midnight blue suit accents
      ctx.fillStyle = "#1e3a8a";
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // White Glowing Spider Eye Lenses
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;

      if (player.facing === "down") {
        ctx.beginPath();
        ctx.ellipse(player.x - 5, player.y + 3, 3, 5, -0.2, 0, Math.PI * 2);
        ctx.ellipse(player.x + 5, player.y + 3, 3, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (player.facing === "up") {
        ctx.beginPath();
        ctx.ellipse(player.x - 4, player.y - 3, 2, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(player.x + 4, player.y - 3, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (player.facing === "left") {
        ctx.beginPath();
        ctx.ellipse(player.x - 6, player.y + 1, 3, 5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (player.facing === "right") {
        ctx.beginPath();
        ctx.ellipse(player.x + 6, player.y + 1, 3, 5, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0; // Reset lens glow

      // Outer Suit Ring
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.stroke();

      // --- Floating Proximity Interaction Prompt ---
      const currentNearby = nearbyNPCRef.current;
      if (currentNearby && !inDialogue) {
        const promptY = currentNearby.y - 66;
        const promptText = `[E] TALK TO ${currentNearby.name.toUpperCase()}`;

        ctx.fillStyle = "rgba(10, 15, 29, 0.94)";
        ctx.beginPath();
        ctx.roundRect(currentNearby.x - 85, promptY, 170, 30, 8);
        ctx.fill();

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(promptText, currentNearby.x, promptY + 15);
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []); // Run ONCE on mount! Props are accessed via propsRef to prevent re-mount resets

  return (
    <div className="game-canvas-container">
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
