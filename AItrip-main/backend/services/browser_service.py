import logging
from typing import Optional
from playwright.async_api import async_playwright, Playwright, Browser, BrowserContext, Page

logger = logging.getLogger("browser_service")

class BrowserService:
    """
    Playwright Chromium browser service wrapper for autonomous agent web automation.
    Manages Playwright lifecycle, context creation, page creation, and safe resource teardown.
    """

    def __init__(self, headless: bool = True, slow_mo: int = 0):
        self.headless = headless
        self.slow_mo = slow_mo
        self._playwright: Optional[Playwright] = None
        self._browser: Optional[Browser] = None

    async def _ensure_browser(self) -> None:
        """Starts Playwright and launches Chromium instance lazily if not already running."""
        if self._playwright is None:
            self._playwright = await async_playwright().start()
        if self._browser is None:
            self._browser = await self._playwright.chromium.launch(
                headless=self.headless,
                slow_mo=self.slow_mo
            )

    async def create_context(self, **kwargs) -> BrowserContext:
        """Creates and returns a new isolated BrowserContext."""
        await self._ensure_browser()
        return await self._browser.new_context(**kwargs)

    async def create_page(self, context: Optional[BrowserContext] = None, **kwargs) -> Page:
        """Creates and returns a new Page within the provided or a new BrowserContext."""
        await self._ensure_browser()
        if context is not None:
            return await context.new_page(**kwargs)
        ctx = await self.create_context()
        return await ctx.new_page(**kwargs)

    async def close_page_safely(self, page: Optional[Page]) -> None:
        """Safely closes a Playwright Page instance without raising unhandled exceptions."""
        if page:
            try:
                await page.close()
            except Exception as e:
                logger.debug(f"Error closing page safely: {e}")

    async def close_context_safely(self, context: Optional[BrowserContext]) -> None:
        """Safely closes a Playwright BrowserContext instance without raising unhandled exceptions."""
        if context:
            try:
                await context.close()
            except Exception as e:
                logger.debug(f"Error closing context safely: {e}")

    async def close(self) -> None:
        """Closes browser and stops Playwright instance cleanly."""
        if self._browser:
            try:
                await self._browser.close()
            except Exception as e:
                logger.debug(f"Error closing browser: {e}")
            self._browser = None

        if self._playwright:
            try:
                await self._playwright.stop()
            except Exception as e:
                logger.debug(f"Error stopping playwright: {e}")
            self._playwright = None
