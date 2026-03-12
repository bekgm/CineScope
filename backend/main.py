from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy import text
from database import init_db, engine, Base
from config import settings
from routes.movies import router as movies_router
from routes.watchlist import router as watchlist_router


async def _migrate_db() -> None:
    """Idempotent schema migration: upgrades old watchlist table to multi-list schema."""
    async with engine.begin() as conn:
        result = await conn.execute(text("PRAGMA table_info(watchlist)"))
        rows = result.fetchall()
        if rows:  # table already exists
            columns = {row[1] for row in rows}
            if "list_type" not in columns:
                await conn.execute(text("ALTER TABLE watchlist RENAME TO watchlist_old"))
                # Drop all old indexes (they keep old names and block create_all)
                idx_result = await conn.execute(text("PRAGMA index_list(watchlist_old)"))
                for idx_row in idx_result.fetchall():
                    await conn.execute(text(f'DROP INDEX IF EXISTS "{idx_row[1]}"'))
                await conn.run_sync(Base.metadata.create_all)
                await conn.execute(
                    text(
                        "INSERT INTO watchlist "
                        "(movie_id, title, poster_path, release_date, vote_average, overview, list_type, added_at) "
                        "SELECT movie_id, title, poster_path, release_date, vote_average, overview, 'watchlist', added_at "
                        "FROM watchlist_old"
                    )
                )
                await conn.execute(text("DROP TABLE watchlist_old"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _migrate_db()
    await init_db()
    yield


app = FastAPI(
    title="CineScope API",
    description="Backend API for CineScope powered by TMDB",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies_router, prefix="/api")
app.include_router(watchlist_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CineScope API is running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
