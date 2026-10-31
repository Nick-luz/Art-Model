from datetime import datetime

from pydantic import BaseModel, HttpUrl


class ArchiveItem(BaseModel):
    title: str
    category: str
    description: str = ""
    image_url: HttpUrl | None = None
    source_url: HttpUrl | None = None
    source_name: str = ""
    collected_at: datetime | None = None