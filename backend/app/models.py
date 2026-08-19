from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Book(Base):
    __tablename__ = "books"

    __table_args__ = (
        UniqueConstraint(
            "title",
            "author",
            name="uq_book_title_author",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        index=True,
        nullable=False,
    )

    author: Mapped[str] = mapped_column(
        String(120),
        index=True,
        nullable=False,
    )

    editions: Mapped[list["Edition"]] = relationship(
        back_populates="book",
        cascade="all, delete-orphan",
        order_by="Edition.edition",
    )


class Edition(Base):
    __tablename__ = "editions"

    __table_args__ = (
        UniqueConstraint(
            "book_id",
            "edition",
            name="uq_book_edition",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    edition: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    book_id: Mapped[int] = mapped_column(
        ForeignKey(
            "books.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    book: Mapped["Book"] = relationship(
        back_populates="editions",
    )