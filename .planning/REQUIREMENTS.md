# Requirements — Song Recommender v1

## v1 Requirements

### Data

- [ ] **DATA-01**: Load and clean `dataset.csv` (audio features and genres) — handle deduplication and basic track identification
- [ ] **DATA-02**: Handle missing values (drop rows with NaNs)
- [ ] **DATA-03**: Engineer a unified feature vector per track: normalize numeric audio features (MinMaxScaler) + one-hot encode genre

### EDA

- [x] **EDA-01**: Visualizations...
- [x] **EDA-02**: Correlation heatmap...
- [x] **EDA-03**: Genre distribution...
- [x] **EDA-04**: Scatter plots...

### 3. Recommender Engine (Core Logic)
- [x] Implementation of `manual_levenshtein` distance algorithm (dynamic programming) for typo-resistant search. [03.01]
- [x] Recursive fallback search: substring match -> Levenshtein distance on Top 1k tracks. [03.01]
- [x] On-the-fly similarity calculation using `cosine_similarity` for the searched song vs the full dataset. [03.02]
- [x] Weighted similarity logic: `total_sim = 0.3 * audio_sim + 0.7 * genre_sim`. [03.02]
- [x] Recommendation output includes Title, Artist, Similarity %, and human-readable Reason. [03.03]
- [x] Final notebook narrative (student-toned) explaining the "why" behind the logic. [03.04]

### Evaluation & Polish

- [x] **EVAL-01**: Radar chart comparing input song vs. recommended songs across audio dimensions
- [x] **EVAL-02**: Calculate diversity score of the recommended queue
- [x] **EVAL-03**: Notebook is clean, student-toned markdown, well-structured — resume-ready

---

## v2 Requirements (Deferred)

- User listening history / taste profile for personalization
- Collaborative filtering (user-item matrix)
- Merging with `track_data_final.csv` for artist/album context
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
| DATA-01 | 01 | completed |
| DATA-02 | 01 | completed |
| DATA-03 | 01 | completed |
| EDA-01 | 02 | completed |
| EDA-02 | 02 | completed |
| EDA-03 | 02 | completed |
| EDA-04 | 02 | completed |
| MODEL-01 | — | pending |
| MODEL-02 | — | pending |
| MODEL-03 | — | pending |
| EVAL-01 | — | pending |
| EVAL-02 | — | pending |
| EVAL-03 | — | pending |
