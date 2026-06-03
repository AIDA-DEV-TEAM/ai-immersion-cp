from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import get_settings
from app.core.llm import get_guardrail_model
from app.schemas.guardrail import GuardrailVerdict

logger = logging.getLogger(__name__)

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "guardrail_prompt.txt"

# Canonical step names — keep in sync with docs/cookbook-chatbot-prompts.md, which is
# the source of truth (§3 fills {{CURRENT_STEP_NAME}} in the redirect below). The
# frontend mirrors these in src/data/stepTemplates.ts; TS can't be imported here, so
# this short constant is the one allowed duplication.
STEP_NAMES = ("Frame", "Widen", "Diagnose", "Ideate", "Brief", "Build")

# Canned redirect from docs §3 (source of truth). {step} is the current step name.
_REDIRECT_TEMPLATE = (
    "That's outside what this workshop session covers. Let's keep going on your "
    "challenge — you're currently on the {step} step. Want to continue there?"
)


@lru_cache
def load_guardrail_prompt() -> str:
    """Load the composed classifier prompt and substitute the brand name."""
    settings = get_settings()
    raw = _PROMPT_PATH.read_text(encoding="utf-8")
    return raw.replace("{{BRAND_NAME}}", settings.brand_name)


def step_name(step_index: int) -> str:
    # Clamp defensively; step_index is validated upstream but stays correct if it drifts.
    index = min(max(step_index, 0), len(STEP_NAMES) - 1)
    return STEP_NAMES[index]


def redirect_text(step_index: int) -> str:
    return _REDIRECT_TEMPLATE.format(step=step_name(step_index))


async def classify(message: str, current_step_name: str) -> GuardrailVerdict:
    """Decide whether a participant turn belongs to the six-step flow.

    Fails OPEN: any classifier error or unparseable verdict returns allow=True, so
    an infra failure never blocks a genuine participant (bias hard toward allowing).
    """
    user = f"Current step: {current_step_name}\n\nParticipant message:\n{message}"
    try:
        model = get_guardrail_model().with_structured_output(GuardrailVerdict)
        verdict = await model.ainvoke(
            [SystemMessage(content=load_guardrail_prompt()), HumanMessage(content=user)]
        )
    except Exception:
        # Do not log message content (may contain participant data) — only the failure.
        logger.warning("guardrail classifier failed; failing open (allow)", exc_info=True)
        return GuardrailVerdict(allow=True, reason="fail-open: classifier error")

    if isinstance(verdict, GuardrailVerdict):
        return verdict
    logger.warning("guardrail returned unexpected verdict type; failing open (allow)")
    return GuardrailVerdict(allow=True, reason="fail-open: unexpected verdict type")
