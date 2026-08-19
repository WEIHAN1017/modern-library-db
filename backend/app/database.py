from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings


# 建立 SQLAlchemy Engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
)


# 每次 HTTP Request 都可以取得自己的 Database Session
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


# 所有 SQLAlchemy Model 的父類別
class Base(DeclarativeBase):
    pass


# FastAPI Dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()