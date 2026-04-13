---
title: Frenzi Song Recommender
emoji: 🎵
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Frenzi — Audio DNA Song Recommender

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Firebase](https://img.shields.io/badge/Cloud-Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)

An intelligent, content-based song recommendation engine that explores the "Audio DNA" of music to find sonically similar tracks. Unlike traditional recommender systems that rely on genre tags or user history, Frenzi analyzes deep audio features to build a fluid, high-fidelity queue perfectly matched to the currently playing track.

---

## 🚀 Key Features

- **Audio DNA Mapping**: Driven by a content-based filtering engine analyzing 11 dimensions of sound (Energy, Danceability, Valence, etc.).
- **Cinematic Now-Playing Interface**: An Apple Music-inspired UI with smooth transitions, 16:9 cinematic video toggle, and dynamic blurred backdrops.
- **On-Demand Lyrics**: Real-time lyrics synchronization integrated via the **Genius API**.
- **Fluid Playback**: Integrated YouTube playback engine for high-fidelity audio/visual fallback for any recommended track.
- **Smart Caching Layer**: High-performance metadata and playback ID caching powered by **Firebase Firestore** to minimize API latency and preserve quota.

---

## 🧠 The Engine: Machine Learning at the Core

At the heart of Frenzi is a sophisticated content-based filtering pipeline built with the **scikit-learn** ecosystem.

### 1. Feature Engineering
The engine analyzes 80,000+ unique tracks across 11 key audio dimensions:
- **Energy & Danceability**: Capturing the rhythmic feel.
- **Valence**: Analyzing the musical "positivity" or emotional mood.
- **Acousticness & Instrumentalness**: Distinguishing between organic and electronic textures.
- **Tempo & Loudness**: Standardizing the energy levels of the recommendations.

### 2. Preprocessing Pipeline
- **Deduplication Logic**: Tracks are filtered and deduplicated by popularity, ensuring the most representative version of a song is used as the "seed."
- **Scaling**: A `MinMaxScaler` pipeline ensures that features with different scales (like Tempo vs. Valence) carry equal weight in the recommendation logic.

### 3. Vector Similarity
Frenzi calculates the **Cosine Similarity** between the target track's feature vector and the entire dataset in real-time. By measuring the angular distance between audio profiles, the engine can identify "sonically adjacent" tracks that genre tags often miss.

---

## 🛠️ Technical Stack & Infrastructure

- **Backend**: Python (FastAPI) for high-performance recommendation serving.
- **Frontend**: React (Vite) with a custom design system built for 60fps animations and fluid interactions.
- **Database**: **Google Cloud Firestore** for persistent caching of playback metadata and search indices.
- **APIs**:
  - **YouTube Data API v3**: To fetch playback IDs and rich artwork.
  - **Genius API**: For fetching full, formatted lyrics on-demand.
- **ML Libraries**: `pandas`, `numpy`, `scikit-learn`, `joblib`.

---

## 💡 Vision & Execution

**Frenzi is a showcase of modern, AI-accelerated engineering.**

- **Architecture & Product Design**: The entire application was architected, planned, and designed by the author. From the data pipeline in the Jupyter Notebook to the UX flow of the "Now Playing" interaction, every decision was driven by a human-centric product vision.
- **Collaborative Execution**: The implementation was accelerated through a state-of-the-art **Human-AI collaboration workflow**. By acting as the Lead Architect and using advanced AI coding partners for implementation, the author focused on high-level system logic while maintaining an extremely fast development cycle and a high-polish frontend.

---

## 🛠️ Setup & Local Development

1. **Clone & Install Backend**:
   ```bash
   cd functions
   pip install -r requirements.txt
   # Ensure you have your serviceAccountKey.json and .env configured
   ```

2. **Clone & Install Frontend**:
   ```bash
   cd frontend
   npm install
   ```

3. **Environments**:
   Config required in `functions/.env`:
   - `YOUTUBE_API_KEY`
   - `GENIUS_ACCESS_TOKEN`
   - `GOOGLE_APPLICATION_CREDENTIALS` (path to serviceAccountKey.json)

---

> **Note**: This project is built as a portfolio-grade demonstration of end-to-end Machine Learning deployment, integrating data science notebooks directly into a production-ready web architecture.
