from typing import Any
from urllib.parse import urljoin

from .base_scraper import BaseScraper


class GoogleArtsScraper(BaseScraper):
    """Extract editorial cards from Google Arts & Culture homepage."""

    def extract(self) -> list[dict[str, Any]]:
        soup = self.fetch_soup()
        records: list[dict[str, Any]] = []

        for title in soup.select("h3"):
            card_link = title.find_parent("a", href=True)
            card = title.find_parent("a")
            image = card.select_one("[data-bgsrc]") if card else None
            if card_link is None or image is None:
                continue

            summary = card.select_one("h4, .hwdZXd")
            image_url = image.get("data-bgsrc", "")
            if image_url.startswith("//"):
                image_url = f"https:{image_url}"
            if image_url.startswith("https://lh3.googleusercontent.com/") and "=" not in image_url.rsplit("/", 1)[-1]:
                image_url = f"{image_url}=w800"

            records.append(
                {
                    "title": title.get_text(" ", strip=True),
                    "description": summary.get_text(" ", strip=True) if summary else "",
                    "image_url": image_url,
                    "source_url": urljoin(self.base_url + "/", card_link["href"]),
                    "category": "Arte",
                    "source_name": "Google Arts & Culture",
                }
            )

        return records