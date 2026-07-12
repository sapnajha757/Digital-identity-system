"""
Supabase Storage integration. The bucket holds raw files only —
storage_path in Postgres is the single reference to where a file lives,
so there's never a second copy of file location tracked anywhere else.
"""
from supabase import Client, create_client

from core.config import get_settings

settings = get_settings()

_client: Client | None = None


def get_supabase_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


def upload_file(file_bytes: bytes, storage_path: str, content_type: str) -> str:
    """Uploads bytes to the configured bucket. Returns the storage_path used."""
    client = get_supabase_client()
    client.storage.from_(settings.supabase_storage_bucket).upload(
        path=storage_path,
        file=file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return storage_path


def download_file(storage_path: str) -> bytes:
    client = get_supabase_client()
    return client.storage.from_(settings.supabase_storage_bucket).download(storage_path)
