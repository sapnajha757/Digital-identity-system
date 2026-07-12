"""
Module 5 orchestrator. Retrieval itself lives in services/rag/retrieval.py
(shared with /search) — this module only handles the generation step:
already-retrieved chunks in, a grounded natural-language answer out.
"""
import logging

from schemas.document import SearchResultItem
from services.rag.llm_client import call_text
from services.rag.prompts import SYSTEM_PROMPT, build_user_prompt

logger = logging.getLogger(__name__)


def generate_answer(query: str, results: list[SearchResultItem]) -> str:
    if not results:
        return "I couldn't find anything relevant in your uploaded documents for that question."

    chunks = [(r.original_filename, r.chunk_text) for r in results]

    try:
        return call_text(SYSTEM_PROMPT, build_user_prompt(query, chunks))
    except Exception:
        logger.exception("RAG answer generation failed")
        return (
            "I found some relevant documents but couldn't generate an answer just now. "
            "Here are the matches I found — take a look below."
        )
