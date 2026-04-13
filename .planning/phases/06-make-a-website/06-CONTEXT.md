# Phase 6: Make a Website — Context

## Goal
Build a vanilla HTML/JS/CSS frontend web application for the ML song recommender, styled with Spotify layout patterns and vibrant Apple Music glassmorphism aesthetics. Enhance the backend to support live unseen track recommendation, and use YouTube as a playback engine.

## Decisions

### Tech Stack & Frontend
- **Framework**: Vanilla HTML, CSS, JavaScript (no React/Vue).
- **Aesthetics**: Premium modern UI. A layout inspired by Spotify (search bar, track lists, sidebars) but utilizing beautiful gradients, frosted glass/glassmorphism, and smooth animations inspired by Apple Music.

### External APIs
- **YouTube API**: Used on the frontend to search for the song name and embed a player for playback. If the backend fails to find the song in the dataset, it will still play on the YouTube UI.
- **Spotify API**: If a song is NOT in the 114k internal dataset, the site will fetch its live `audio_features` from Spotify's API and send them to the backend to generate similar songs from the database dynamically on-the-fly.

### Core Workflow (Unseen Songs)
- **Problem**: The current backend only does `find_song` inside the database.
- **Decision**: The backend ML pipeline will be modified so that if the DB search fails, the backend accepts raw audio feature vectors, passes them through the original Sklearn `ColumnTransformer` (ignoring strict genre checks), and spits out recommendations.

## Canonical Refs
- `dataset.csv`: Primary reference for data structure.
- `functions/main.py`: The API location.
- Spotify Web API Docs (Audio Features)
