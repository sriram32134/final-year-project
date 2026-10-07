"""
Frankfurter Currency Provider for AITrip.
Provides real-time foreign exchange conversions between INR, USD, EUR, GBP, JPY
with zero API key required.
"""

import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class FrankfurterCurrencyProvider:
    _CACHE: Dict[str, Any] = {}

    @classmethod
    async def get_rates(cls, base: str = "USD") -> Dict[str, float]:
        if base in cls._CACHE:
            return cls._CACHE[base]

        default_rates = {
            "USD": 1.0,
            "INR": 86.5,
            "EUR": 0.92,
            "GBP": 0.78,
            "JPY": 152.0,
        }

        try:
            url = f"https://api.frankfurter.dev/v1/latest?from={base}&to=INR,EUR,GBP,JPY,USD"
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    rates = resp.json().get("rates", {})
                    rates[base] = 1.0
                    cls._CACHE[base] = rates
                    return rates
        except Exception as e:
            logger.warning(f"Frankfurter currency rates error: {e}")

        return default_rates

    @classmethod
    async def convert(cls, amount: float, from_curr: str, to_curr: str) -> float:
        if from_curr == to_curr:
            return amount
        rates = await cls.get_rates(from_curr)
        rate = rates.get(to_curr, 1.0)
        return round(amount * rate, 2)
