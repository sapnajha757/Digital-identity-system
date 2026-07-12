"""
Thin wrapper around the Anthropic API for grounded chat answers. Mirrors
services/categorization/llm_client.py's call_json, but returns plain text
since a chat answer doesn't need a JSON envelope.
"""
import logging

from anthropic import Anthropic

from core.config import get_settings

logger = logging.getLogger(__name__)

_client: Anthropic | None = None


def get_client() -> Anthropic:
    global _client
    if _client is None:
        _client = Anthropic(api_key=get_settings().anthropic_api_key)
    return _client


def call_text(system_prompt: str, user_prompt: str, max_tokens: int = 600) -> str:
    client = get_client()
    response = client.messages.create(
        model=get_settings().anthropic_model,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return "".join(block.text for block in response.content if block.type == "text").strip()
