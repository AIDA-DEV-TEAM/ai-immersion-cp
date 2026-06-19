from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.suggestions import SuggestionList
from app.services import session_store, suggestions_service


class _FakeStructured:
    """Stands in for model.with_structured_output(SuggestionList)."""

    def __init__(self, result: object) -> None:
        self._result = result

    async def ainvoke(self, _messages: list[object]) -> object:
        return self._result


class _FakeModel:
    def __init__(self, result: object) -> None:
        self._result = result

    def with_structured_output(self, _schema: object) -> _FakeStructured:
        return _FakeStructured(self._result)


@pytest.fixture
def client() -> TestClient:
    session_store._sessions.clear()
    return TestClient(app)


async def test_suggest_returns_model_suggestions(monkeypatch: pytest.MonkeyPatch) -> None:
    result = SuggestionList(suggestions=["Sharpen the metric.", "Add the night-shift persona."])
    monkeypatch.setattr(suggestions_service, "get_suggestions_model", lambda: _FakeModel(result))

    out = await suggestions_service.suggest("Frame", "Restated challenge.")

    assert out.suggestions == ["Sharpen the metric.", "Add the night-shift persona."]


async def test_suggest_fails_open_to_nothing_on_model_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def _boom() -> object:
        raise RuntimeError("provider down")

    monkeypatch.setattr(suggestions_service, "get_suggestions_model", _boom)

    out = await suggestions_service.suggest("Frame", "Restated challenge.")

    assert out.suggestions == []  # infra failure renders no buttons, never breaks the step


async def test_suggest_returns_nothing_on_unexpected_type(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        suggestions_service, "get_suggestions_model", lambda: _FakeModel("not a SuggestionList")
    )

    out = await suggestions_service.suggest("Frame", "Restated challenge.")

    assert out.suggestions == []


async def test_suggest_caps_to_two_and_drops_blanks(monkeypatch: pytest.MonkeyPatch) -> None:
    result = SuggestionList.model_construct(suggestions=["one", "  ", "two", "three"])
    monkeypatch.setattr(suggestions_service, "get_suggestions_model", lambda: _FakeModel(result))

    out = await suggestions_service.suggest("Frame", "Restated challenge.")

    assert out.suggestions == ["one", "two"]


def test_suggestions_endpoint_returns_suggestions(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def _suggest(_step: str, _output: str) -> SuggestionList:
        return SuggestionList(suggestions=["Sharpen the metric."])

    monkeypatch.setattr(suggestions_service, "suggest", _suggest)
    session_id = client.post("/api/session").json()["session_id"]

    response = client.post(
        "/api/suggestions",
        json={"session_id": session_id, "step_index": 0, "assistant_message": "Restated."},
    )

    assert response.status_code == 200
    assert response.json() == {"suggestions": ["Sharpen the metric."]}


def test_suggestions_endpoint_unknown_session_returns_404(client: TestClient) -> None:
    response = client.post(
        "/api/suggestions",
        json={"session_id": "nope", "step_index": 0, "assistant_message": "Restated."},
    )

    assert response.status_code == 404
