from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Optional
from database import get_db
from models import WatchlistItem
from schemas import WatchlistItemCreate, WatchlistItemResponse, WatchlistResponse

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

_VALID_LIST_TYPES = {"watchlist", "watched", "favourites"}


@router.get("/check/{movie_id}")
async def check_watchlist(movie_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WatchlistItem.list_type).where(WatchlistItem.movie_id == movie_id)
    )
    lists = [row[0] for row in result.fetchall()]
    return {
        "in_watchlist": "watchlist" in lists,
        "in_watched": "watched" in lists,
        "in_favourites": "favourites" in lists,
        "lists": lists,
    }


@router.get("", response_model=WatchlistResponse)
async def get_watchlist(
    list_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(WatchlistItem).order_by(WatchlistItem.added_at.desc())
    if list_type:
        query = query.where(WatchlistItem.list_type == list_type)
    result = await db.execute(query)
    items = result.scalars().all()
    return WatchlistResponse(items=list(items), total=len(items))


@router.post("", response_model=WatchlistItemResponse, status_code=201)
async def add_to_watchlist(item: WatchlistItemCreate, db: AsyncSession = Depends(get_db)):
    if item.list_type not in _VALID_LIST_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"list_type must be one of {sorted(_VALID_LIST_TYPES)}",
        )
    existing = await db.execute(
        select(WatchlistItem).where(
            WatchlistItem.movie_id == item.movie_id,
            WatchlistItem.list_type == item.list_type,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Movie already in this list")

    db_item = WatchlistItem(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.delete("/{movie_id}", status_code=204)
async def remove_from_watchlist(
    movie_id: int,
    list_type: str = Query("watchlist"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WatchlistItem).where(
            WatchlistItem.movie_id == movie_id,
            WatchlistItem.list_type == list_type,
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Movie not found in this list")
    await db.execute(
        delete(WatchlistItem).where(
            WatchlistItem.movie_id == movie_id,
            WatchlistItem.list_type == list_type,
        )
    )
    await db.commit()
