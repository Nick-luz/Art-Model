from typing import Any
from urllib.parse import urljoin

from .base_scraper import BaseScraper


class FashionScraper(BaseScraper):
    """Extract article cards from Vogue Brasil."""

    def extract(self) -> list[dict[str, Any]]:
        soup = self.fetch_soup()
        records: list[dict[str, Any]] = []

        for card in soup.select("div.bastian-feed-item"):
            title_link = card.select_one("h2.feed-post-link a")
            summary = card.select_one("p.feed-post-body-resumo")
            image = card.select_one("img")

            if title_link is None:
                continue

            records.append(
                {
                    "title": title_link.get_text(" ", strip=True),
                    "description": summary.get_text(" ", strip=True) if summary else "",
                    "image_url": self._image_url(image),
                    "source_url": urljoin(self.base_url + "/", title_link.get("href", "")),
                    "category": "Moda",
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