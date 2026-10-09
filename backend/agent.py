import os
import json
import random
import re
from dotenv import load_dotenv
from google import genai
from google.genai import types

# ==========================================
# 1. LOAD GEMINI API KEY & CLIENT
# ==========================================

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is missing. Check backend/.env")

client = genai.Client(api_key=api_key)

# Preferred Gemini models in fallback order
GEMINI_MODELS = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
]

# ==========================================
# 2. SUPERHERO NPC DEFINITIONS
# ==========================================

NPC_ROSTER = {
    "ned": {
        "id": "ned",
        "name": "Ned Leeds",
        "role": "Tech Specialist & Guy in the Chair",
        "alignment": "Allied",
        "avatar": "💻",
        "location": "Queens Radio Bodega (Tech Lab)",
        "world_pos": {"x": 1380, "y": 280},
        "initial_trust": 75,
        "relationship": "Friendly",
        "greeting": "Yo! Police scanners are going nuts across the district. I'm decrypting police frequencies right now—what do you need me to scan for?",
        "personality": (
            "Enthusiastic, loyal, geeky, speaks quickly with genuine excitement. "
            "Knows high-tech radio encryption, police bands, and hacking. "
            "Refers to the Hero as his best friend and crimefighting partner."
        ),
        "goal": "Track illegal energy surges and help the Hero investigate suspicious criminal activity across the city.",
        "secret_info": "Detected massive magnetic anomalies near the old shipping docks and weird electromagnetic frequencies around the abandoned theater."
    },

    "mj": {
        "id": "mj",
        "name": "MJ (Mary Jane)",
        "role": "Investigative Reporter",
        "alignment": "Allied",
        "avatar": "📸",
        "location": "Daily Chronicle Cafe",
        "world_pos": {"x": 360, "y": 300},
        "initial_trust": 70,
        "relationship": "Friendly",
        "greeting": "Keep your voice down. Something major is brewing in this neighborhood. I've been cross-referencing Oscorp shipping manifests all morning.",
        "personality": (
            "Smart, observant, confident, witty, and grounded. Doesn't miss subtle details. "
            "Has an investigative reporter's sharp skepticism and courage. Completely has the Hero's back."
        ),
        "goal": "Expose the syndicate tying Oscorp chemical shipments to violent incidents in the neighborhood.",
        "secret_info": "Oscorp executive Norman Osborn disappeared from public view three days ago, right when high-tech glider components vanished from transit."
    },

    "aunt_may": {
        "id": "aunt_may",
        "name": "Aunt May",
        "role": "Caring Mentor & Moral Anchor",
        "alignment": "Allied",
        "avatar": "👵",
        "location": "Park View Brownstone Stoop",
        "world_pos": {"x": 920, "y": 1050},
        "initial_trust": 90,
        "relationship": "Supportive",
        "greeting": "You look like you're carrying the weight of the whole world on your shoulders. Come sit down for a moment. Have you eaten anything today?",
        "personality": (
            "Warm, wise, empathetic, courageous, and deeply caring. Offers comfort and reminders about morality, "
            "humility, and the responsibility that comes with having the power to protect others."
        ),
        "goal": "Keep the Hero safe, remind him why he fights, and help him understand the moral consequences of his actions.",
        "secret_info": "Believes true strength isn't about defeating monsters, but about remembering the people you are fighting to protect."
    },

    "flash": {
        "id": "flash",
        "name": "Flash Thompson",
        "role": "Dismissive Midtown High Jock",
        "alignment": "Unresponsive",
        "avatar": "🏈",
        "location": "Midtown High Bleachers",
        "world_pos": {"x": 320, "y": 1020},
        "initial_trust": 10,
        "relationship": "Unresponsive",
        "greeting": "Yeah? What do you want? I'm waiting on someone, so move along before you embarrass yourself.",
        "personality": (
            "Arrogant, dismissive, stubborn, protective of his tough-guy reputation. "
            "Refuses to talk to strangers or act friendly. Gives short, blunt brush-offs. "
            "Only drops his guard if Spider-Man is mentioned or specific danger near the gym is brought up."
        ),
        "goal": "Act tough, protect his reputation, and brush off anyone asking questions.",
        "secret_info": "Actually idolizes Spider-Man secretly, and saw creepy hooded guys in green masks stashing crates behind the gym bleachers last night."
    },

    "goblin": {
        "id": "goblin",
        "name": "Green Goblin",
        "role": "Chaotic Menace & Major Threat",
        "alignment": "Villain",
        "avatar": "👺",
        "location": "Clocktower Rooftop Overlook",
        "world_pos": {"x": 880, "y": 160},
        "initial_trust": 0,
        "relationship": "Hostile",
        "greeting": "Ah, the neighborhood's little web-spinner crawls into the light! Did you really think you could stop what's coming, hero?",
        "personality": (
            "Unhinged, psychotic, theatrical, razor-sharp intellect, mocking and sadistic. "
            "Believes the city is sheep waiting to be culled, and enjoys psychologically testing the Hero."
        ),
        "goal": "Unleash chaos on the city, prove morality is a weakness, and break the Hero's spirit.",
        "secret_info": "Planning a synchronized terror attack targeting the city power grid using stolen Oscorp neural gas and thermal glider strikes."
    },

    "doc_ock": {
        "id": "doc_ock",
        "name": "Doctor Octopus",
        "role": "Mastermind & Visionary Scientist",
        "alignment": "Villain",
        "avatar": "🐙",
        "location": "Oscorp Docks Warehouse",
        "world_pos": {"x": 1420, "y": 880},
        "initial_trust": 5,
        "relationship": "Hostile",
        "greeting": "You are intruding upon historic scientific advancement. Turn back now, insect, before my mechanical arms dissect your curiosity.",
        "personality": (
            "Arrogant genius, speaks with clinical precision and grandiose scientific vocabulary. "
            "Convinced his dangerous fusion experiments are destined to revolutionize civilization and that any collateral damage is justified."
        ),
        "goal": "Complete the self-sustaining fusion reactor, regardless of the destruction it threatens to bring upon the borough.",
        "secret_info": "The containment field on his magnetic generator is unstable and drawing massive surges from the borough's main substation."
    },

    "mysterio": {
        "id": "mysterio",
        "name": "Mysterio",
        "role": "Master of Illusion & Deception",
        "alignment": "Villain",
        "avatar": "🔮",
        "location": "Old Grand Theater Alley",
        "world_pos": {"x": 260, "y": 620},
        "initial_trust": 15,
        "relationship": "Suspicious",
        "greeting": "Welcome to the final act, web-slinger! But tell me... do your eyes deceive you, or is everything you see merely smoke and mirrors?",
        "personality": (
            "Dramatically theatrical, speaks in grandiose stage metaphors, manipulative, enigmatic. "
            "Creates confusion between reality and hallucination using holographic projectors and psychoactive smoke."
        ),
        "goal": "Distract the Hero with intricate sensory illusions while his accomplices loot high-tech components from nearby facilities.",
        "secret_info": "His holographic projectors are relaying telemetry directly to Oscorp's industrial relay."
    }
}

