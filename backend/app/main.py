from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import get_settings
from app.routers import chat

settings = get_settings()

app = FastAPI(title="AI Immersion Workshop Chatbot")

# Explicit CORS allow-list from config — never "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Map status codes to stable error `code` slugs for the `{ detail, code }` shape.
_ERROR_CODES = {404: "not_found", 422: "validation_error", 400: "bad_request"}


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = _ERROR_CODES.get(exc.status_code, "error")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail, "code": code})


app.include_router(chat.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
