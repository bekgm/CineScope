from sqlalchemy import Column, Integer, String, Float, Text, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist"
    __table_args__ = (
        UniqueConstraint("movie_id", "list_type", name="uq_movie_list"),
    )

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    poster_path = Column(String(500), nullable=True)
    release_date = Column(String(20), nullable=True)
    vote_average = Column(Float, nullable=True)
    overview = Column(Text, nullable=True)
    list_type = Column(String(20), nullable=False, default="watchlist", server_default="watchlist")
    added_at = Column(DateTime(timezone=True), server_default=func.now())