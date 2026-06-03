from __future__ import annotations

from pydantic import BaseModel, Field


class SessionResponse(BaseModel):
    """Returned when a participant's session is provisioned."""

    session_id: str
    step_index: int


class ChatRequest(BaseModel):
    """One participant turn. The browser sends only the new message + session id;
    the backend owns and re-sends the full thread."""

    session_id: str
    message: str = Field(min_length=1)


class StepUpdateRequest(BaseModel):
    """Records which step the participant has advanced to (no auto-advance)."""

    session_id: str
    step_index: int = Field(ge=0, le=5)
