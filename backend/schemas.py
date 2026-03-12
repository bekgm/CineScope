from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Genre(BaseModel):
    id: int
    name: str


class MovieBase(BaseModel):
    id: int
    title: str
    poster_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    overview: Optional[str] = None


class MovieSummary(MovieBase):
    popularity: Optional[float] = None
    genre_ids: Optional[List[int]] = []


class MovieDetail(MovieBase):
    backdrop_path: Optional[str] = None
    genres: Optional[List[Genre]] = []
    runtime: Optional[int] = None
    popularity: Optional[float] = None
    vote_count: Optional[int] = None
    tagline: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[int] = None
    revenue: Optional[int] = None
    homepage: Optional[str] = None


class MovieSearchResponse(BaseModel):
    page: int
    results: List[MovieSummary]
    total_pages: int
    total_results: int


class VideoItem(BaseModel):
    id: str
    key: str
    name: str
    site: str
    type: str
    official: bool = False


class VideoListResponse(BaseModel):
    results: List[VideoItem]


class CastMember(BaseModel):
    id: int
    name: str
    character: Optional[str] = None
    profile_path: Optional[str] = None
    order: Optional[int] = None


class CrewMember(BaseModel):
    id: int
    name: str
    job: Optional[str] = None
    department: Optional[str] = None
    profile_path: Optional[str] = None


class CreditsResponse(BaseModel):
    cast: List[CastMember]
    crew: List[CrewMember]


class WatchlistItemCreate(BaseModel):
    movie_id: int
    title: str
    poster_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    overview: Optional[str] = None
    list_type: str = "watchlist"


class WatchlistItemResponse(WatchlistItemCreate):
    id: int
    added_at: datetime

    class Config:
        from_attributes = True


class WatchlistResponse(BaseModel):
    items: List[WatchlistItemResponse]
    total: int


class GenreListResponse(BaseModel):
    genres: List[Genre]


class ErrorResponse(BaseModel):
    detail: str
