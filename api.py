import json
import os
import random
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from pydantic import BaseModel

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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionRequest(BaseModel):
    title: str
    category: str
    description: str = ""


def load_records() -> list[dict]:
    existing_files = [path for path in DATA_FILES if path.exists()]
    records: list[dict] = []
    for data_file in existing_files:
        records.extend(json.loads(data_file.read_text(encoding="utf-8")))
    return records


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/items", response_model=list[ArchiveItem])
def list_items() -> list[ArchiveItem]:
    records = load_records()
    if not records:
        raise HTTPException(status_code=404, detail="Execute o scraper antes de consultar os dados.")
    return [ArchiveItem(**record) for record in records]


@app.post("/api/connections")
def create_connections(payload: ConnectionRequest) -> dict:
    records = load_records()
    others = [r for r in records if r.get("title") != payload.title]

    # Separa Arte e Moda para garantir que o catálogo enviado tenha variedade real
    art_items = [r for r in others if not str(r.get("category", "")).lower().startswith("moda")]
    fashion_items = [r for r in others if str(r.get("category", "")).lower().startswith("moda")]

    sampled = random.sample(art_items, min(15, len(art_items))) + random.sample(
        fashion_items, min(15, len(fashion_items))
    )
    random.shuffle(sampled)

    catalog = "\n".join(
        f"- {r.get('title')} [{r.get('category')}]: {r.get('description', '')[:150]}"
        for r in sampled
    )

    prompt = (
        f"Matéria escolhida pelo visitante: '{payload.title}' [{payload.category}] - {payload.description}\n\n"
        "Escolha 2 matérias DISTINTAS da lista abaixo que tenham afinidade temática, visual ou histórica "
        "específica com esta matéria escolhida (evite escolhas genéricas; busque conexões reais de tema, época, "
        "cor ou movimento entre Arte e Moda). Retorne APENAS JSON neste formato:\n"
        '{"analysis": "Parágrafo explicando a conexão específica entre a obra escolhida e as duas selecionadas.", '
        '"related_titles": ["Titulo exato 1", "Titulo exato 2"]}\n\n'
        f"CATÁLOGO DISPONÍVEL:\n{catalog}"
    )

    try:
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.75,
            ),
        )
        return json.loads(response.text or "{}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))