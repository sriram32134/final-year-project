"""
Groq LLM Provider for AITrip.
Implements real LLM reasoning for LangGraph multi-agent system, itinerary synthesis,
conflict detection, and dynamic replanning using Groq Cloud fast inference.
"""

import os
import httpx
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()

# Supported models verified on user's Groq Cloud account
PRIMARY_MODEL = "qwen/qwen3.8-27b"
FALLBACK_MODEL = "openai/gpt-oss-120b"

class GroqLLMProvider:
    @classmethod
    async def chat_completion(
        cls,
        messages: List[Dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 1500,
    ) -> Optional[str]:
        if not GROQ_API_KEY:
            return None

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        for model in [PRIMARY_MODEL, FALLBACK_MODEL]:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers=headers,
                        json=payload,
                    )
                    if resp.status_code == 200:
                        content = resp.json()["choices"][0]["message"]["content"]
                        return content
                    else:
                        logger.warning(f"Groq model {model} returned {resp.status_code}: {resp.text[:120]}")
            except Exception as e:
                logger.warning(f"Groq request error on model {model}: {e}")

        return None