# Pre-packaged dismissive answers for Flash when unresponsive
FLASH_DISMISSALS = [
    "Not interested. Go find someone else to bother.",
    "I have nothing to say to you. Beat it.",
    "Leave me alone, man. I'm busy.",
    "I'm not talking to you. Walk away.",
    "Don't you have somewhere else to be? Scram.",
    "Are you still here? I don't talk to randos."
]

MAX_AGENT_TOOL_CALLS = 4

AGENT_TOOLS = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="search_case_evidence",
            description="Search known case evidence relevant to the player's latest message.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "query": types.Schema(
                        type="STRING",
                        description="The topic, person, or clue to search for.",
                    )
                },
                required=["query"],
            ),
        ),
        types.FunctionDeclaration(
            name="update_trust",
            description="Apply the NPC's trust change for the player's latest interaction.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "change": types.Schema(
                        type="INTEGER",
                        description="Trust change from -10 to +8.",
                        minimum=-10,
                        maximum=8,
                    ),
                    "reason": types.Schema(
                        type="STRING",
                        description="Brief explanation grounded in the player's message.",
                    ),
                },
                required=["change", "reason"],
            ),
        ),
    ]
)


def _relationship_for(npc_id, trust):
    npc = NPC_ROSTER.get(npc_id, NPC_ROSTER["ned"])
    if npc_id == "flash":
        return "Unresponsive" if trust < 30 else "Suspicious" if trust < 60 else "Friendly"

    if npc["alignment"] == "Villain":
        return "Hostile" if trust < 30 else "Suspicious" if trust < 65 else "Friendly"

    if trust < 25:
        return "Hostile"
    if trust < 50:
        return "Suspicious"
    return "Supportive" if trust >= 85 else "Friendly"


