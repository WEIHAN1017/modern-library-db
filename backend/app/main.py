from contextlib import asynccontextmanager
from typing import Literal, Optional

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Query,
    Response,
    status,
)
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from .config import settings
from .database import Base, engine, get_db
from .models import Book, Edition
from .schemas import BookCreate, BookOut, StatsOut


# ============================================================
# FastAPI 啟動 / 關閉生命週期
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Demo 專案為了簡化環境，
    # 啟動 Backend 時直接建立不存在的資料表。
    Base.metadata.create_all(bind=engine)

    yield


app = FastAPI(
    title="Library Atlas API",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Helper
# ============================================================

def find_book_with_editions(
    db: Session,
    book_id: int,
) -> Optional[Book]:

    statement = (
        select(Book)
        .options(
            selectinload(Book.editions)
        )
        .where(Book.id == book_id)
    )

    return db.scalar(statement)


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
    }


# ============================================================
# Statistics
# ============================================================

@app.get(
    "/api/stats",
    response_model=StatsOut,
)
def get_stats(
    db: Session = Depends(get_db),
):
    book_count = db.scalar(
        select(func.count())
        .select_from(Book)
    ) or 0

    edition_count = db.scalar(
        select(func.count())
        .select_from(Edition)
    ) or 0

    author_count = db.scalar(
        select(
            func.count(
                func.distinct(Book.author)
            )
        )
    ) or 0

    return StatsOut(
        books=book_count,
        editions=edition_count,
        authors=author_count,
    )


# ============================================================
# GET Books
#
# 對應：
# Find Book
# Find Author
# Sort by Title
# Sort by Author
# ============================================================

@app.get(
    "/api/books",
    response_model=list[BookOut],
)
def get_books(
    search: str = Query(default=""),
    sort_by: Literal["title", "author"] = Query(
        default="title"
    ),
    db: Session = Depends(get_db),
):
    statement = (
        select(Book)
        .options(
            selectinload(Book.editions)
        )
    )

    keyword = search.strip()

    if keyword:
        pattern = f"%{keyword}%"

        statement = statement.where(
            or_(
                Book.title.ilike(pattern),
                Book.author.ilike(pattern),
            )
        )

    if sort_by == "author":
        statement = statement.order_by(
            Book.author,
            Book.title,
        )
    else:
        statement = statement.order_by(
            Book.title,
            Book.author,
        )

    return list(
        db.scalars(statement).all()
    )


# ============================================================
# GET 單一本書
# ============================================================

@app.get(
    "/api/books/{book_id}",
    response_model=BookOut,
)
def get_book(
    book_id: int,
    db: Session = Depends(get_db),
):
    book = find_book_with_editions(
        db,
        book_id,
    )

    if book is None:
        raise HTTPException(
            status_code=404,
            detail="Book not found.",
        )

    return book


# ============================================================
# Find Author
# ============================================================

@app.get(
    "/api/authors/{author}/books",
    response_model=list[BookOut],
)
def find_author_books(
    author: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(Book)
        .options(
            selectinload(Book.editions)
        )
        .where(
            func.lower(Book.author)
            == author.strip().lower()
        )
        .order_by(Book.title)
    )

    books = list(
        db.scalars(statement).all()
    )

    if not books:
        raise HTTPException(
            status_code=404,
            detail="No books found for this author.",
        )

    return books


# ============================================================
# Insert
# ============================================================

@app.post(
    "/api/books",
    response_model=BookOut,
    status_code=status.HTTP_201_CREATED,
)
def create_book_edition(
    payload: BookCreate,
    db: Session = Depends(get_db),
):
    title = payload.title.strip()
    author = payload.author.strip()

    if not title or not author:
        raise HTTPException(
            status_code=422,
            detail="Title and author cannot be empty.",
        )

    # 先尋找是否已有相同 Title + Author
    book = db.scalar(
        select(Book).where(
            Book.title == title,
            Book.author == author,
        )
    )

    # 如果還沒有這本書，先建立 Book
    if book is None:
        book = Book(
            title=title,
            author=author,
        )

        db.add(book)
        db.flush()

    # 同一本 Book 不允許相同 Edition
    duplicate = db.scalar(
        select(Edition.id).where(
            Edition.book_id == book.id,
            Edition.edition == payload.edition,
        )
    )

    if duplicate is not None:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="This edition already exists.",
        )

    edition = Edition(
        edition=payload.edition,
        book_id=book.id,
    )

    db.add(edition)

    try:
        db.commit()

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="This book edition already exists.",
        )

    result = find_book_with_editions(
        db,
        book.id,
    )

    if result is None:
        raise HTTPException(
            status_code=500,
            detail="Unable to load created book.",
        )

    return result


# ============================================================
# Delete Edition
# ============================================================

@app.delete(
    "/api/editions/{edition_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_edition(
    edition_id: int,
    db: Session = Depends(get_db),
):
    edition = db.get(
        Edition,
        edition_id,
    )

    if edition is None:
        raise HTTPException(
            status_code=404,
            detail="Edition not found.",
        )

    book_id = edition.book_id

    edition_count = db.scalar(
        select(func.count())
        .select_from(Edition)
        .where(
            Edition.book_id == book_id
        )
    ) or 0

    # 如果這已經是最後一個 Edition，
    # 那整個 Book 也沒有保留的必要。
    if edition_count == 1:
        book = db.get(
            Book,
            book_id,
        )

        if book is not None:
            db.delete(book)

    else:
        db.delete(edition)

    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )


# ============================================================
# Delete Book
# ============================================================

@app.delete(
    "/api/books/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
):
    book = db.get(
        Book,
        book_id,
    )

    if book is None:
        raise HTTPException(
            status_code=404,
            detail="Book not found.",
        )

    db.delete(book)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )