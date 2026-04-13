from firebase_functions import https_fn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

import os
path = os.path.dirname(os.path.abspath(__file__))

print("Loading joblib model from disk...", flush=True)
data = joblib.load(os.path.join(path, "recommender_data.joblib"))
df_meta = data["df_meta"]
feature_matrix = data["feature_matrix"]

app = FastAPI(title="Song Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendRequest(BaseModel):
    song_name: str
    n: int = 5

@app.post("/recommend")
def recommend_songs(req: RecommendRequest):
    song_name = req.song_name
    n = req.n
    
    # 1. Fuzzy match (substring)
    mask = df_meta['track_name'].str.contains(song_name, case=False, na=False)
    matches = df_meta[mask]
    
    if len(matches) == 0:
        return {"error": "Song not found. Try another search query."}
        
    # 2. Extract target vector (choosing the most popular match)
    target_idx = matches.sort_values(by='popularity', ascending=False).index[0]
    target_song = df_meta.loc[target_idx]
    
    target_vector = feature_matrix[target_idx].reshape(1, -1)
    
    # 3. Compute cosine similarity against all other songs
    similarity_scores = cosine_similarity(target_vector, feature_matrix).flatten()
    
    # Duplicate song filter: Ensure the searched song doesn't appear
    # We can handle variations by taking out exactly identical track_names
    target_track_name = target_song['track_name']
    exact_matches_mask = (df_meta['track_name'] == target_track_name).values
    similarity_scores[exact_matches_mask] = -1.0
    
    # Grab top N indices
    top_indices = np.argsort(similarity_scores)[::-1][:n]
    
    results = []
    for idx in top_indices:
        row = df_meta.loc[idx]
        results.append({
            "track_name": row['track_name'],
            "artists": row['artists'],
            "album_name": row['album_name'],
            "track_genre": row['track_genre'],
            "similarity": round(float(similarity_scores[idx]), 4)
        })
        
    return {
        "query": song_name,
        "matched_song": target_song['track_name'],
        "matched_artists": target_song['artists'],
        "recommendations": results
    }

@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    return https_fn.asgi_app(app)(req)
