from firebase_functions import https_fn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
import requests
from dotenv import load_dotenv
import os

load_dotenv()

path = os.path.dirname(os.path.abspath(__file__))

print("Loading joblib model from disk...", flush=True)
data = joblib.load(os.path.join(path, "recommender_data.joblib"))
df_meta = data["df_meta"]
feature_matrix = data["feature_matrix"]
pipeline = data["pipeline"]

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

def fetch_spotify_recommendation(song_name: str, n: int):
    client_id = os.environ.get("SPOTIFY_CLIENT_ID")
    client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
    
    if not client_id or not client_secret or client_id == "YOUR_SPOTIFY_CLIENT_ID":
        return {"error": "Song not found in local DB and Spotify Secrets not properly configured in backend."}
        
    # 1. Get Auth Token
    auth_response = requests.post(
        'https://accounts.spotify.com/api/token',
        data={'grant_type': 'client_credentials'},
        auth=(client_id, client_secret)
    )
    
    if auth_response.status_code != 200:
        return {"error": "Failed to authenticate with Spotify API"}
        
    token = auth_response.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    
    # 2. Search Track
    search_response = requests.get(
        f'https://api.spotify.com/v1/search',
        params={'q': song_name, 'type': 'track', 'limit': 1},
        headers=headers
    )
    
    if search_response.status_code != 200:
        return {"error": "Spotify track search failed"}
        
    search_data = search_response.json()
    if not search_data.get('tracks') or not search_data['tracks']['items']:
        return {"error": "Song not found on Spotify either."}
        
    track = search_data['tracks']['items'][0]
    track_id = track['id']
    track_name_spot = track['name']
    track_artist_spot = track['artists'][0]['name']
    
    # 3. Get Audio Features
    features_response = requests.get(
        f'https://api.spotify.com/v1/audio-features/{track_id}',
        headers=headers
    )
    
    if features_response.status_code != 200:
        return {"error": "Failed to extract audio features from Spotify"}
        
    features = features_response.json()
    
    feature_dict = {
        'danceability': features.get('danceability', 0.0),
        'energy': features.get('energy', 0.0),
        'key': features.get('key', 0),
        'loudness': features.get('loudness', 0.0),
        'mode': features.get('mode', 0),
        'speechiness': features.get('speechiness', 0.0),
        'acousticness': features.get('acousticness', 0.0),
        'instrumentalness': features.get('instrumentalness', 0.0),
        'liveness': features.get('liveness', 0.0),
        'valence': features.get('valence', 0.0),
        'tempo': features.get('tempo', 0.0),
        'track_genre': "" # Default to empty string so encoder ignores it
    }
    
    # 4. Pipeline Transform
    df_input = pd.DataFrame([feature_dict])
    target_vector = pipeline.transform(df_input)
    
    # 5. Compute cosine similarity against our DB
    similarity_scores = cosine_similarity(target_vector, feature_matrix).flatten()
    
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
        "matched_song": track_name_spot,
        "matched_artists": track_artist_spot,
        "recommendations": results
    }

@app.post("/recommend")
def recommend_songs(req: RecommendRequest):
    song_name = req.song_name
    n = req.n
    
    # 1. Fuzzy match against internal database
    mask = df_meta['track_name'].str.contains(song_name, case=False, na=False)
    matches = df_meta[mask]
    
    if len(matches) == 0:
        print(f"'{song_name}' not in local memory. Fetching from Spotify API...", flush=True)
        return fetch_spotify_recommendation(song_name, n)
        
    # 2. Extract target vector
    target_idx = matches.sort_values(by='popularity', ascending=False).index[0]
    target_song = df_meta.loc[target_idx]
    
    target_vector = feature_matrix[target_idx].reshape(1, -1)
    
    # 3. Compute cosine similarity
    similarity_scores = cosine_similarity(target_vector, feature_matrix).flatten()
    
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
