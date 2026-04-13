# Plan — Phase 1: Data Pipeline

**Goal:** Load and clean `dataset.csv`, handle missing values, and engineer normalized feature vectors with one-hot encoded genres.

---

## Frontmatter

- **Phase:** 01
- **Wave:** 1
- **Depends on:** —
- **Files modified:**
  - `song_recommender.ipynb` [NEW]
- **Autonomous:** true

---

## Tasks

<task>
<id>01.01</id>
<title>Setup and Data Loading</title>
<action>
Create `song_recommender.ipynb`. Complete the first cell with imports: `pandas`, `numpy`, `matplotlib.pyplot`, `seaborn`, and from sklearn: `MinMaxScaler` and `OneHotEncoder`. In the second cell, load `dataset.csv` using `pd.read_csv('dataset.csv', index_col=0)`.
</action>
<read_first>
- dataset.csv
</read_first>
<acceptance_criteria>
- `song_recommender.ipynb` exists.
- The notebook can load the dataset without an "Unnamed: 0" column in the head.
- Library imports are present and correct.
</acceptance_criteria>
</task>

<task>
<id>01.02</id>
<title>Data Cleaning and Deduplication</title>
<action>
Implement cleaning logic in the notebook:
1. Drop rows where any audio feature is NaN (user context: exactly 1 expected).
2. Sort the DataFrame by `popularity` (descending).
3. Drop duplicates based on `['track_name', 'artists']`, keeping the first.
4. Normalize `track_genre` to lowercase and stripped of whitespace.
</action>
<read_first>
- .planning/phases/01-data-pipeline/01-RESEARCH.md
</read_first>
<acceptance_criteria>
- The single row with NaNs is removed.
- `df.duplicated(subset=['track_name', 'artists']).sum()` returns 0.
- All genres in the `track_genre` column are clean.
</acceptance_criteria>
</task>

<task>
<id>01.03</id>
<title>Feature Engineering Pipeline</title>
<action>
Implement the scaling and encoding steps:
1. Use `MinMaxScaler` on the columns: `danceability`, `energy`, `key`, `loudness`, `mode`, `speechiness`, `acousticness`, `instrumentalness`, `liveness`, `valence`, `tempo`.
2. Use `OneHotEncoder(sparse_output=False)` on the `track_genre` column.
3. Concatenate the scaled numerical features with the one-hot encoded genre DataFrame.
</action>
<read_first>
- .planning/phases/01-data-pipeline/01-CONTEXT.md
</read_first>
<acceptance_criteria>
- Numerical features are strictly within [0, 1].
- Genre columns are binary (0, 1).
- The final feature matrix shape matches (n_tracks, n_audio_features + n_genre_features).
</acceptance_criteria>
</task>

<task>
<id>01.04</id>
<title>Markdown Handoff and Style Polish</title>
<action>
Add markdown cells before each code cell using a "student-toned" voice (as decided in PROJECT.md). 
Example: "I'll start by loading the dataset. I noticed an unnamed index column, so I'll handle that right away."
Ensure no professional/AI-sounding 'Key Takeaways' or corporate-style formatting.
</action>
<read_first>
- .planning/PROJECT.md
</read_first>
<acceptance_criteria>
- Notebook contains at least 3 markdown cells with human-sounding explanations.
- No "AI buzzwords" or corporate summaries in the narrative.
</acceptance_criteria>
</task>

---

## Verification Criteria

### Automated Tests
- `assert df.isna().sum().sum() == 0`
- `assert df_final.shape[1] > 11` (genres added)
- `assert df_final[audio_cols].max().max() <= 1.0`

### Manual Verification
- Visual check of the first 5 rows of the feature matrix to ensure scaling looks correct.
- Verify "student tone" by reading the notebook markdown aloud.

---

## Must Haves

1. [ ] Correct loading of `dataset.csv` without unnamed index.
2. [ ] Successful deduplication keeping the most popular tracks.
3. [ ] One-hot encoded genres and MinMaxScalered audio features.
4. [ ] Clean, student-toned narrative in markdown.
