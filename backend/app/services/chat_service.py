from __future__ import annotations

from collections.abc import AsyncIterator
from functools import lru_cache
from pathlib import Path

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.core.config import get_settings
from app.core.llm import get_chat_model
from app.services import session_store

_PROMPT_PATH = Path(__file__).resolve().parent.parent / "prompts" / "system_prompt.txt"


@lru_cache
def load_system_prompt() -> str:
    """Load the verbatim system prompt and substitute the build-time brand fields.

    The text is used as-is from `prompts/system_prompt.txt`; only the
    `{{BRAND_NAME}}` / `{{BRAND_VOICE}}` placeholders are filled from config.
    """
    settings = get_settings()
    raw = _PROMPT_PATH.read_text(encoding="utf-8")
    return raw.replace("{{BRAND_NAME}}", settings.brand_name).replace(
        "{{BRAND_VOICE}}", settings.brand_voice
    )


async def stream_turn(session_id: str, message: str) -> AsyncIterator[str]:
    """Run one participant turn and stream the assistant's reply token by token.

    Appends the user turn to the thread, sends `[system] + full thread` to the
    model (the thread is the state), then appends the completed assistant turn so
    it compounds into the next call.
    """
    session_store.append_message(session_id, HumanMessage(content=message))
    session = session_store.get_session(session_id)
    assert session is not None  # router guarantees the session exists before this call

    messages = [SystemMessage(content=load_system_prompt()), *session.messages]

    chunks: list[str] = []
    async for chunk in get_chat_model().astream(messages):
        text = chunk.content if isinstance(chunk.content, str) else str(chunk.content)
        if text:
            chunks.append(text)
            yield text

    session_store.append_message(session_id, AIMessage(content="".join(chunks)))
