from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import get_settings
from app.core.llm import get_suggestions_model
from app.schemas.suggestions import SuggestionList

logger = logging.getLogger(__name__)

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "suggestions_prompt.txt"

# Defensive cap — the schema also bounds this, but the model is asked for at most 2.
_MAX_SUGGESTIONS = 2


@lru_cache
def load_suggestions_prompt() -> str:
    """Load the suggestion prompt and substitute the brand name."""
    settings = get_settings()
    raw = _PROMPT_PATH.read_text(encoding="utf-8")
    return raw.replace("{{BRAND_NAME}}", settings.brand_name)


async def suggest(step_name: str, assistant_output: str) -> SuggestionList:
    """Generate 1-2 next-action suggestions for a completed step's output.

    Fails open to NOTHING: any model error, unparseable result, or empty output
    returns an empty list, so the UI simply renders no suggestion buttons and the
    step output plus the fixed Continue/Refine buttons are never affected.
    """
    user = f"Current step: {step_name}\n\nStep output:\n{assistant_output}"
    try:
        model = get_suggestions_model().with_structured_output(SuggestionList)
        result = await model.ainvoke(
            [SystemMessage(content=load_suggestions_prompt()), HumanMessage(content=user)]
        )
    except Exception:
        # Do not log output content (may contain participant data) — only the failure.
        logger.warning("suggestion generation failed; returning no suggestions", exc_info=True)
        return SuggestionList(suggestions=[])

    if isinstance(result, SuggestionList):
        # Trim blanks and cap defensively in case the model over-returns.
        cleaned = [s.strip() for s in result.suggestions if s and s.strip()]
        return SuggestionList(suggestions=cleaned[:_MAX_SUGGESTIONS])
    logger.warning("suggestion model returned unexpected type; returning no suggestions")
    return SuggestionList(suggestions=[])
