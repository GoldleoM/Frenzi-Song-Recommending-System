y# Song Recommender — Content-Based ML System

## What This Is

A **content-based song recommendation engine** that generates a queue of 3–4 songs similar to the one currently playing. Built entirely with scikit-learn, pandas, numpy, seaborn, and matplotlib — no deep learning, no external APIs. Designed as a resume-quality Jupyter Notebook showcasing end-to-end ML skills.

Phase 1 focuses on content-based filtering using audio features (danceability, energy, valence, tempo, etc.). Phase 2 (future) will incorporate user taste/history for personalization.

## Core Value

> Given a song the user is playing, instantly generate a queue of 3–4 sonically similar songs — driven by audio DNA, not just genre labels.

## Context

- **Dataset:** 3 CSVs in the project directory
  - `dataset.csv` (primary, ~114K rows) — audio features + genre: `danceability`, `energy`, `key`, `loudness`, `speechiness`, `acousticness`, `instrumentalness`, `liveness`, `valence`, `tempo`, `track_genre`, `popularity`
  - `track_data_final.csv` — artist metadata: `artist_popularity`, `artist_followers`, `artist_genres`, `album_type`
  - `spotify_data clean.csv` — supplementary clean version
- **Merge strategy:** `dataset.csv` (audio features) + `track_data_final.csv` (artist enrichment) → join on `track_id`
- **Output format:** Jupyter Notebook (`.ipynb`) — resume-quality with clear explanations and visualizations
- **Stack:** Python, scikit-learn, pandas, numpy, seaborn, matplotlib (no deep learning, no Spotify API)
- **Purpose:** Resume/portfolio showcase — must be visually impressive, well-commented, and demonstrate ML understanding

## Requirements

### Validated

- [Phase 1] Load and merge CSVs (audio + metadata)
- [Phase 1] Feature engineering (scaling + encoding)
- [Phase 2] EDA with seaborn/matplotlib
- [Phase 3] `manual_levenshtein` fuzzy search
- [Phase 3] On-the-fly similarity calculation
- [Phase 3] Explainable recommendation output
- [Phase 4] Intra-List Diversity (ILD) scoring
- [Phase 4] Audio Profile Radar Charts
- [Phase 4] Professional DataFrame Styling

### Active

(All v1 goals complete)

### Out of Scope (Phase 1)

- User listening history / personalization — Phase 2
- Collaborative filtering — Phase 2
- Real-time Spotify integration — out of scope entirely
- Deep learning / neural embeddings — tech stack constraint

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Content-based (Phase 1) | No user history data available; audio features drive similarity | — Validated |
| Cosine similarity | Interpretable, works well in high-dim feature space, sklearn-native | — Validated |
| `dataset.csv` as primary | Has audio features (danceability, energy, valence, etc.) — the ML signal | — Validated |
| Merge with `track_data_final.csv` | Adds artist context (popularity, genre) for richer feature vectors | — Validated |
| Feature normalization (MinMaxScaler) | Audio features are on different scales; normalization is prerequisite for cosine similarity | — Validated |
| Output: Jupyter Notebook | Resume-ready format; allows markdown narrative + code + visualizations inline | — Validated |
| Human-style writing | Git commits: short, lowercase, casual (e.g. "add cosine similarity", "fix genre encoding"). Notebook: student tone — concise markdown, natural comments, no AI prose patterns | — Validated |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-13 after initialization*
