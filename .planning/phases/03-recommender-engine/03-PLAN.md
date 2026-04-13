# Plan — Phase 3: Recommender Engine

**Goal:** Implement the on-the-fly similarity engine with fuzzy search, weighted genre-audio logic, and recommendation explanations.

---

## Frontmatter

- **Phase:** 03
- **Wave:** 1
- **Depends on:** Phase 02
- **Files modified:**
  - `song_recommender.ipynb` [MODIFY]
- **Autonomous:** true

---

## Tasks

<task>
<id>03.01</id>
<title>Manual Fuzzy Search Implementation</title>
<action>
Add the search logic to `song_recommender.ipynb`:
1. Implement `manual_levenshtein(s1, s2)` based on the DP research.
2. Implement `find_song(query)`:
   - First, try case-insensitive substring matching.
   - If multiple found, return the most popular one.
   - If none found, calculate Levenshtein distance for all tracks (limit to top 1000 popular tracks for speed) and return the closest match.
</action>
<read_first>
- .planning/phases/03-recommender-engine/03-RESEARCH.md
- song_recommender.ipynb
</read_first>
<acceptance_criteria>
- `find_song("crep")` returns "Creep".
- Searching for a substring like "Starboy" returns the correct track.
</acceptance_criteria>
</task>

<task>
<id>03.02</id>
<title>On-the-Fly Weighted Similarity</title>
<action>
Implement the core scoring engine:
1. Define a function `get_recommendations(target_idx, w_audio=0.3, w_genre=0.7)`:
   - Extract the target vector for audio (`num__*`) and genre (`cat__*`).
   - Run `cosine_similarity` for the target audio vs all other tracks' audio.
   - Run `cosine_similarity` for the target genre vs all other tracks' genre.
   - Combine scores using weights.
   - Return top N indices (excluding target_idx).
</action>
<read_first>
- .planning/phases/03-recommender-engine/03-CONTEXT.md
</read_first>
<acceptance_criteria>
- Returns exactly N unique indices.
- Similarity scores are between 0 and 1.
- Logic uses on-the-fly calculation (no global matrix used).
</acceptance_criteria>
</task>

<task>
<id>03.03</id>
<title>Explanation and Output Engine</title>
<action>
Build the final recommendation UI:
1. Implement a helper to generate "Reasons":
   - If genres match: "Same genre".
   - If energy/valence differences are < 0.1: "Similar vibe/energy".
2. Implement the master `recommend(song_name, n=5)` function.
3. Use Pandas styling to present the results: Track, Artist, Genre, Similarity (%), and Reason.
</action>
<read_first>
- .planning/phases/03-recommender-engine/03-RESEARCH.md
</read_first>
<acceptance_criteria>
- Output is a clean DataFrame with a "Reason" column.
- Similarity is shown as a percentage (e.g., "96.4%").
- Recommendations make sense (similar genres/moods).
</acceptance_criteria>
</task>

<task>
<id>03.04</id>
<title>Markdown Documentation (Final Polish)</title>
<action>
Add student-toned markdown before each function explaining:
- Why we're using "on-the-fly" similarity (memory).
- How the fuzzy search fallback works (Levenshtein).
- Why we weight genres higher than audio features.
</action>
<read_first>
- .planning/PROJECT.md
</read_first>
<acceptance_criteria>
- Narrative feels like it was written by a student explaining their work.
- Technical terms (cosine similarity, DP) are used correctly but concisely.
</acceptance_criteria>
</task>

---

## Verification Criteria

### Automated Tests
- `assert find_song("radiohead")` (searching artist/name hybrid)
- `assert len(recommend("Creep")) == 5`
- `result['Similarity (%)'].max() <= 100`

### Manual Verification
- Test with 3 distinct songs (e.g., a Classical track, a Heavy Metal track, and a Pop track).
- Ensure Classical doesn't recommend Metal (checks genre weighting).

---

## Must Haves

1. [ ] Manual Levenshtein search fallback.
2. [ ] Weighted audio/genre similarity formula.
3. [ ] Memory-efficient "on-the-fly" query logic.
4. [ ] Reason/Explanation column in output.
5. [ ] Student-toned narrative throughout.
