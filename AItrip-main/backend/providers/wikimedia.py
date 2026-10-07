"""
Wikimedia Commons & Wikipedia Runtime Image Provider for AITrip.
Implements dynamic, zero-key, high-resolution location photo discovery with strict
relevance validation. Ensures different authentic images for different places without static image DBs.
"""

import httpx
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

USER_AGENT = "AITrip-Agentic-App/1.0 (contact@aitrip.local; educational project)"

class WikimediaImageProvider:
    @classmethod
    async def get_location_image(
        cls,
        name: str,
        country: Optional[str] = None,
        region: Optional[str] = None,
        place_type: Optional[str] = None,
    ) -> Optional[str]:
        if not name or len(name.strip()) < 2:
            return None

        clean_name = name.strip()
        # Build contextual query
        context_parts = [clean_name]
        if region and region.lower() not in clean_name.lower():
            context_parts.append(region)
        elif country and country.lower() not in ["global", "world"] and country.lower() not in clean_name.lower():
            context_parts.append(country)

        query = " ".join(context_parts)

        try:
            url = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "format": "json",
                "generator": "search",
                "gsrsearch": query,
                "gsrlimit": 3,
                "prop": "pageimages|extracts",
                "piprop": "original|thumbnail",
                "pithumbsize": 1200,
                "exintro": 1,
                "explaintext": 1,
            }
            headers = {"User-Agent": USER_AGENT}

            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    pages = data.get("query", {}).get("pages", {})

                    for page_id, page in pages.items():
                        title = page.get("title", "")
                        extract = page.get("extract", "")

                        # Relevance validation: Title or extract must contain the core location name
                        primary_term = clean_name.split()[0].lower()
                        if primary_term not in title.lower() and primary_term not in extract.lower():
                            continue

                        # Check for valid image
                        orig_url = page.get("original", {}).get("source")
                        thumb_url = page.get("thumbnail", {}).get("source")
                        image_url = orig_url or thumb_url

                        if image_url and (image_url.startswith("http://") or image_url.startswith("https://")):
                            # Exclude generic icons, flags, and logos
                            lower_img = image_url.lower()
                            if any(bad in lower_img for bad in ["flag", "logo", "icon", "stub", "symbol", "map", "coat_of_arms"]):
                                continue
                            return image_url
        except Exception as e:
            logger.warning(f"Wikimedia image resolution error for '{query}': {e}")

        return None
