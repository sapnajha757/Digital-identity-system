"""
Local filesystem storage integration. The uploads folder holds raw files only —
storage_path in Postgres is the single reference to where a file lives.
"""
import os
import pathlib

# Base directory for uploads is digital-identity-system/apps/api/uploads
BASE_DIR = pathlib.Path(__file__).parent.parent.parent.resolve()
UPLOAD_DIR = BASE_DIR / "uploads"

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def upload_file(file_bytes: bytes, storage_path: str, content_type: str) -> str:
    """Uploads bytes to the local uploads directory. Returns the storage_path used."""
    file_path = UPLOAD_DIR / storage_path
    # Ensure nested user directory is created
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    return storage_path


def download_file(storage_path: str) -> bytes:
    """Downloads (reads) bytes from the local uploads directory."""
    file_path = UPLOAD_DIR / storage_path
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {storage_path}")

    with open(file_path, "rb") as f:
        return f.read()


def delete_file(storage_path: str) -> None:
    """Deletes file from local storage if it exists."""
    file_path = UPLOAD_DIR / storage_path
    if file_path.exists():
        os.remove(file_path)


def file_exists(storage_path: str) -> bool:
    """Checks if a file exists in local storage."""
    file_path = UPLOAD_DIR / storage_path
    return file_path.exists()