def _search_case_evidence(query, npc_id, story_state):
    query_terms = {term for term in re.findall(r"[a-z0-9]+", query.lower()) if len(term) > 2}
    evidence = []
    for source_id, source in NPC_ROSTER.items():
        text = " ".join(
            [source["name"], source["location"], source["goal"], source["secret_info"]]
        )
        source_terms = {term for term in re.findall(r"[a-z0-9]+", text.lower()) if len(term) > 2}
        overlap = len(query_terms & source_terms)
        if overlap:
            evidence.append(
                {
                    "source": source["name"],
                    "location": source["location"],
                    "lead": source["secret_info"],
                    "relevance": overlap,
                }
            )

    evidence.sort(key=lambda item: item["relevance"], reverse=True)
    if not evidence:
        source = NPC_ROSTER[npc_id]
        evidence = [{"source": source["name"], "lead": source["secret_info"]}]

    return {
        "matching_evidence": evidence[:3],
        "active_story_state": story_state or {},
    }


def _run_agent_tool(name, arguments, npc_id, story_state, trust_state):
    if name == "search_case_evidence":
        query = str(arguments.get("query", ""))[:200]
        return _search_case_evidence(query, npc_id, story_state)

    if name == "update_trust":
        if trust_state["updated"]:
            return {"error": "Trust has already been updated for this interaction."}

        requested_change = arguments.get("change", 0)
        try:
            change = max(-10, min(8, int(requested_change)))
        except (TypeError, ValueError):
            change = 0

        trust_state["trust"] = max(0, min(100, trust_state["trust"] + change))
        trust_state["change"] = trust_state["trust"] - trust_state["starting_trust"]
        trust_state["updated"] = True
        trust_state["reason"] = str(arguments.get("reason", ""))[:200]
        return {
            "new_trust": trust_state["trust"],
            "applied_change": trust_state["change"],
            "relationship": _relationship_for(npc_id, trust_state["trust"]),
        }

    return {"error": f"Unknown tool: {name}"}

# ==========================================
# 3. NPC RESPONSE GENERATOR
# ==========================================

