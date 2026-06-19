from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.schemas.chat import (
    ChatRequest,
    SessionResponse,
    StepUpdateRequest,
    SuggestionsRequest,
)
from app.schemas.suggestions import SuggestionList
from app.services import chat_service, guardrail_service, session_store, suggestions_service

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/session", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session() -> SessionResponse:
    session = session_store.create_session()
    return SessionResponse(session_id=session.id, step_index=session.step_index)


async def _sse_events(session_id: str, message: str) -> AsyncIterator[str]:
    # Adapt the service's token stream to SSE frames. Each token is JSON-encoded
    # so newlines/special chars can't break SSE line framing.
    async for token in chat_service.stream_turn(session_id, message):
        yield f"data: {json.dumps({'token': token})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"


async def _blocked_events(message: str) -> AsyncIterator[str]:
    # Guardrail short-circuit: emit one redirect frame, then done. The main model
    # is never called and the session thread is left untouched.
    yield f"data: {json.dumps({'blocked': True, 'message': message})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"


@router.post("/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    session = session_store.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Layer 3 pre-check: classify before any facilitator call. On block, short-circuit.
    verdict = await guardrail_service.classify(
        request.message, guardrail_service.step_name(session.step_index)
    )
    if not verdict.allow:
        return StreamingResponse(
            _blocked_events(guardrail_service.redirect_text(session.step_index)),
            media_type="text/event-stream",
        )

    return StreamingResponse(
        _sse_events(request.session_id, request.message),
        media_type="text/event-stream",
    )


@router.post("/step", response_model=SessionResponse)
async def update_step(request: StepUpdateRequest) -> SessionResponse:
    session = session_store.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    session_store.set_step(request.session_id, request.step_index)
    return SessionResponse(session_id=session.id, step_index=request.step_index)


@router.post("/suggestions", response_model=SuggestionList)
async def suggestions(request: SuggestionsRequest) -> SuggestionList:
    session = session_store.get_session(request.session_id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    # Fails open to nothing inside the service: an empty list renders no buttons.
    return await suggestions_service.suggest(
        guardrail_service.step_name(request.step_index), request.assistant_message
    )
