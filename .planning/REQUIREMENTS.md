# Requirements — Song Recommender v1

## v1 Requirements

### Data

- [ ] **DATA-01**: Load `dataset.csv` (audio features) and `track_data_final.csv` (artist metadata), merge on `track_id` — keep only tracks present in both
- [ ] **DATA-02**: Handle missing values, deduplicate tracks, clean genre strings
- [ ] **DATA-03**: Engineer a unified feature vector per track: normalize numeric audio features (MinMaxScaler) + encode genre

### EDA

- [ ] **EDA-01**: Visualize distribution of key audio features (danceability, energy, valence, tempo) with histograms/KDE plots
- [ ] **EDA-02**: Correlation heatmap of all audio features
- [ ] **EDA-03**: Genre distribution bar chart (top N genres)
- [ ] **EDA-04**: Scatter plots showing feature clusters (e.g., energy vs. valence, colored by genre)

### Model

- [ ] **MODEL-01**: Build cosine similarity matrix over normalized feature vectors (sklearn `cosine_similarity`)
- [ ] **MODEL-02**: Implement `recommend(song_name, n=4)` — returns top-N most similar tracks with song name, artist, genre, similarity score
- [ ] **MODEL-03**: Display recommendation output as a clean formatted / styled DataFrame

### Evaluation & Polish

- [ ] **EVAL-01**: Radar chart comparing input song vs. recommended songs across audio dimensions
- [ ] **EVAL-02**: Calculate diversity score of the recommended queue (avg pairwise dissimilarity)
- [ ] **EVAL-03**: Notebook is clean, student-toned markdown, well-structured — resume-ready

---

## v2 Requirements (Deferred)

- User listening history / taste profile for personalization
- Collaborative filtering (user-item matrix)
- Model persistence (`.pkl` export)
- Interactive UI (Streamlit or ipywidgets)

---

## Out of Scope

- `spotify_data clean.csv` — redundant; excluded unless a specific gap is found during data exploration
- Real-time Spotify API integration — out of scope entirely
- Deep learning / embeddings — tech stack constraint (sklearn only)
- Recommending across users — no user data in Phase 1

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| DATA-01 | — | pending |
| DATA-02 | — | pending |
| DATA-03 | — | pending |
| EDA-01 | — | pending |
| EDA-02 | — | pending |
| EDA-03 | — | pending |
| EDA-04 | — | pending |
| MODEL-01 | — | pending |
| MODEL-02 | — | pending |
| MODEL-03 | — | pending |
| EVAL-01 | — | pending |
| EVAL-02 | — | pending |
| EVAL-03 | — | pending |
