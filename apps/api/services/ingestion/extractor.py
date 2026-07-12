"""
Extracts raw text from uploaded documents into a common shape, regardless
of source format, so the rest of the pipeline (categorization, embeddings)
never needs to know whether a document was a PDF, a photo, or a DOCX.

- PDF   -> PyMuPDF text layer; falls back to OCR per-page if the PDF is
           scanned (text layer is empty/near-empty)
- Image -> PaddleOCR
- DOCX  -> python-docx paragraph text
"""
import io
import logging
from dataclasses import dataclass

import fitz  # PyMuPDF
from docx import Document as DocxDocument

logger = logging.getLogger(__name__)

_ocr_engine = None  # lazy-loaded: PaddleOCR init is expensive, do it once


def _get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        from paddleocr import PaddleOCR

        _ocr_engine = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    return _ocr_engine


@dataclass
class ExtractionResult:
    text: str
    page_count: int | None
    confidence: float | None  # None when extraction didn't go through OCR


def _run_ocr(image_bytes: bytes) -> tuple[str, float | None]:
    engine = _get_ocr_engine()
    result = engine.ocr(image_bytes, cls=True)
    lines = result[0] if result and result[0] else []
    text = "\n".join(line[1][0] for line in lines)
    confidences = [line[1][1] for line in lines]
    avg_confidence = sum(confidences) / len(confidences) if confidences else None
    return text, avg_confidence


def extract_pdf(file_bytes: bytes) -> ExtractionResult:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages_text = [page.get_text() for page in doc]
    full_text = "\n\n".join(pages_text).strip()

    # A near-empty text layer usually means the PDF is scanned images,
    # not real text — fall back to OCR page-by-page in that case.
    if len(full_text) < 20:
        logger.info("PDF text layer near-empty, falling back to OCR")
        all_text: list[str] = []
        confidences: list[float] = []
        for page in doc:
            pixmap = page.get_pixmap(dpi=200)
            page_text, confidence = _run_ocr(pixmap.tobytes("png"))
            all_text.append(page_text)
            if confidence is not None:
                confidences.append(confidence)
        avg_confidence = sum(confidences) / len(confidences) if confidences else None
        return ExtractionResult(
            text="\n\n".join(all_text).strip(), page_count=doc.page_count, confidence=avg_confidence
        )

    return ExtractionResult(text=full_text, page_count=doc.page_count, confidence=1.0)


def extract_image(file_bytes: bytes) -> ExtractionResult:
    text, confidence = _run_ocr(file_bytes)
    return ExtractionResult(text=text, page_count=1, confidence=confidence)


def extract_docx(file_bytes: bytes) -> ExtractionResult:
    doc = DocxDocument(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return ExtractionResult(text="\n".join(paragraphs), page_count=None, confidence=1.0)


def extract(file_type: str, file_bytes: bytes) -> ExtractionResult:
    if file_type == "pdf":
        return extract_pdf(file_bytes)
    if file_type == "image":
        return extract_image(file_bytes)
    if file_type == "docx":
        return extract_docx(file_bytes)
    raise ValueError(f"Unsupported file_type for extraction: {file_type}")
