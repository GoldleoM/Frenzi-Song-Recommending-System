---
wave: 1
depends_on: []
files_modified: ["export_model.py", "functions/main.py", "functions/requirements.txt"]
autonomous: true
---

# Plan 05: Convert Model to Firebase API

## Objective
Export the local scikit-learn recommendation logic into a lightweight `.joblib` file and expose it via a FastAPI backend wrapped in Firebase Cloud Functions Gen 2.

## Tasks

```xml
<task>
  <read_first>Untitled.ipynb, dataset.csv</read_first>
  <action>Create an `export_model.py` script in the project root.
The script MUST:
1. Load `dataset.csv` via pandas.
2. Drop NaNs exactly like the notebook did.
3. Apply `MinMaxScaler` on the audio features and `OneHotEncoder` on `track_genre` via `ColumnTransformer` to create a `feature_matrix`.
4. Slice a `df_meta` dataframe from `df` containing only: `track_id`, `track_name`, `artists`, `album_name`, `popularity`, `track_genre`.
5. Reset the index of `df_meta` to match `feature_matrix` rows perfectly.
6. Export the data dictionary `{"df_meta": df_meta, "feature_matrix": feature_matrix}` into a file named `functions/recommender_data.joblib` using the `joblib` library.
7. Print a success statement summarizing the shape of the exported data.</action>
  <acceptance_criteria>File `export_model.py` exists. The script creates `functions/recommender_data.joblib` when run without crashing.</acceptance_criteria>
</task>

<task>
  <read_first>export_model.py, Untitled.ipynb</read_first>
  <action>Set up the Firebase Cloud Functions environment in the `functions/` directory:
1. Create `functions/requirements.txt` with EXACT dependencies:
`firebase-functions`
`fastapi`
`scikit-learn`
`pandas`
`numpy`
`joblib`
2. Create `functions/main.py`.
The server script MUST:
- Include imports: FastAPI, CORSMiddleware, joblib, cosine_similarity from sklearn, pandas, numpy, and `https_fn` from `firebase_functions`.
- Instantiate `app = FastAPI()`.
- Add `CORSMiddleware` configured to allow all origins `["*"]`.
- Load the `recommender_data.joblib` file into variables `df_meta` and `feature_matrix` in the global scope (runs once on cold start).
- Implement the `recommend(song_name)` function logic (fuzzy matching via substring, computing `cosine_similarity` for that song against the whole matrix, grabbing top 5 results, excluding the song itself).
- Expose a `POST /recommend` endpoint that accepts `{"song_name": "string"}` and returns a JSON list of matches (e.g. `[{"track_name": "...", "artists": "...", "similarity": 0.95}, ...]`).
- Re-export the app for Firebase via: 
`@https_fn.on_request()`
`def api(req: https_fn.Request) -> https_fn.Response:`
    `return https_fn.asgi_app(app)(req)`
  </action>
  <acceptance_criteria>File `functions/requirements.txt` contains required libraries. File `functions/main.py` contains `https_fn.asgi_app(app)` and exposes `@app.post("/recommend")` endpoint.</acceptance_criteria>
</task>
```

## Verification
- Run `python export_model.py` resulting in a new `.joblib` file inside `functions/`.
- Ensure `functions/main.py` compiles without syntax errors.
- Ensure the API returns valid JSON structures dynamically without memory errors.
