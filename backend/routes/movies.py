from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import httpx
import tmdb_client
from schemas import MovieSearchResponse, MovieDetail, GenreListResponse, VideoListResponse, CreditsResponse

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/search", response_model=MovieSearchResponse)
async def search_movies(
    q: str = Query(..., min_length=1, description="Movie search query"),
    page: int = Query(1, ge=1, le=500),
    genre_id: Optional[int] = Query(None),
    sort_by: Optional[str] = Query(None, pattern="^(rating|popularity)$"),
):
    try:
        return await tmdb_client.search_movies(q, page, genre_id, sort_by)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/trending", response_model=MovieSearchResponse)
async def get_trending(
    time_window: str = Query("week", pattern="^(day|week)$"),
    page: int = Query(1, ge=1),
):
    try:
        return await tmdb_client.get_trending_movies(time_window, page)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/genres", response_model=GenreListResponse)
async def get_genres():
    try:
        return await tmdb_client.get_genres()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/discover", response_model=MovieSearchResponse)
async def discover_movies(
    genre_id: int = Query(...),
    page: int = Query(1, ge=1),
    sort_by: str = Query("popularity.desc"),
):
    try:
        return await tmdb_client.get_movies_by_genre(genre_id, page, sort_by)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/{movie_id}", response_model=MovieDetail)
async def get_movie_detail(movie_id: int):
    try:
        return await tmdb_client.get_movie_detail(movie_id)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Movie not found")
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/{movie_id}/similar", response_model=MovieSearchResponse)
async def get_similar(movie_id: int, page: int = Query(1, ge=1)):
    try:
        return await tmdb_client.get_similar_movies(movie_id, page)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/{movie_id}/recommendations", response_model=MovieSearchResponse)
async def get_recommendations(movie_id: int, page: int = Query(1, ge=1)):
    try:
        return await tmdb_client.get_recommendations(movie_id, page)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/{movie_id}/videos", response_model=VideoListResponse)
async def get_videos(movie_id: int):
    try:
        return await tmdb_client.get_movie_videos(movie_id)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")


@router.get("/{movie_id}/credits", response_model=CreditsResponse)
async def get_credits(movie_id: int):
    try:
        return await tmdb_client.get_movie_credits(movie_id)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="TMDB API error")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Unable to connect to TMDB API")
