import { useState, useRef } from "react";
import GameWorld from "./game/GameWorld";
import HeroHUD from "./components/HeroHUD";
import Minimap from "./components/Minimap";
import QuestTracker from "./components/QuestTracker";
import BottomControlsBar from "./components/BottomControlsBar";
import CinematicDialogue from "./components/CinematicDialogue";
import TacticalMapModal from "./components/TacticalMapModal";
import { NPCS, INITIAL_QUESTS } from "./game/constants";
import "./App.css";

function App() {
  // Navigation & World State
  const [currentLocation, setCurrentLocation] = useState("Queens Midtown Central Plaza");
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [activeNPC, setActiveNPC] = useState(null);
  const [nearbyNPC, setNearbyNPC] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hero Status
  const [health, setHealth] = useState(100);
  const [focus, setFocus] = useState(100);

  // Live Player Coordinate Ref (no unnecessary 60fps React re-renders)
  const playerPosRef = useRef({ x: 880, y: 720, facing: "down" });

  // Story & Quest Tracking
  const [quests, setQuests] = useState(INITIAL_QUESTS);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [cluesFound, setCluesFound] = useState([]);

  // Per-NPC Dialogue History & Relationship Memory
  const [npcMemoryState, setNpcMemoryState] = useState(() => {
    const memory = {};
    NPCS.forEach((npc) => {
      memory[npc.id] = {
        messages: [
          {
            speaker: npc.name,
            message: npc.greeting
          }
        ],
        trust: npc.initialTrust,
        relationship: npc.relationship,
        suggestedChoices: [
          "What have you observed in this area?",
          "How can we solve this together?",
          "Stay alert, I'm investigating the borough."
        ]
      };
    });
    return memory;
  });

  // Handle Approaching & Pressing [E] on an NPC
  const handleInteract = (npc) => {
    setActiveNPC(npc);
    setIsDialogueOpen(true);
  };

  // Close Dialogue & Return to World
  const handleCloseDialogue = () => {
    setIsDialogueOpen(false);
  };

  // Send Message to NPC (via Gemini API)
  const handleSendMessage = async (text) => {
    if (!activeNPC) return;
    setLoading(true);

    const currentMem = npcMemoryState[activeNPC.id] || {
      messages: [],
      trust: activeNPC.initialTrust,
      relationship: activeNPC.relationship,
      suggestedChoices: []
    };

    // Optimistically push player message
    const updatedMessages = [
      ...currentMem.messages,
      {
        speaker: "Player",
        message: text
      }
    ];

    setNpcMemoryState((prev) => ({
      ...prev,
      [activeNPC.id]: {
        ...prev[activeNPC.id],
        messages: updatedMessages
      }
    }));

    try {
      const response = await fetch("http://127.0.0.1:8000/dialogue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          choice: text,
          memory: updatedMessages.slice(-6),
          npc_id: activeNPC.id,
          story_state: {
            active_mission: quests.title,
            active_task: quests.activeId,
            clues: cluesFound
          },
          current_trust: currentMem.trust
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Backend returned status ${response.status}`);
      }

      const npcReply = data.npc_response || "The line went quiet for a moment.";
      const newTrust = data.new_trust !== undefined ? data.new_trust : currentMem.trust;
      const newRel = data.relationship || currentMem.relationship;
      const newChoices = data.suggested_choices || [
        "Tell me more about what you know.",
        "Be careful out there.",
        "I'll investigate this lead."
      ];

      // Update NPC State
      setNpcMemoryState((prev) => ({
        ...prev,
        [activeNPC.id]: {
          messages: [
            ...updatedMessages,
            {
              speaker: activeNPC.name,
              message: npcReply
            }
          ],
          trust: newTrust,
          relationship: newRel,
          suggestedChoices: newChoices
        }
      }));

      // Story & Quest Progress Triggers
      handleQuestProgress(activeNPC.id);

    } catch (error) {
      console.error("Dialogue request error:", error);
      setNpcMemoryState((prev) => ({
        ...prev,
        [activeNPC.id]: {
          ...prev[activeNPC.id],
          messages: [
            ...updatedMessages,
            {
              speaker: activeNPC.name,
              message: "Communication interference detected. Check radio connection."
            }
          ]
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Quest Progression Handler based on NPC interactions
  const handleQuestProgress = (npcId) => {
    // Check if interaction marks current active task
    const taskMap = {
      ned: "talk_ned",
      mj: "talk_mj",
      flash: "check_flash",
      mysterio: "investigate_mysterio",
      doc_ock: "infiltrate_doc_ock",
      goblin: "face_goblin",
      aunt_may: "visit_may"
    };

    const nextTaskMap = {
      talk_ned: "talk_mj",
      talk_mj: "check_flash",
      check_flash: "investigate_mysterio",
      investigate_mysterio: "infiltrate_doc_ock",
      infiltrate_doc_ock: "face_goblin",
      face_goblin: "visit_may",
      visit_may: "completed"
    };

    const clueMap = {
      ned: "Electromagnetic Scanner Frequency Leak",
      mj: "Oscorp High-Tech Chemical Manifest",
      flash: "Unusual Night Activity Behind Bleachers",
      mysterio: "Illusion Projector Hologram Beacon",
      doc_ock: "Fusion Reactor Core Stabilizer Specs"
    };

    const taskId = taskMap[npcId];
    if (taskId && !completedTasks.includes(taskId)) {
      setCompletedTasks((prev) => [...prev, taskId]);

      // Add discovered clue if available
      if (clueMap[npcId] && !cluesFound.includes(clueMap[npcId])) {
        setCluesFound((prev) => [...prev, clueMap[npcId]]);
      }

      // Advance active quest task
      const nextTaskId = nextTaskMap[taskId];
      if (nextTaskId && nextTaskId !== "completed") {
        setQuests((prev) => ({
          ...prev,
          activeId: nextTaskId
        }));
      }

      // Special Aunt May bonus: Restores health and focus
      if (npcId === "aunt_may") {
        setHealth(100);
        setFocus(100);
      }
    }
  };

  const activeMem = activeNPC
    ? npcMemoryState[activeNPC.id] || {
        messages: [],
        trust: activeNPC.initialTrust,
        relationship: activeNPC.relationship,
        suggestedChoices: []
      }
    : null;

  return (
    <div className="superhero-game-shell">
      {/* 1. 2.5D Physical Game World Canvas */}
      <GameWorld
        activeNPC={activeNPC}
        onInteract={handleInteract}
        questActiveId={quests.tasks.find((t) => t.id === quests.activeId)?.targetId}
        isDialogueOpen={isDialogueOpen}
        playerPosRef={playerPosRef}
        onLocationChange={setCurrentLocation}
        onNearbyNPCChange={setNearbyNPC}
      />

      {/* 2. Top-Left Hero Status HUD */}
      <HeroHUD
        currentLocation={currentLocation}
        health={health}
        focus={focus}
      />

      {/* 3. Top-Right Minimap Radar */}
      <Minimap
        playerPosRef={playerPosRef}
        questActiveId={quests.tasks.find((t) => t.id === quests.activeId)?.targetId}
        onOpenMap={() => setIsMapOpen(true)}
      />

      {/* 4. Left-Side Active Quest Tracker (Positioned cleanly below top HUD) */}
      <QuestTracker
        quests={quests}
        activeTaskId={quests.activeId}
        completedTasks={completedTasks}
        cluesFound={cluesFound}
      />

      {/* 5. Bottom Controls & Action Bar */}
      <BottomControlsBar
        onOpenMap={() => setIsMapOpen(true)}
        nearbyNPC={nearbyNPC}
      />

      {/* 6. Cinematic Dialogue Overlay (Triggered by [E] or Proximity) */}
      {isDialogueOpen && activeNPC && (
        <CinematicDialogue
          npc={activeNPC}
          messages={activeMem.messages}
          trust={activeMem.trust}
          relationship={activeMem.relationship}
          suggestedChoices={activeMem.suggestedChoices}
          loading={loading}
          onSendMessage={handleSendMessage}
          onClose={handleCloseDialogue}
        />
      )}

      {/* 7. Full Tactical Map Modal (Triggered by [M] or Minimap Click) */}
      <TacticalMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        playerPosRef={playerPosRef}
        questActiveId={quests.tasks.find((t) => t.id === quests.activeId)?.targetId}
      />
    </div>
  );
}

export default App;