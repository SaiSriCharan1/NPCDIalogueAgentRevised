// Verification script: Test navigation from spawn to all 7 NPCs and between NPCs
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  INTERACTION_RADIUS,
  NPCS,
  BUILDINGS
} from "./frontend/src/game/constants.js";

function checkCollision(px, py, radius = 16) {
  if (
    px - radius < 30 ||
    px + radius > WORLD_WIDTH - 30 ||
    py - radius < 30 ||
    py + radius > WORLD_HEIGHT - 30
  ) {
    return true;
  }
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

// Proper Manhattan grid routing using Midtown Parkway (y: 720) and 1st/2nd Avenues (x: 580, x: 1180)
function canReachGrid(startX, startY, targetX, targetY, targetName) {
  // Determine best north-south avenue (1st Ave at 580 or 2nd Ave at 1180)
  const avenue1Dist = Math.abs(startX - 580) + Math.abs(targetX - 580);
  const avenue2Dist = Math.abs(startX - 1180) + Math.abs(targetX - 1180);
  const avenueX = avenue1Dist <= avenue2Dist ? 580 : 1180;
  
  // Route: Start -> Walk to Avenue X -> Walk along Avenue X to Target Y -> Walk to Target X
  const waypoints = [
    { x: startX, y: startY },
    { x: avenueX, y: startY },
    { x: avenueX, y: targetY },
    { x: targetX, y: targetY }
  ];

  let currentX = startX;
  let currentY = startY;
  let blocked = false;

  for (let i = 1; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const dist = Math.hypot(wp.x - currentX, wp.y - currentY);
    const steps = Math.max(10, Math.ceil(dist / 6));
    const dx = (wp.x - currentX) / steps;
    const dy = (wp.y - currentY) / steps;

    for (let s = 0; s < steps; s++) {
      currentX += dx;
      currentY += dy;
      if (checkCollision(currentX, currentY, 16)) {
        blocked = true;
        break;
      }
    }
    if (blocked) break;
  }

  const finalDist = Math.hypot(currentX - targetX, currentY - targetY);
  const inRange = finalDist <= INTERACTION_RADIUS;
  return { blocked, finalDist, inRange, targetName, currentX, currentY };
}

console.log("=== VERIFYING CITY GRID NAVIGATION TO ALL 7 NPCS ===");
const spawn = { x: 880, y: 640 };

let allPassed = true;
NPCS.forEach((npc) => {
  const res = canReachGrid(spawn.x, spawn.y, npc.x, npc.y, npc.name);
  const status = (!res.blocked && res.inRange) ? "PASS" : "FAIL";
  console.log(`[${status}] Spawn -> ${npc.name.padEnd(16)} @ (${npc.x}, ${npc.y}): Dist = ${res.finalDist.toFixed(1)}px (Blocked: ${res.blocked})`);
  if (status === "FAIL") allPassed = false;
});

console.log("\n=== VERIFYING NPC-TO-NPC TRAVEL ===");
// Test walking from Ned to MJ, MJ to Flash, Flash to Doc Ock, etc.
const pairs = [
  ["ned", "mj"],
  ["mj", "flash"],
  ["flash", "mysterio"],
  ["mysterio", "doc_ock"],
  ["doc_ock", "goblin"],
  ["goblin", "aunt_may"]
];

pairs.forEach(([idA, idB]) => {
  const npcA = NPCS.find(n => n.id === idA);
  const npcB = NPCS.find(n => n.id === idB);
  // Both can reach midtown avenue intersection at (880, 720)
  const reach1 = canReachGrid(npcA.x, npcA.y, 880, 720, "Center");
  const reach2 = canReachGrid(880, 720, npcB.x, npcB.y, npcB.name);
  const pass = !reach1.blocked && !reach2.blocked && reach2.inRange;
  console.log(`[${pass ? "PASS" : "FAIL"}] ${npcA.name} -> ${npcB.name}: via Midtown Parkway`);
  if (!pass) allPassed = false;
});

console.log(`\nOVERALL NAVIGATION VERIFICATION: ${allPassed ? "SUCCESS" : "FAIL"}`);
