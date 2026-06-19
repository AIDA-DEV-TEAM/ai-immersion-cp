from __future__ import annotations

import pytest

from app.core import llm


@pytest.fixture(autouse=True)
def _clear_model_caches() -> None:
    # The getters are lru_cached; clear so each test rebuilds from its own config.
    llm.get_chat_model.cache_clear()
    llm.get_guardrail_model.cache_clear()


def test_factory_builds_nim_model_from_config(monkeypatch: pytest.MonkeyPatch) -> None:
    """The default (openai + NIM base_url) config flows through init_chat_model with
    base_url passed through — the OpenAI-compatible wrinkle the factory must handle."""
    captured: dict[str, object] = {}

    def _fake_init(**kwargs: object) -> str:
        captured.update(kwargs)
        return "built-model"

    monkeypatch.setattr(llm, "init_chat_model", _fake_init)

    model = llm.get_chat_model()

    assert model == "built-model"
    assert captured["model_provider"] == "openai"
    assert captured["base_url"] == "https://integrate.api.nvidia.com/v1"
    assert captured["streaming"] is True


def test_guardrail_model_is_non_streaming_with_its_own_model(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    captured: dict[str, object] = {}
    monkeypatch.setattr(llm, "init_chat_model", lambda **kwargs: captured.update(kwargs))

    llm.get_guardrail_model()

    assert captured["streaming"] is False
    assert captured["model"] == llm.get_settings().guardrail_model


def test_native_provider_omits_base_url(monkeypatch: pytest.MonkeyPatch) -> None:
    """A native provider (base_url left empty) must not pass base_url at all, so the
    client uses its own default endpoint."""
    settings = llm.get_settings()
    monkeypatch.setattr(settings, "provider", "anthropic")
    monkeypatch.setattr(settings, "provider_base_url", "")

    captured: dict[str, object] = {}
    monkeypatch.setattr(llm, "init_chat_model", lambda **kwargs: captured.update(kwargs))

    llm.get_chat_model()

    assert captured["model_provider"] == "anthropic"
    assert "base_url" not in captured


def test_unknown_provider_raises_clear_error(monkeypatch: pytest.MonkeyPatch) -> None:
    """A misconfigured provider must fail with a clear error naming the bad value —
    init_chat_model's own ValueError, no wrapping."""
    settings = llm.get_settings()
    monkeypatch.setattr(settings, "provider", "bogusprovider")
    monkeypatch.setattr(settings, "provider_base_url", "")

    with pytest.raises(ValueError, match="bogusprovider"):
        llm.get_chat_model()
