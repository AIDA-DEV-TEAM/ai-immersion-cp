from __future__ import annotations

from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration, loaded from the environment / `.env`.

    Provider settings are intentionally generic (base_url + model + api_key) so
    swapping engines (NIM dev -> Gemini/OpenAI prod) is a config change, not a
    code change.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Provider — OpenAI-compatible lingua franca. Dev defaults target NVIDIA NIM.
    provider_base_url: str = Field(default="https://integrate.api.nvidia.com/v1")
    provider_model: str = Field(default="meta/llama-3.1-70b-instruct")
    provider_api_key: str = Field(default="")

    # Guardrail pre-check model. Its own config string so prod can pick a
    # cheaper/faster model than the facilitator; reuses provider_base_url + key.
    # Defaults to the facilitator model (a known-good id) because a smaller id
    # could not be confirmed available on the free tier — point this at a smaller
    # model (e.g. an 8b instruct) once you've verified it on your key.
    guardrail_model: str = Field(default="meta/llama-3.1-70b-instruct")

    # Build-time branding, substituted into the system prompt.
    brand_name: str = Field(default="Acme")
    brand_voice: str = Field(default="warm, plain-spoken, professional")

    # Explicit CORS allow-list (comma-separated in the env var). Never "*".
    # NoDecode stops pydantic-settings from JSON-decoding the env value so the
    # validator below can split a plain comma-separated string.
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"]
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        # Allow a comma-separated string in the env var, normalised to a list.
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
