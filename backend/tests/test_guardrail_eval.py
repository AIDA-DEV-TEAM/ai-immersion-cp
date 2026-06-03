"""Gated real-model guardrail eval. Excluded from the normal suite (no network).

Run explicitly:  pytest -m eval -s
Requires a provider key (in backend/.env or the environment); skipped otherwise.
"""

from __future__ import annotations

import pytest

from app.core.config import get_settings
from app.services import guardrail_service
from tests.data.guardrail_eval_cases import ALLOW_CASES, BLOCK_CASES

pytestmark = [
    pytest.mark.eval,
    pytest.mark.skipif(not get_settings().provider_api_key, reason="needs a provider API key"),
]


async def test_allow_set_has_zero_false_positives() -> None:
    false_positives: list[str] = []
    for text in ALLOW_CASES:
        verdict = await guardrail_service.classify(text, "Frame")
        if not verdict.allow:
            false_positives.append(text)

    fpr = len(false_positives) / len(ALLOW_CASES)
    print(f"\nGuardrail FPR: {fpr:.0%} ({len(false_positives)}/{len(ALLOW_CASES)} genuine turns blocked)")
    for text in false_positives:
        print(f"  FALSE POSITIVE: {text[:80]}...")

    assert fpr == 0, f"{len(false_positives)} genuine in-process turns were wrongly blocked"


async def test_block_set_false_negative_rate_is_reported() -> None:
    false_negatives: list[str] = []
    for text in BLOCK_CASES:
        verdict = await guardrail_service.classify(text, "Frame")
        if verdict.allow:
            false_negatives.append(text)

    fnr = len(false_negatives) / len(BLOCK_CASES)
    # Informational only — false negatives are caught by the human facilitator.
    print(f"\nGuardrail FNR: {fnr:.0%} ({len(false_negatives)}/{len(BLOCK_CASES)} off-process turns allowed)")
    for text in false_negatives:
        print(f"  FALSE NEGATIVE: {text[:80]}...")
