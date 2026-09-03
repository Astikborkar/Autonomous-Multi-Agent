import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous Multi-Agent Workflow Orchestrator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "SECRET_KEY_CHANGE_IN_PRODUCTION_90384209384029384029834029384"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days

    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "orchestrator")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    # Dynamic Async SQLAlchemy Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # Sync Database URL for Alembic migrations
    SYNC_DATABASE_URL: str = os.getenv(
        "SYNC_DATABASE_URL",
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_URL: str = os.getenv("REDIS_URL", f"redis://{REDIS_HOST}:{REDIS_PORT}/0")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]

    # LLM Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "gpt-4o")
    SIMULATION_MODE: bool = os.getenv("SIMULATION_MODE", "true").lower() in ("true", "1", "t")

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