def generate_npc_response(choice, memory, npc_id="ned", story_state=None, current_trust=None):
    npc = NPC_ROSTER.get(npc_id, NPC_ROSTER["ned"])
    
    if current_trust is None:
        current_trust = npc["initial_trust"]
    current_trust = max(0, min(100, int(current_trust)))

    # Flash Thompson special unresponsiveness handling
    if npc_id == "flash":
        choice_lower = choice.lower()
        triggers = ["spider", "goblin", "mask", "gym", "bleachers", "crate", "smoke", "danger"]
        triggered = any(t in choice_lower for t in triggers)
        
        if not triggered and current_trust < 30:
            dismissal = random.choice(FLASH_DISMISSALS)
            return {
                "npc_response": dismissal,
                "trust_change": 0,
                "new_trust": current_trust,
                "relationship": "Unresponsive",
                "suggested_choices": [
                    "Ask if he saw strange hooded figures near the gym bleachers",
                    "Ask what he knows about Spider-Man",
                    "Leave him alone and walk away"
                ]
            }

    # Format recent conversation memory
    formatted_memory = []
    for item in memory[-6:]:
        if isinstance(item, dict):
            speaker = item.get("speaker", "Unknown")
            msg = item.get("message", "")
            formatted_memory.append(f"{speaker}: {msg}")
        elif isinstance(item, str):
            formatted_memory.append(f"Player: {item}")

    memory_text = "\n".join(formatted_memory) if formatted_memory else "No prior conversation yet."
    story_summary = json.dumps(story_state) if story_state else "Investigating suspicious criminal activity in the neighborhood."

    # Build the agent's initial context.
    prompt = f"""
You are roleplaying as {npc['name']} ({npc['role']}) in an authentic Spider-Man inspired superhero action-adventure story game.

CHARACTER DOSSIER:
- Moral Alignment: {npc['alignment']}
- Current Location: {npc['location']}
- Persona & Speaking Style: {npc['personality']}
- Character Goal: {npc['goal']}
- Secret Knowledge: {npc['secret_info']}
- Current Trust with Hero (0 to 100): {current_trust}

CURRENT GAME CONTEXT:
- Active Story State: {story_summary}
- Conversation History with Hero:
{memory_text}

LATEST PLAYER STATEMENT / QUESTION:
"{choice}"

INSTRUCTIONS:
1. Stay 100% in character as {npc['name']}. Use authentic voice, rhythm, and tone.
2. If you are an Allied character (Ned, MJ, Aunt May): Be supportive, helpful, or emotionally grounding based on your persona.
3. If you are a Villain (Green Goblin, Doctor Octopus, Mysterio): Be menacing, mocking, arrogant, or deceptive. Never apologize or act like a friendly bot.
4. If you are Flash Thompson: Be reluctant, dismissive, or gruff, but if pressed on specific clues, drop a tiny defensive hint.
5. React specifically to what the player just said while keeping responses punchy: exactly 2 to 3 natural, cinematic sentences.
6. Use the search_case_evidence tool to find relevant leads, then use update_trust exactly once to evaluate this interaction. A neutral interaction may use a change of 0.
7. Use any additional tools only when their results would improve your response. Never invent tool results.
8. Provide 3 contextual quick-choice response options for what the Hero might say next.

OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this structure (no markdown fences, no extra text):
{{
  "npc_response": "2 to 3 in-character sentences here.",
  "trust_change": 0,
  "relationship": "Friendly | Supportive | Hostile | Suspicious | Unresponsive",
  "suggested_choices": [
    "Short response option 1",
    "Short response option 2",
    "Short response option 3"
  ]
}}
"""
    response_text = None
    final_trust = current_trust
    final_trust_change = 0

    for model_name in GEMINI_MODELS:
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
        trust_state = {
            "starting_trust": current_trust,
            "trust": current_trust,
            "change": 0,
            "updated": False,
        }
        tool_calls_made = 0
        model_response = None

        try:
            print(f"[Agent] Starting dialogue loop with {model_name} for {npc['name']}...")
            while True:
                if tool_calls_made == 0:
                    mode = "ANY"
                    allowed_functions = ["search_case_evidence"]
                elif not trust_state["updated"]:
                    mode = "ANY"
                    allowed_functions = ["update_trust"]
                elif tool_calls_made < MAX_AGENT_TOOL_CALLS:
                    mode = "AUTO"
                    allowed_functions = None
                else:
                    mode = "NONE"
                    allowed_functions = None

                function_calling = types.FunctionCallingConfig(
                    mode=mode,
                    allowed_function_names=allowed_functions,
                )
                result = client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        tools=[AGENT_TOOLS],
                        tool_config=types.ToolConfig(
                            function_calling_config=function_calling,
                        ),
                    ),
                )

                candidates = result.candidates or []
                candidate_content = candidates[0].content if candidates else None
                function_calls = [
                    part.function_call
                    for part in (candidate_content.parts or [])
                    if part.function_call and part.function_call.name
                ] if candidate_content else []

                if function_calls:
                    if tool_calls_made >= MAX_AGENT_TOOL_CALLS:
                        break
                    contents.append(candidate_content)
                    for function_call in function_calls:
                        if tool_calls_made >= MAX_AGENT_TOOL_CALLS:
                            break
                        tool_result = _run_agent_tool(
                            function_call.name,
                            function_call.args or {},
                            npc_id,
                            story_state,
                            trust_state,
                        )
                        print(f"[Agent] {npc['name']} used {function_call.name}.")
                        contents.append(
                            types.Content(
                                role="user",
                                parts=[
                                    types.Part.from_function_response(
                                        name=function_call.name,
                                        response=tool_result,
                                    )
                                ],
                            )
                        )
                        tool_calls_made += 1
                    continue

                model_response = (result.text or "").strip()
                break

            if model_response:
                response_text = model_response
                final_trust = trust_state["trust"]
                final_trust_change = trust_state["change"]
                break
        except Exception as e:
            print(f"[Gemini] Model {model_name} error: {repr(e)}")
            continue

    if response_text:
        # Clean potential markdown JSON fences
        cleaned = response_text
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        try:
            data = json.loads(cleaned)
            return {
                "npc_response": data.get("npc_response", f"{npc['name']} observes you closely."),
                "trust_change": final_trust_change,
                "new_trust": final_trust,
                "relationship": _relationship_for(npc_id, final_trust),
                "suggested_choices": data.get("suggested_choices", [
                    "Tell me what you know.",
                    "How can I help you?",
                    "I have to investigate further."
                ])
            }
        except Exception as json_err:
            print("[Gemini] JSON parse failed, returning raw response text:", repr(json_err))
            return {
                "npc_response": response_text,
                "trust_change": final_trust_change,
                "new_trust": final_trust,
                "relationship": _relationship_for(npc_id, final_trust),
                "suggested_choices": [
                    "Tell me more about what you've observed.",
                    "Be careful, things are getting dangerous.",
                    "I'll handle this."
                ]
            }

    # Fallback if all Gemini calls fail
    print(f"[Gemini] All models failed, returning character in-memory fallback for {npc['name']}")
    return {
        "npc_response": f"{npc['name']} stays on alert. 'We have to be careful—the signals across the city are unstable right now.'",
        "trust_change": 0,
        "new_trust": current_trust,
        "relationship": npc["relationship"],
        "suggested_choices": [
            "What's our next move?",
            "Stay safe, I'll be back.",
            "Tell me more about the district."
        ]
    }

