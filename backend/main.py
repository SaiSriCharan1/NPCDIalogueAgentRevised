from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
from agent import generate_npc_response, NPC_ROSTER

app = FastAPI(title="Superhero NPC Story Dialogue Engine")

# -----------------------------
# CORS CONFIGURATION
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# REQUEST MODELS
# -----------------------------
class DialogueRequest(BaseModel):
    choice: str
    memory: list[Any] = []
    npc_id: str = "ned"
    story_state: dict[str, Any] | None = None
    current_trust: int | None = None


# -----------------------------
# HEALTH / ROOT ROUTE
# -----------------------------
@app.get("/")
def home():
    return {
        "status": "online",
        "title": "Spider-Hero: Web of Shadows NPC Engine",
        "total_npcs": len(NPC_ROSTER),
        "npcs": list(NPC_ROSTER.keys())
    }


# -----------------------------
# GET NPC ROSTER
# -----------------------------
@app.get("/npcs")
def get_npcs():
    """Return all available NPCs, their locations, lore, and starting stats."""
    return {
        "success": True,
        "npcs": list(NPC_ROSTER.values())
    }


# -----------------------------
# GET STORY / OBJECTIVES
# -----------------------------
@app.get("/story")
def get_story():
    """Return the main story storyline and initial objectives."""
    return {
        "main_quest": "Web of Shadows: The Neighborhood Syndicate",
        "chapter": "Chapter 1: Static on the Airwaves",
        "initial_objective": "Meet Ned at the Queens Radio Bodega to scan police frequencies.",
        "objectives": [
            {
                "id": "obj_ned",
                "title": "Contact Ned",
                "desc": "Check in with your guy in the chair at the Radio Bodega.",
                "target_npc": "ned",
                "completed": False
            },
            {
                "id": "obj_mj",
                "title": "Meet MJ at Daily Chronicle Cafe",
                "desc": "Compare notes on missing Oscorp shipments.",
                "target_npc": "mj",
                "completed": False
            },
            {
                "id": "obj_flash",
                "title": "Check Midtown High Bleachers",
                "desc": "Confront Flash Thompson about late-night activity near the gym.",
                "target_npc": "flash",
                "completed": False
            },
            {
                "id": "obj_mysterio",
                "title": "Investigate Theater Alley",
                "desc": "Follow the green smoke to uncover Mysterio's illusion field.",
                "target_npc": "mysterio",
                "completed": False
            },
            {
                "id": "obj_doc_ock",
                "title": "Infiltrate Oscorp Docks",
                "desc": "Discover what Doctor Octopus is constructing with the high-voltage generators.",
                "target_npc": "doc_ock",
                "completed": False
            },
            {
                "id": "obj_goblin",
                "title": "Rooftop Confrontation",
                "desc": "Face Green Goblin at the Clocktower overlook before his glider strikes.",
                "target_npc": "goblin",
                "completed": False
            },
            {
                "id": "obj_may",
                "title": "Visit Aunt May",
                "desc": "Return to May's brownstone stoop for guidance and to restore focus.",
                "target_npc": "aunt_may",
                "completed": False
            }
        ]
    }


# -----------------------------
# DIALOGUE API
# -----------------------------
@app.post("/dialogue")
def dialogue(request: DialogueRequest):
    try:
        result = generate_npc_response(
            choice=request.choice,
            memory=request.memory,
            npc_id=request.npc_id,
            story_state=request.story_state,
            current_trust=request.current_trust
        )

        return {
            "success": True,
            "npc_response": result["npc_response"],
            "trust_change": result.get("trust_change", 0),
            "new_trust": result.get("new_trust", 50),
            "relationship": result.get("relationship", "Neutral"),
            "suggested_choices": result.get("suggested_choices", [])
        }

    except Exception as error:
        print("DIALOGUE ERROR:", repr(error))
        return {
            "success": False,
            "npc_response": f"Connection interference: {str(error)}",
            "trust_change": 0,
            "new_trust": 50,
            "relationship": "Unknown",
            "suggested_choices": [
                "Can you hear me?",
                "Let me check the radio link.",
                "I'll try again."
            ]
        }