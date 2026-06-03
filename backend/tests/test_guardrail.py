from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.guardrail import GuardrailVerdict
from app.services import chat_service, guardrail_service, session_store

_REPLY_TOKENS = ["All", " good"]
_REPLY = "".join(_REPLY_TOKENS)


class _FakeChunk:
    def __init__(self, content: str) -> None:
        self.content = content


class _FakeModel:
    def __init__(self) -> None:
        self.called = False

    async def astream(self, messages: list[object]):  # noqa: ANN201 - test double
        self.called = True
        for token in _REPLY_TOKENS:
            yield _FakeChunk(token)


@pytest.fixture
def client() -> TestClient:
    session_store._sessions.clear()
    return TestClient(app)


def _allow(monkeypatch: pytest.MonkeyPatch) -> None:
    async def _classify(_message: str, _step: str) -> GuardrailVerdict:
        return GuardrailVerdict(allow=True, reason="in-process")

    monkeypatch.setattr(guardrail_service, "classify", _classify)


def _block(monkeypatch: pytest.MonkeyPatch) -> None:
    async def _classify(_message: str, _step: str) -> GuardrailVerdict:
        return GuardrailVerdict(allow=False, reason="off-process")

    monkeypatch.setattr(guardrail_service, "classify", _classify)


def _frames(body: str) -> list[dict]:
    out: list[dict] = []
    for line in body.splitlines():
        if line.startswith("data: "):
            out.append(json.loads(line[len("data: ") :]))
    return out


def test_allow_verdict_streams_facilitator_reply(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    _allow(monkeypatch)
    fake = _FakeModel()
    monkeypatch.setattr(chat_service, "get_chat_model", lambda: fake)
    session_id = client.post("/api/session").json()["session_id"]

    response = client.post("/api/chat", json={"session_id": session_id, "message": "our challenge"})

    assert response.status_code == 200
    tokens = "".join(f["token"] for f in _frames(response.text) if "token" in f)
    assert tokens == _REPLY
    assert fake.called is True


def test_block_verdict_short_circuits_main_model(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    _block(monkeypatch)
    # If the main model is reached on a block, this fake flips called -> assertion fails.
    fake = _FakeModel()
    monkeypatch.setattr(chat_service, "get_chat_model", lambda: fake)
    session_id = client.post("/api/session").json()["session_id"]

    response = client.post("/api/chat", json={"session_id": session_id, "message": "capital of France?"})

    assert response.status_code == 200
    frames = _frames(response.text)
    blocked = [f for f in frames if f.get("blocked")]
    assert len(blocked) == 1
    assert "Frame" in blocked[0]["message"]  # step 0 redirect names the current step
    # Main model never called, and the off-process turn is NOT written to the thread.
    assert fake.called is False
    assert session_store.get_session(session_id).messages == []


def test_block_redirect_follows_current_step(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    _block(monkeypatch)
    session_id = client.post("/api/session").json()["session_id"]
    client.post("/api/step", json={"session_id": session_id, "step_index": 3})  # Ideate

    response = client.post("/api/chat", json={"session_id": session_id, "message": "translate this"})

    blocked = [f for f in _frames(response.text) if f.get("blocked")][0]
    assert "Ideate" in blocked["message"]


def test_redirect_text_names_each_step() -> None:
    assert "Frame" in guardrail_service.redirect_text(0)
    assert "Build" in guardrail_service.redirect_text(5)


async def test_classify_fails_open_on_model_error(monkeypatch: pytest.MonkeyPatch) -> None:
    def _boom() -> object:
        raise RuntimeError("provider down")

    monkeypatch.setattr(guardrail_service, "get_guardrail_model", _boom)

    verdict = await guardrail_service.classify("anything", "Frame")

    assert verdict.allow is True  # infra failure must never block a genuine participant
