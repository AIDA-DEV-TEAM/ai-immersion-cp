from __future__ import annotations

from functools import lru_cache

from langchain_openai import ChatOpenAI

from app.core.config import get_settings


@lru_cache
def get_chat_model() -> ChatOpenAI:
    """Build the streaming chat model against the configured OpenAI-compatible endpoint.

    Uses `ChatOpenAI` pointed at `base_url` (not a provider-specific class) so the
    same code path serves NIM in dev and Gemini/OpenAI in prod via config alone.
    """
    settings = get_settings()
    return ChatOpenAI(
        base_url=settings.provider_base_url,
        model=settings.provider_model,
        api_key=settings.provider_api_key,
        streaming=True,
    )
