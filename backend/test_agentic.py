import os
import subprocess
import sys
import time
import unittest
from pathlib import Path

import requests

BASE_URL = "http://127.0.0.1:8000"
BACKEND_DIR = Path(__file__).resolve().parent


class LiveAgenticDialogueIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not os.getenv("GEMINI_API_KEY"):
            raise unittest.SkipTest(
                "GEMINI_API_KEY is required for live agentic AI integration tests."
            )

        try:
            requests.get(f"{BASE_URL}/", timeout=5)
            cls.server_proc = None
            return
        except requests.RequestException:
            pass

        cls.server_proc = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=str(BACKEND_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )

        deadline = time.time() + 30
        while time.time() < deadline:
            try:
                response = requests.get(f"{BASE_URL}/", timeout=2)
                if response.status_code == 200:
                    return
            except requests.RequestException:
                time.sleep(1)

        raise RuntimeError("Live agent backend did not start correctly.")

    @classmethod
    def tearDownClass(cls):
        if getattr(cls, "server_proc", None) is not None:
            cls.server_proc.terminate()
            try:
                cls.server_proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                cls.server_proc.kill()

    def test_agentic_ned_response_is_live_and_structured(self):
        response = requests.post(
            f"{BASE_URL}/dialogue",
            json={
                "choice": "Can you help investigate a strange signal near the docks?",
                "memory": [],
                "npc_id": "ned",
                "story_state": {"location": "Queens"},
                "current_trust": 75,
            },
            timeout=60,
        )

        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertIn("npc_response", body)
        self.assertTrue(len(body["npc_response"]) > 0)
        self.assertIn(body["relationship"], {"Friendly", "Supportive", "Hostile", "Suspicious", "Unresponsive"})
        self.assertEqual(len(body["suggested_choices"]), 3)

    def test_agentic_flash_guardrail_remains_in_character(self):
        response = requests.post(
            f"{BASE_URL}/dialogue",
            json={
                "choice": "Hey Flash, what are you doing here?",
                "memory": [],
                "npc_id": "flash",
                "current_trust": 10,
            },
            timeout=60,
        )

        self.assertEqual(response.status_code, 200, response.text)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["relationship"], "Unresponsive")
        self.assertTrue(len(body["npc_response"]) > 0)


if __name__ == "__main__":
    unittest.main()