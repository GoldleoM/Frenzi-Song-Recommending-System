# Phase 6: Make a website — Research

## External API Integrations
1. **YouTube IFrame API**: 
   - Need to load standard `https://www.youtube.com/iframe_api`.
   - Since we want to play music visually without doing full auth, the frontend will take the `track_name` and `artists`, construct a YouTube search query `track_name + artists + audio`, and pass it to a YouTube search endpoint to get the `videoId`. Wait, the standard YouTube API requires an API key, so the user might need to provide one or we can just open standard embedded `iframe` links. Actually, standard Youtube search isn't allowed without an API Key. We need to plan for the user to provide a YouTube API Key.
   
2. **Spotify Web API**:
   - Needed for un-cached track metadata extraction.
   - We need OAuth 2.0 Client Credentials flow (Client ID + Client Secret).
   - Endpoints needed:
     - `GET /v1/search?q=track_name&type=track` to get the Spotify track ID.
     - `GET /v1/audio-features/{id}` to get the audio features (danceability, energy, etc.).

## Machine Learning Integration (Backend modifications)
In Phase 5, the pipeline exported the feature matrix. For live Spotify data, we must modify `OneHotEncoder(sparse_output=False, handle_unknown='ignore')` in `export_model.py` and dump the actual `pipeline` object so `main.py` can load it.

## Frontend UI Architecture
- Single Page Vanilla HTML/JS structure.
- **index.html**: semantic structure (Sidebar, Main Content Area, Bottom Player).
- **style.css**: Variables for theme `#000000` (Spotify) and gradients/blur filters for Apple Music glassmorphism `backdrop-filter: blur(20px)`.
- **app.js**: DOM manipulation and API logic.
