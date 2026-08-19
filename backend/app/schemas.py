from pydantic import BaseModel, ConfigDict, Field


class BookCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    author: str = Field(
        min_length=1,
        max_length=120,
    )

    edition: int = Field(
        ge=1,
    )


class EditionOut(BaseModel):
    id: int
    edition: int

    model_config = ConfigDict(
        from_attributes=True,
    )


class BookOut(BaseModel):
    id: int
    title: str
    author: str
    editions: list[EditionOut]

    model_config = ConfigDict(
        from_attributes=True,
    )


class StatsOut(BaseModel):
    books: int
    editions: int
    authors: int