import httpx
from typing import Optional
from config import settings
from schemas import MovieSearchResponse, MovieDetail, MovieSummary, GenreListResponse, VideoItem, VideoListResponse, CastMember, CrewMember, CreditsResponse

TMDB_HEADERS = {
    "accept": "application/json",
}


def _build_params(extra: dict = {}) -> dict:
    return {"api_key": settings.TMDB_API_KEY, **extra}


async def search_movies(
    query: str,
    page: int = 1,
    genre_id: Optional[int] = None,
    sort_by: Optional[str] = None,
) -> MovieSearchResponse:
    async with httpx.AsyncClient() as client:
        params = _build_params({"query": query, "page": page, "include_adult": False})
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/search/movie",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()

        results = [MovieSummary(**m) for m in data.get("results", [])]

        if genre_id:
            results = [m for m in results if genre_id in (m.genre_ids or [])]

        if sort_by == "rating":
            results.sort(key=lambda m: m.vote_average or 0, reverse=True)
        elif sort_by == "popularity":
            results.sort(key=lambda m: m.popularity or 0, reverse=True)

        return MovieSearchResponse(
            page=data["page"],
            results=results,
            total_pages=data["total_pages"],
            total_results=data["total_results"],
        )


async def get_trending_movies(time_window: str = "week", page: int = 1) -> MovieSearchResponse:
    async with httpx.AsyncClient() as client:
        params = _build_params({"page": page})
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/trending/movie/{time_window}",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return MovieSearchResponse(
            page=data["page"],
            results=[MovieSummary(**m) for m in data.get("results", [])],
            total_pages=data.get("total_pages", 1),
            total_results=data.get("total_results", 0),
        )


async def get_movie_detail(movie_id: int) -> MovieDetail:
    async with httpx.AsyncClient() as client:
        params = _build_params()
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/movie/{movie_id}",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        return MovieDetail(**response.json())


async def get_movie_videos(movie_id: int) -> VideoListResponse:
    async with httpx.AsyncClient() as client:
        params = _build_params()
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/movie/{movie_id}/videos",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        results = [
            VideoItem(**v)
            for v in data.get("results", [])
            if v.get("site") == "YouTube"
        ]
        return VideoListResponse(results=results)


async def get_movie_credits(movie_id: int) -> CreditsResponse:
    _FEATURED_JOBS = {"Director", "Producer", "Screenplay", "Writer", "Original Music Composer"}
    async with httpx.AsyncClient() as client:
        params = _build_params()
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/movie/{movie_id}/credits",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        cast = [CastMember(**c) for c in data.get("cast", [])[:20]]
        crew = [
            CrewMember(**c)
            for c in data.get("crew", [])
            if c.get("job") in _FEATURED_JOBS
        ]
        return CreditsResponse(cast=cast, crew=crew)


async def get_similar_movies(movie_id: int, page: int = 1) -> MovieSearchResponse:
    async with httpx.AsyncClient() as client:
        params = _build_params({"page": page})
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/movie/{movie_id}/similar",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return MovieSearchResponse(
            page=data["page"],
            results=[MovieSummary(**m) for m in data.get("results", [])],
            total_pages=data.get("total_pages", 1),
            total_results=data.get("total_results", 0),
        )


async def get_recommendations(movie_id: int, page: int = 1) -> MovieSearchResponse:
    async with httpx.AsyncClient() as client:
        params = _build_params({"page": page})
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/movie/{movie_id}/recommendations",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return MovieSearchResponse(
            page=data["page"],
            results=[MovieSummary(**m) for m in data.get("results", [])],
            total_pages=data.get("total_pages", 1),
            total_results=data.get("total_results", 0),
        )


async def get_movies_by_genre(
    genre_id: int,
    page: int = 1,
    sort_by: str = "popularity.desc",
) -> MovieSearchResponse:
    async with httpx.AsyncClient() as client:
        params = _build_params(
            {
                "with_genres": genre_id,
                "page": page,
                "sort_by": sort_by,
                "include_adult": False,
            }
        )
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/discover/movie",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        return MovieSearchResponse(
            page=data["page"],
            results=[MovieSummary(**m) for m in data.get("results", [])],
            total_pages=data.get("total_pages", 1),
            total_results=data.get("total_results", 0),
        )


async def get_genres() -> GenreListResponse:
    async with httpx.AsyncClient() as client:
        params = _build_params()
        response = await client.get(
            f"{settings.TMDB_BASE_URL}/genre/movie/list",
            params=params,
            headers=TMDB_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        return GenreListResponse(**response.json())
