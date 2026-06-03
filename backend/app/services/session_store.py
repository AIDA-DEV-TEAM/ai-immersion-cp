from __future__ import annotations

import uuid
from dataclasses import dataclass, field

from langchain_core.messages import BaseMessage


@dataclass
class Session:
    """One participant's compounding thread plus the step they are on.

    `messages` is the full conversation thread (excluding the system prompt, which
    is prepended fresh on every model call). It is the state — it must never be
    truncated, or the templates' back-references (e.g. "the root cause we
    identified") break.
    """

    id: str
    messages: list[BaseMessage] = field(default_factory=list)
    step_index: int = 0


# SINGLE-PROCESS ONLY. This module-level dict lives for the lifetime of one
# uvicorn worker. It is NOT multi-worker safe: a second worker would not see
# sessions created by the first. Phase 1 must run single-worker; `--reload` wipes
# all sessions on restart (expected). A shared/durable session backing is
# explicitly out of scope for Phase 1.
_sessions: dict[str, Session] = {}


def create_session() -> Session:
    session = Session(id=str(uuid.uuid4()))
    _sessions[session.id] = session
    return session


def get_session(session_id: str) -> Session | None:
    return _sessions.get(session_id)


def append_message(session_id: str, message: BaseMessage) -> None:
    _sessions[session_id].messages.append(message)


def set_step(session_id: str, step_index: int) -> None:
    _sessions[session_id].step_index = step_index
