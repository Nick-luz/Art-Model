from typing import Any
from urllib.parse import urljoin

from .base_scraper import BaseScraper


class ArtScraper(BaseScraper):
    """Extract article cards from DailyArt Magazine."""

    def extract(self) -> list[dict[str, Any]]:
        soup = self.fetch_soup()
        records: list[dict[str, Any]] = []

        for card in soup.select(".latest-posts .single-post"):
            title_link = card.select_one(".post-content h4 a")
            summary = card.select_one("p.post-excerpt")
            image = card.select_one(".post-image img")

            if title_link is None:
                continue

            image_url = self._image_url(image)
            records.append(
                {
                    "title": title_link.get_text(" ", strip=True),
                    "description": summary.get_text(" ", strip=True) if summary else "",
                    "image_url": image_url,
                    "source_url": urljoin(self.base_url + "/", title_link.get("href", "")),
                    "category": "Arte",
                    "source_name": "DailyArt Magazine",
                }
            )

        return records

    def _image_url(self, image: Any) -> str:
        if image is None:
            return ""

        for attribute in ("src", "data-src", "data-lazy-src"):
            value = image.get(attribute)
            if value:
                return urljoin(self.base_url + "/", value)

        srcset = image.get("srcset", "")
        if srcset:
            return urljoin(self.base_url + "/", srcset.split(",")[0].strip().split(" ")[0])

        return ""