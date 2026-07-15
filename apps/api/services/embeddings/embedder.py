"""
Generates embeddings with BAAI/bge-large-en-v1.5 (1024-dim — matches the
Qdrant collection config in db/qdrant.py). The model is loaded once and
reused; reloading per-request would be far too slow for a live demo.

BGE models expect an instruction prefix on the *query* side only for
retrieval tasks — passages are embedded as-is.
"""

MODEL_NAME = "BAAI/bge-large-en-v1.5"
QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: "

_model = None

def _get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer(MODEL_NAME)
    return _model

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embeds document chunks (passages) for storage in Qdrant."""
    model = _get_model()
    vectors = model.encode(texts, normalize_embeddings=True)
    return vectors.tolist()


def embed_query(query: str) -> list[float]:
    """Embeds a user's search query — uses the retrieval instruction prefix."""
    model = _get_model()
    vector = model.encode([QUERY_INSTRUCTION + query], normalize_embeddings=True)
    return vector[0].tolist()
