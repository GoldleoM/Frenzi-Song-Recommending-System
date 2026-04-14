import os
import sys

# Compatibility for lyricsgenius/pydantic on Python < 3.11
if sys.version_info < (3, 11):
    import typing
    try:
        from typing_extensions import Self
        typing.Self = Self
    except ImportError:
        pass

import hashlib
import re
from dotenv import load_dotenv
import lyricsgenius
from firebase_admin import credentials, initialize_app, firestore

# Load env for GENIUS_ACCESS_TOKEN and Google Credentials
load_dotenv()

# Initialize Firebase exactly like main.py
try:
    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        initialize_app(cred)
    else:
        initialize_app()
    db = firestore.client()
except Exception as e:
    print(f"Failed to connect to Firestore: {e}")
    sys.exit(1)

def normalize_string_for_cache(s):
    s = str(s).lower()
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'- live.*?', '', s)
    s = re.sub(r'- radio edit.*?', '', s)
    s = re.sub(r'- remix.*?', '', s)
    return s.strip()

token = os.environ.get("GENIUS_ACCESS_TOKEN")
if not token or token == "PASTE_YOUR_TOKEN_HERE":
    print("GENIUS_ACCESS_TOKEN is missing or not set in .env")
    sys.exit(1)

genius = lyricsgenius.Genius(token)
genius.verbose = False
genius.remove_section_headers = False

print("Fetching all songs from youtube_cache...")
youtube_docs = db.collection('youtube_cache').stream()

for doc in youtube_docs:
    data = doc.to_dict()
    track_name = data.get('raw_track')
    artist = data.get('raw_artist')
    video_id = data.get('videoId')
    
    if not track_name or not artist:
        continue
        
    norm_track = normalize_string_for_cache(track_name)
    norm_artist = normalize_string_for_cache(artist)
    
    query_str = f"{norm_track} {norm_artist} lyrics"
    doc_id = hashlib.md5(query_str.encode('utf-8')).hexdigest()
    
    # Check if lyrics are already cached
    lyrics_snap = db.collection('lyrics_cache').document(doc_id).get()
    if lyrics_snap.exists:
        print(f"Skipping '{track_name}' by '{artist}' - Already in lyrics_cache.")
        continue
        
    print(f"Fetching lyrics for '{track_name}' by '{artist}'...")
    try:
        song = genius.search_song(track_name, artist)
        if not song:
            print("  -> Not found on Genius.")
            continue
            
        raw_lyrics = song.lyrics
        cleaned = re.sub(r'^[0-9]+ Lyrics', '', raw_lyrics)
        cleaned = re.sub(r'Embed$', '', cleaned)
        cleaned = re.sub(r'[0-9]*Embed$', '', cleaned)
        
        result = {
            "track_name": song.title,
            "artist": song.artist,
            "lyrics": cleaned,
            "source": "genius",
            "url": song.url,
            "query": query_str,
            "raw_track": track_name,
            "raw_artist": artist,
            "videoId": video_id,
            "timestamp": firestore.SERVER_TIMESTAMP
        }
        
        db.collection('lyrics_cache').document(doc_id).set(result)
        print("  -> Saved successfully!")
    except Exception as e:
        print(f"  -> Error: {e}")

print("Done! All existing db songs have been processed.")
