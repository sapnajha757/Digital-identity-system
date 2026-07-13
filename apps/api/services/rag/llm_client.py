import logging

from anthropic import Anthropic
import openai

from core.config import get_settings

logger = logging.getLogger(__name__)

_anthropic_client: Anthropic | None = None
_groq_client: openai.OpenAI | None = None


def get_anthropic_client() -> Anthropic:
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = Anthropic(api_key=get_settings().anthropic_api_key)
    return _anthropic_client


def get_groq_client() -> openai.OpenAI:
    global _groq_client
    if _groq_client is None:
        _groq_client = openai.OpenAI(
            base_url="https://api.groq.com/openai/v1",
            api_key=get_settings().anthropic_api_key
        )
    return _groq_client


def call_text(system_prompt: str, user_prompt: str, max_tokens: int = 600) -> str:
    api_key = get_settings().anthropic_api_key
    if api_key and api_key.startswith("gsk_"):
        client = get_groq_client()
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
        )
        return response.choices[0].message.content.strip()
    else:
        client = get_anthropic_client()
        response = client.messages.create(
            model=get_settings().anthropic_model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return "".join(block.text for block in response.content if block.type == "text").strip()

