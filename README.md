# CineScope

A full-stack movie discovery app powered by the [TMDB API](https://www.themoviedb.org/). Browse trending films, search by title or genre, watch trailers, explore cast & crew, and manage personal movie lists — all in a polished glassmorphism UI with dark/light theme and English/Russian language support.

---

## Features

- **Movie Discovery** — Trending movies (daily/weekly), genre browsing, and customisable sort order
- **Search** — Full-text search with genre and sort filters; infinite scroll pagination
- **Movie Detail Page** — Poster, backdrop, ratings, runtime, budget, revenue, status, homepage link, overview, and crew credits (director, writers)
- **Trailers & Videos** — Embedded YouTube player for official trailers and clips
- **Cast & Crew** — Profile photos, character names, and roles
- **Recommendations & Similar Movies** — Tabbed suggestions on every movie page
- **Personal Lists** — Add movies to _Watchlist_, _Watched_, or _Favourites_; manage from a dedicated lists page
- **Dark / Light Theme** — Toggleable, persisted to `localStorage` (default: light)
- **EN / RU Language** — Full English/Russian UI toggle, persisted to `localStorage`
- **Animated Splash Screen** — Cinematic intro with film strips, projector beam, and progress bar
- **Custom Logo** — Magnifying glass + clapperboard SVG mark

---

## Tech Stack

### Frontend
| Technology | Version |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Vite | 6 |
| Tailwind CSS | 3 |
| React Router | 6 |
| Axios | 1.7 |

### Backend
| Technology | Version |
|---|---|
| FastAPI | 0.115 |
| Uvicorn | 0.30 |
| SQLAlchemy (async) | 2.0 |
| aiosqlite | 0.20 |
| httpx | 0.27 |
| Pydantic v2 | 2.9 |
| Alembic | 1.13 |

### Infrastructure
- **Docker Compose** — single-command startup
- **Nginx** — serves the production React build
- **SQLite** — zero-config persistent storage via a named Docker volume

---

## Project Structure

```
movie_finder/
├── docker-compose.yml
├── backend/
│   ├── main.py              # FastAPI app, lifespan, CORS, DB migration
│   ├── config.py            # Pydantic-settings (env vars)
│   ├── database.py          # Async SQLAlchemy engine & session
│   ├── models.py            # ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── tmdb_client.py       # TMDB API wrapper (httpx)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── routes/
│       ├── movies.py        # Movie endpoints
│       └── watchlist.py     # List management endpoints
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx
        ├── api/movieApi.ts       # Axios API calls
        ├── components/
        │   ├── layout/           # Navbar, Footer
        │   ├── movies/           # MovieCard, MovieGrid, WatchlistButton
        │   └── ui/               # CineScopeLogo, LoadingSpinner, ErrorMessage, Pagination, SplashScreen
        ├── context/
        │   ├── ThemeContext.tsx
        │   ├── LanguageContext.tsx
        │   └── WatchlistContext.tsx
        ├── hooks/useInfiniteScroll.ts
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── SearchPage.tsx
        │   ├── MovieDetailPage.tsx
        │   ├── WatchlistPage.tsx
        │   └── NotFoundPage.tsx
        ├── types/index.ts
        └── utils/imageUtils.ts
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- A free [TMDB API key](https://developer.themoviedb.org/docs/getting-started)

### 1. Clone the repository

```bash
git clone <repo-url>
cd movie_finder
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
TMDB_API_KEY=your_tmdb_api_key_here
```

The following variables are optional and have defaults:

```env
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
DATABASE_URL=sqlite+aiosqlite:///./data/movie_finder.db
CORS_ORIGINS=http://localhost
```

### 3. Build and run

```bash
docker compose up --build -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5000 |
| Backend API | http://localhost:8001 |
| API Docs (Swagger) | http://localhost:8001/docs |
| API Docs (ReDoc) | http://localhost:8001/redoc |

### 4. Stop

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

---

## API Reference

### Movies — `/movies`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/movies/search` | Search movies by title; supports `genre_id`, `sort_by`, `page` |
| `GET` | `/movies/trending` | Trending movies; `time_window=day\|week` |
| `GET` | `/movies/genres` | List of all TMDB genres |
| `GET` | `/movies/discover` | Browse movies by genre, sort order, and page |
| `GET` | `/movies/{id}` | Full movie detail |
| `GET` | `/movies/{id}/similar` | Similar movies |
| `GET` | `/movies/{id}/recommendations` | Recommended movies |
| `GET` | `/movies/{id}/videos` | Trailers and clips |
| `GET` | `/movies/{id}/credits` | Cast and crew |

### Watchlist — `/watchlist`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/watchlist` | Get all items; filter by `list_type=watchlist\|watched\|favourites` |
| `GET` | `/watchlist/check/{movie_id}` | Check if a movie is in any list |
| `POST` | `/watchlist` | Add a movie to a list |
| `DELETE` | `/watchlist/{movie_id}` | Remove a movie from a specific list |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check — returns `{"status": "ok"}` |

---

## Configuration

All backend configuration is managed via environment variables (see `backend/config.py`):

| Variable | Default | Description |
|---|---|---|
| `TMDB_API_KEY` | *(required)* | Your TMDB v3 API key |
| `TMDB_BASE_URL` | `https://api.themoviedb.org/3` | TMDB API base URL |
| `TMDB_IMAGE_BASE_URL` | `https://image.tmdb.org/t/p` | TMDB image CDN base |
| `DATABASE_URL` | `sqlite+aiosqlite:///./data/movie_finder.db` | Async SQLAlchemy connection string |
| `CORS_ORIGINS` | `http://localhost` | Comma-separated allowed origins |

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp ../.env .env          # or set TMDB_API_KEY in your shell
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # starts Vite dev server on http://localhost:5173
```

> Update `VITE_API_BASE_URL` in `vite.config.ts` or set it in a local `.env` if the backend runs on a different port.

---

## Internationalisation (i18n)

Language support is implemented with a custom React context (`LanguageContext`) — no third-party i18n library is required.

- **Languages**: English (`en`) and Russian (`ru`)
- **Toggle**: Click the **EN / RU** button in the top navigation bar
- **Persistence**: Selected language is saved to `localStorage` and restored on next visit
- **Adding a new language**: Add an entry to the `translations` object in `frontend/src/context/LanguageContext.tsx` and extend the `Lang` type

---

## Theming

- Toggle between **light** and **dark** mode via the sun/moon icon in the Navbar
- The chosen theme is persisted to `localStorage`
- Default is **light mode**
- Implemented with a `ThemeContext` that toggles the `dark` class on `<html>`; all dark-mode styles use Tailwind's `dark:` variant

---

## License

This project is for personal/educational use. Movie data is provided by [The Movie Database (TMDB)](https://www.themoviedb.org/) and is subject to their [terms of use](https://www.themoviedb.org/documentation/api/terms-of-use).

> This product uses the TMDB API but is not endorsed or certified by TMDB.