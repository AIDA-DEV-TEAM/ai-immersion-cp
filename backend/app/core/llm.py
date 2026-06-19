from __future__ import annotations

from functools import lru_cache

from langchain.chat_models import init_chat_model
from langchain_core.language_models.chat_models import BaseChatModel

from app.core.config import get_settings


def _build_model(model: str, *, streaming: bool) -> BaseChatModel:
    """Build a LangChain chat model from config — the one place that knows providers.

    Routes everything through `init_chat_model`, which selects the right LangChain
    integration class from `settings.provider` and lazily imports its package. This
    is the only module allowed to know about providers; nothing else imports a
    provider-specific class or the raw openai SDK.

    Two shapes, distinguished purely by config:
      - OpenAI-compatible (dev = NVIDIA NIM): provider="openai" + a non-empty
        base_url, passed straight through to `ChatOpenAI` (unchanged from before).
      - Native APIs (anthropic, google_genai, bedrock, ...): provider set, base_url
        left empty, so the client uses its own default endpoint.

    An unknown/misconfigured provider raises a clear `ValueError` from
    `init_chat_model` that lists the supported providers — no wrapping needed.
    """
    settings = get_settings()
    kwargs: dict[str, object] = {
        "model": model,
        "model_provider": settings.provider,
        "streaming": streaming,
    }
    # init_chat_model forwards api_key/base_url verbatim to the integration class.
    # ChatOpenAI (NIM) and ChatAnthropic both accept `api_key`; a provider whose key
    # kwarg is named differently would need its own env var, but NIM — the only live
    # path today — works through this passthrough.
    if settings.provider_api_key:
        kwargs["api_key"] = settings.provider_api_key
    # base_url set -> OpenAI-compatible passthrough (NIM); empty -> native default.
    if settings.provider_base_url:
        kwargs["base_url"] = settings.provider_base_url
    return init_chat_model(**kwargs)


@lru_cache
def get_chat_model() -> BaseChatModel:
    """Build the streaming facilitator model (provider + model from config)."""
    return _build_model(get_settings().provider_model, streaming=True)


@lru_cache
def get_guardrail_model() -> BaseChatModel:
    """Build the non-streaming guardrail pre-check model.

    Same factory as the facilitator, differing only in its model id, so prod can run
    the cheap classifier on a faster/cheaper model. The caller wraps it with
    `.with_structured_output(GuardrailVerdict)`.
    """
    return _build_model(get_settings().guardrail_model, streaming=False)


@lru_cache
def get_suggestions_model() -> BaseChatModel:
    """Build the non-streaming next-action suggestions model.

    Same factory as the guardrail — a cheap, non-streaming call run after a step
    finishes. The caller wraps it with `.with_structured_output(SuggestionList)`.
    """
    return _build_model(get_settings().suggestions_model, streaming=False)
