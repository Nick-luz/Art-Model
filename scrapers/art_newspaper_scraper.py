from typing import Any
from urllib.parse import urljoin

from .base_scraper import BaseScraper


class ArtNewspaperScraper(BaseScraper):
    """Extract latest article cards from The Art Newspaper."""

    def extract(self) -> list[dict[str, Any]]:
        soup = self.fetch_soup()
        records: list[dict[str, Any]] = []

        for title in soup.select("h4"):
            title_link = title.find_parent("a", href=True)
            card = title.parent.parent if title.parent and title.parent.parent else None
            if title_link is None or card is None or card.select_one("img") is None:
                continue

            summary = card.select_one("p")
            records.append(
                {
                    "title": title.get_text(" ", strip=True),
                    "description": summary.get_text(" ", strip=True) if summary else "",
                    "image_url": self._image_url(card.select_one("img")),
                    "source_url": urljoin(self.base_url + "/", title_link["href"]),
                    "category": "Arte",
                    "source_name": "The Art Newspaper",
                }
            )

        return records

    def _image_url(self, image: Any) -> str:
        for attribute in ("src", "data-src", "data-lazy-src"):
            value = image.get(attribute) if image else None
            if value:
                return urljoin(self.base_url + "/", value)
        srcset = image.get("srcset", "") if image else ""
        return srcset.split(",")[0].strip().split(" ")[0] if srcset else ""