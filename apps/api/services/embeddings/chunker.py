"""
Splits extracted text into overlapping chunks for embedding. Chunking by
words (not characters) keeps chunks semantically coherent without needing
a tokenizer here — good enough for the embedding model's context window.
"""

CHUNK_SIZE_WORDS = 200
CHUNK_OVERLAP_WORDS = 40


def chunk_text(text: str) -> list[str]:
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = start + CHUNK_SIZE_WORDS
        chunks.append(" ".join(words[start:end]))
        if end >= len(words):
            break
        start = end - CHUNK_OVERLAP_WORDS  # overlap keeps context across chunk boundaries

    return chunks
