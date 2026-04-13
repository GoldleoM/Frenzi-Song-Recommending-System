# Research — Phase 3: Recommender Engine

## Implementation Research

### 1. Manual Levenshtein Distance (Typo Fallback)
- **Algorithm**: A standard Dynamic Programming approach using a 2D matrix or a optimized row-based approach.
- **Student Version**: 
  ```python
  def manual_levenshtein(s1, s2):
      if len(s1) < len(s2): return manual_levenshtein(s2, s1)
      if len(s2) == 0: return len(s1)
      previous_row = range(len(s2) + 1)
      for i, c1 in enumerate(s1):
          current_row = [i + 1]
          for j, c2 in enumerate(s2):
              insertions = previous_row[j + 1] + 1
              deletions = current_row[j] + 1
              substitutions = previous_row[j] + (c1 != c2)
              current_row.append(min(insertions, deletions, substitutions))
          previous_row = current_row
      return previous_row[-1]
  ```
- **Fuzzy Match Logic**: Iterate through `df['track_name']` and return the one with the minimum Levenshtein distance if substring matching fails.

### 2. Weighted Cosine Similarity
- **Efficiency**: Use `sklearn.metrics.pairwise.cosine_similarity`. Instead of a full matrix, compute `sims = cosine_similarity(input_vec, X)` where `X` is the full feature matrix. This returns a 1D array.
- **Weighting Logic**: 
  1. Extract audio columns (`num__*`) and genre columns (`cat__*`).
  2. Compute `audio_sim = cosine_similarity(input_audio, X_audio)`
  3. Compute `genre_sim = cosine_similarity(input_genre, X_genre)`
  4. Result: `total_sim = (w_audio * audio_sim) + (w_genre * genre_sim)`.
- **Note**: This ensures a song with the *exact* same genres but different audio features (or vice versa) is ranked predictably based on weights.

### 3. Recommendation Explanations ("Why?")
- **Logic**: Compare the recommendation feature vector $V_{rec}$ with the input $V_{in}$.
- **Approach**: 
  1. Calculate absolute differences for core audio features: `diffs = abs(V_in[audio] - V_rec[audio])`.
  2. Find the feature with the smallest difference (e.g., Energy diff = 0.01).
  3. **Genre Check**: If `w_genre` is high and genres match, the first reason is "Same Genre".
  4. Result string: "Matches genres and has very similar Energy."

### 4. Performance & Scale
- **Vectorization**: For 81k tracks, calculating `cosine_similarity` twice (audio + genre) and weighting them is extremely fast (~100ms) on a single CPU if using NumPy/Scikit-learn vectorized operations.
- **Search Optimization**: Substring matching (`str.contains`) is fast. The manual Levenshtein fallback should be limited to a subset or used sparingly as it's $O(N*M)$ where $M$ is the track count. **Optimization**: Only run Levenshtein on the top 1,000 "popularity" tracks if the search fails, or perform a simple character set overlap check first.

## Validation Architecture

- **Dimension 1 (Search)**: Typing "Crep" finds "Creep".
- **Dimension 2 (Scoring)**: Exact match distance is 1.0 (or 100%).
- **Dimension 3 (Weights)**: Adjusting `w_genre` to 1.0 results only in recommendations with identical genres.
- **Dimension 4 (Output)**: Final DataFrame includes "Similarity %" and a human-readable "Reason".

## Key Findings

- **Library**: No new libraries needed (NumPy/Sklearn already present).
- **Explanation**: The "Reason" adds a "wow" factor to the resume project.
- **Search**: Case-insensitivity is critical for `find_song`.
