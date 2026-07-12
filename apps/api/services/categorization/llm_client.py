"""
Thin wrapper around the Anthropic API. Kept separate from prompts.py so
the model/version and JSON-parsing/error-handling logic can change
without touching prompt content.
"""
import json
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


def call_json(system_prompt: str, user_prompt: str, max_tokens: int = 1024) -> dict:
    """
    Calls the model expecting a single JSON object back.
    Raises ValueError if the response isn't valid JSON — callers should
    treat that as "needs manual review", never fall back to guessing.
    """
    client = get_client()
    response = client.messages.create(
        model=get_settings().anthropic_model,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    raw_text = "".join(block.text for block in response.content if block.type == "text")

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as exc:
        logger.error("LLM did not return valid JSON (first 500 chars): %s", raw_text[:500])
        raise ValueError("LLM response was not valid JSON") from exc
