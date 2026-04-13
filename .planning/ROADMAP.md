# Roadmap — Song Recommender v1

**Milestone:** v1 — Content-Based Recommendation Engine  
**Granularity:** Coarse  
**Total Phases:** 4  
**Requirements mapped:** 13 / 13 ✓

---

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-----------------|
| 1 | Data Pipeline | Merge datasets, clean data, engineer feature vectors | DATA-01, DATA-02, DATA-03 | 3 |
| 2 | EDA & Visualization | Understand audio feature distributions and relationships | EDA-01, EDA-02, EDA-03, EDA-04 | 3 |
| 3 | Recommender Engine | Build cosine similarity model, implement recommend() | MODEL-01, MODEL-02, MODEL-03 | 3 |
| 4 | Evaluation & Polish | Radar chart, diversity score, notebook cleanup | EVAL-01, EVAL-02, EVAL-03 | 3 |

---

## Phase 1: Data Pipeline

**Goal:** Load and clean `dataset.csv`, handle missing values, and engineer normalized feature vectors with one-hot encoded genres.

**Requirements:** DATA-01, DATA-02, DATA-03

**Plans:**
1. Load `dataset.csv` → inspect shape and dtypes
2. Deduplicate, drop rows with NaNs, clean track names/artists
3. Select audio feature columns, apply `MinMaxScaler`, apply one-hot encoding on `track_genre`

**Success Criteria:**
1. Merged DataFrame has no nulls in audio feature columns
2. Feature matrix shape is (n_tracks, n_features) with all values in [0, 1]
3. Track name + artist + genre columns preserved alongside feature matrix

**UI hint:** no  
**Depends on:** —

---

## Phase 2: EDA & Visualization

**Goal:** Produce 4+ visualizations that reveal the shape of the data — distributions, correlations, and genre clusters — using seaborn and matplotlib.

**Requirements:** EDA-01, EDA-02, EDA-03, EDA-04

**Plans:**
1. Histogram/KDE grid for danceability, energy, valence, tempo (seaborn `FacetGrid` or `displot`)
2. Correlation heatmap of all audio features (seaborn `heatmap` with annotation)
3. Top-20 genres bar chart + energy vs. valence scatter colored by genre

**Success Criteria:**
1. At least 4 distinct visualization cells, each with a 1–2 line markdown explanation above
2. Heatmap shows at least one strong correlation (|r| > 0.5) and labels are readable
3. Scatter plot distinguishes at least 5 genre clusters visually

**UI hint:** no  
**Depends on:** Phase 1

---

## Phase 3: Recommender Engine

**Goal:** Compute pairwise cosine similarity over feature vectors, implement `recommend(song_name, n=4)`, and render the queue as a styled output.

**Requirements:** MODEL-01, MODEL-02, MODEL-03

**Plans:**
1. Compute cosine similarity matrix with `sklearn.metrics.pairwise.cosine_similarity`
2. Implement `recommend(song_name, n=4)` — fuzzy song name match, extract top-N indices, return DataFrame with song, artist, genre, similarity score
3. Test with 3 diverse input songs; display results as formatted DataFrame

**Success Criteria:**
1. `recommend("Song Name")` runs without error and returns exactly N rows
2. All returned songs are different from the input and from each other
3. Similarity scores are in (0, 1] and sorted descending

**UI hint:** no  
**Depends on:** Phase 1

---

## Phase 4: Evaluation & Polish

**Goal:** Visualize why recommendations make sense (radar chart), quantify queue diversity, and polish the full notebook to resume-ready quality.

**Requirements:** EVAL-01, EVAL-02, EVAL-03

**Plans:**
1. Radar/spider chart: input song vs. each recommended song across 6 audio dimensions
2. Diversity score: compute mean pairwise cosine distance within the recommended queue
3. Full notebook review — consistent markdown tone (student voice), clean section flow, remove debug cells

**Success Criteria:**
1. Radar chart shows input song overlaid with recommendations across ≥ 6 audio features
2. Diversity score is printed as a float with a 1-line interpretation
3. Notebook reads top-to-bottom without orphaned cells or TODO comments

**UI hint:** no  
**Depends on:** Phase 3

### Phase 5: Convert model to API

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 4
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 5 to break down)

### Phase 6: make a website

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 5
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 6 to break down)

---

## Backlog (v2)

- **999.1** — User taste profile from listening history (personalized re-ranking)
- **999.2** — Collaborative filtering layer (user-item matrix)
- **999.3** — Model export to `.pkl`
- **999.4** — Interactive widget (ipywidgets) or Streamlit app
