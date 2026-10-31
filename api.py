import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database.models import ArchiveItem


load_dotenv()
DATA_FILES = [
    Path(__file__).parent / os.getenv("ART_OUTPUT_FILE", "data/raw/dailyart_art.json"),
    Path(__file__).parent / os.getenv("ART_NEWSPAPER_OUTPUT_FILE", "data/raw/art_newspaper.json"),
    Path(__file__).parent / os.getenv("GOOGLE_ARTS_OUTPUT_FILE", "data/raw/google_arts.json"),
    Path(__file__).parent / os.getenv("FASHION_OUTPUT_FILE", "data/raw/vogue_moda.json"),
]

app = FastAPI(title="Ateliê aberto API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/items", response_model=list[ArchiveItem])
def list_items() -> list[ArchiveItem]:
    existing_files = [path for path in DATA_FILES if path.exists()]
    if not existing_files:
        raise HTTPException(status_code=404, detail="Execute o scraper antes de consultar os dados.")

    records: list[dict] = []
    for data_file in existing_files:
        records.extend(json.loads(data_file.read_text(encoding="utf-8")))
    return [ArchiveItem(**record) for record in records]