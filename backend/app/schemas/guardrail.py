from __future__ import annotations

from pydantic import BaseModel, Field


class GuardrailVerdict(BaseModel):
    """Structured verdict from the input pre-check classifier."""

    allow: bool = Field(description="True if the turn belongs to the six-step flow; bias toward true.")
    reason: str = Field(description="Short one-clause justification for the verdict.")
