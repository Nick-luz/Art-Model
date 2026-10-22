import json
import os
from pathlib import Path

from dotenv import load_dotenv

from scrapers.art_scraper import ArtScraper
from scrapers.fashion_scraper import FashionScraper
from utils.logger import configure_logging


def main() -> None:
    load_dotenv()
    configure_logging()
    timeout = int(os.getenv("REQUEST_TIMEOUT", "15"))
    sources = (
        ("arte", ArtScraper, os.getenv("ART_SOURCE_URL", "https://www.dailyartmagazine.com/"), os.getenv("ART_OUTPUT_FILE", "data/raw/dailyart_art.json")),
        ("moda", FashionScraper, os.getenv("FASHION_SOURCE_URL", "https://vogue.globo.com/moda/"), os.getenv("FASHION_OUTPUT_FILE", "data/raw/vogue_moda.json")),
    )

    for name, scraper_class, source_url, output_file in sources:
        records = scraper_class(source_url, timeout=timeout).extract()
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{len(records)} matérias de {name} salvas em {output_path}")


if __name__ == "__main__":
    main()