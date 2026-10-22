from __future__ import annotations

import logging
from typing import Any

import requests
from bs4 import BeautifulSoup


class BaseScraper:
    """Shared HTTP behavior. Add source-specific parsing in subclasses."""

    def __init__(self, base_url: str, timeout: int = 15) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "ArtFashionHub/0.1 (research project)"})
        self.logger = logging.getLogger(self.__class__.__name__)

    def fetch_soup(self, path: str = "") -> BeautifulSoup:
        response = self.session.get(f"{self.base_url}/{path.lstrip('/')}", timeout=self.timeout)
        response.raise_for_status()
        return BeautifulSoup(response.text, "html.parser")

    def extract(self) -> list[dict[str, Any]]:
        raise NotImplementedError