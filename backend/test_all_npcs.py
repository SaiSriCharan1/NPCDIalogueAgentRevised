import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_all():
    # 1. Health check
    r = requests.get(f"{BASE_URL}/")
    print("Health:", r.json())
    assert r.status_code == 200

    # 2. NPCS list
    r = requests.get(f"{BASE_URL}/npcs")
    npcs = r.json()["npcs"]
    print(f"Loaded {len(npcs)} NPCs:")
    for npc in npcs:
        print(f" - [{npc['alignment']}] {npc['name']} ({npc['role']}) @ {npc['location']}")
    assert len(npcs) == 7

    # 3. Test Flash Thompson unresponsiveness
    r = requests.post(f"{BASE_URL}/dialogue", json={
        "npc_id": "flash",
        "choice": "Hey Flash, what are you doing here?"
    })
    flash_res = r.json()
    print("\nFlash response:")
    print(" ", flash_res["npc_response"])
    print(" Relationship:", flash_res["relationship"])
    assert flash_res["relationship"] == "Unresponsive"

    print("\nAll automated tests passed successfully!")

if __name__ == "__main__":
    test_all()
