from __future__ import annotations

from pydantic import BaseModel, Field


class SuggestionList(BaseModel):
    """Structured 1-2 next-action suggestions for a completed step's output."""

    suggestions: list[str] = Field(
        default_factory=list,
        max_length=2,
        description="One or two short, actionable suggestions to refine or extend this step.",
    )
