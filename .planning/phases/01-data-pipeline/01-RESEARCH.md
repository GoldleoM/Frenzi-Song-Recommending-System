# Research — Phase 1: Data Pipeline

## Implementation Research

### 1. Data Loading (Pandas)
- **Problem**: `dataset.csv` has an unnamed first column containing indices.
- **Solution**: Load using `pd.read_csv('dataset.csv', index_col=0)`. This prevents the creation of an redundant `Unnamed: 0` column.
- **Data Types**: Explicitly handle the `;` separator in the `artists` column if needed, but for Phase 1, treating it as a literal string is sufficient for deduplication.

### 2. Deduplication Strategy
- **Logic**: Deduplicate based on a combined key of `track_name` and `artists`.
- **Method**: 
  1. Sort by `popularity` descending.
  2. Use `df.drop_duplicates(subset=['track_name', 'artists'], keep='first')`.
- **Rationale**: Keeps the best-known version of a song (e.g., the original album version over a single or compilation version).

### 3. One-Hot Encoding
- **Tool**: `sklearn.preprocessing.OneHotEncoder` is preferred over `pd.get_dummies` for a "ML Resume" project.
- **Reasoning**: It generates a sparse matrix which is memory efficient and integrates better with `scikit-learn` pipelines/transformers (shows better ML hygiene).
- **Genre Cleanup**: Ensure `track_genre` strings are trimmed and lowercased before encoding to avoid `pop ` vs `pop` issues.

### 4. Feature Scaling & Integration
- **Scaling**: `MinMaxScaler` is the project constraint. Apply to: `danceability`, `energy`, `key`, `loudness`, `mode`, `speechiness`, `acousticness`, `instrumentalness`, `liveness`, `valence`, `tempo`.
- **Combination**: Use `scipy.sparse.hstack` or convert the scaled features to a DataFrame and `pd.concat` with the one-hot encoded genre DataFrame. For a resume project, keeping it as a combined pandas DataFrame for EDA (Phase 2) before converting to a similarity matrix (Phase 3) is most readable.

### 5. Writing Style (Student Tone)
- **Markdown Headers**: Keep them active ("Step 1: Cleaning our data", "Let's handle the categorical features").
- **Explanations**: Avoid "This section performs data normalization." Instead, use "I'm scaling the features to a 0-1 range so the similarity model doesn't get biased by larger values like Tempo or Loudness."

## Validation Architecture

- **Dimension 1 (Input)**: `dataset.csv` exists and is readable.
- **Dimension 2 (Shape)**: Final feature matrix has the same number of rows as the cleaned metadata DataFrame.
- **Dimension 3 (Range)**: `assert df[features].max().max() <= 1.0` and `min() >= 0.0`.
- **Dimension 4 (Encodings)**: Verify no duplicate columns in one-hot matrix.

## Key Findings

- **Library**: `scikit-learn`'s `MinMaxScaler` and `OneHotEncoder` are the core tools.
- **Gotcha**: The `;` in artists needs to be consistent for deduplication to work (strip whitespace).
- **Recommendation**: Write a helper function for the pipeline to make the notebook modular.
