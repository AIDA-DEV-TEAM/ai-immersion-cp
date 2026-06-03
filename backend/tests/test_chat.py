from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.main import app
from app.services import chat_service, session_store

_REPLY_TOKENS = ["Hello", " there"]
_REPLY = "".join(_REPLY_TOKENS)


class _FakeChunk:
    def __init__(self, content: str) -> None:
        self.content = content


class _FakeModel:
    """Records the message list it receives on every call so tests can assert the
    full compounding thread was re-sent."""

    def __init__(self) -> None:
        self.calls: list[list[object]] = []

    async def astream(self, messages: list[object]):  # noqa: ANN201 - test double
        self.calls.append(list(messages))
        for token in _REPLY_TOKENS:
            yield _FakeChunk(token)


@pytest.fixture
def fake_model(monkeypatch: pytest.MonkeyPatch) -> _FakeModel:
    fake = _FakeModel()
    monkeypatch.setattr(chat_service, "get_chat_model", lambda: fake)
    session_store._sessions.clear()
    return fake


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def _tokens_from_sse(body: str) -> str:
    out: list[str] = []
    for line in body.splitlines():
        if not line.startswith("data: "):
            continue
        payload = json.loads(line[len("data: ") :])
        if "token" in payload:
            out.append(payload["token"])
    return "".join(out)


def test_create_session_returns_id_and_step(client: TestClient, fake_model: _FakeModel) -> None:
    response = client.post("/api/session")

    assert response.status_code == 201
    body = response.json()
    assert body["session_id"]
    assert body["step_index"] == 0


def test_chat_streams_assistant_reply(client: TestClient, fake_model: _FakeModel) -> None:
    session_id = client.post("/api/session").json()["session_id"]

    response = client.post("/api/chat", json={"session_id": session_id, "message": "turn one"})

    assert response.status_code == 200
    assert _tokens_from_sse(response.text) == _REPLY


def test_chat_missing_session_is_404(client: TestClient, fake_model: _FakeModel) -> None:
    response = client.post("/api/chat", json={"session_id": "nope", "message": "hi"})

    assert response.status_code == 404
    assert response.json() == {"detail": "Session not found", "code": "not_found"}


def test_thread_compounds_across_turns(client: TestClient, fake_model: _FakeModel) -> None:
    """The store must preserve turn 1 and re-send it (plus the system prompt) on
    turn 2 — the compounding thread, not just a single streamed response."""
    session_id = client.post("/api/session").json()["session_id"]

    client.post("/api/chat", json={"session_id": session_id, "message": "turn one"})
    client.post("/api/chat", json={"session_id": session_id, "message": "turn two"})

    assert len(fake_model.calls) == 2

    # Every call leads with the system prompt.
    for call in fake_model.calls:
        assert isinstance(call[0], SystemMessage)
        assert "AI Immersion facilitator" in call[0].content

    # The second call must carry turn 1 (user + assistant) ahead of turn 2's user
    # message — proof the thread compounded rather than resetting.
    second = fake_model.calls[1]
    conversation = second[1:]  # drop the system prompt
    assert isinstance(conversation[0], HumanMessage) and conversation[0].content == "turn one"
    assert isinstance(conversation[1], AIMessage) and conversation[1].content == _REPLY
    assert isinstance(conversation[2], HumanMessage) and conversation[2].content == "turn two"
