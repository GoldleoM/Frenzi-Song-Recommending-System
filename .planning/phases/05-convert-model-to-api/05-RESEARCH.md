# Phase 5: Convert model to API - Research

## Objective
Identify how to successfully convert the existing Jupyter Notebook recommendation logic into a Firebase Gen 2 Cloud Function running FastAPI, with `scikit-learn` and pre-calculated data.

## Findings

### 1. Model & Data Extraction Strategy
The `song_recommender.ipynb` currently executes the following pipeline:
- Loads `dataset.csv` (114,000 rows)
- Cleans data and drops nulls
- Uses `ColumnTransformer` (with `MinMaxScaler` and `OneHotEncoder`) to yield a `feature_matrix`
- Defines `recommend(song_name)` which computes `cosine_similarity` dynamically between a queried song's vector and the full `feature_matrix`.

**To deploy effectively to a serverless Firebase function:** 
We cannot load the CSV and re-run the `ColumnTransformer` pipeline on every API request. Instead, we need a pre-deployment step (`export_model.py`) that performs this data prep and uses `joblib` to export:
1. `df_meta`: A sliced dataframe containing only the necessary metadata (`track_id`, `track_name`, `artists`, `track_genre`, `popularity`).
2. `feature_matrix`: The pre-computed NumPy array.

*Note on size*: 114,000 rows × ~125 features (due to OneHotEncoding) in `float64` consumes roughly ~114 MB. This fits well within Firebase Functions Gen 2 memory limits (which default to 256MB but can be set to 512MB or 1GB).

### 2. Firebase Cloud Functions (Gen 2) + Python + FastAPI
Firebase Gen 2 supports deploying Python functions. 
A typical structure looks like:
```text
functions/
├── main.py              # FastAPI app and Firebase wrapper
├── requirements.txt
└── recommender_data.joblib # The exported matrix/dataframe
```

**Firebase Wrapper Code Structure:**
```python
from firebase_functions import https_fn
from fastapi import FastAPI
import joblib

app = FastAPI()

# Load data at cold start (global scope)
data = joblib.load("recommender_data.joblib")
df_meta = data['df_meta']
feature_matrix = data['feature_matrix']

@app.post("/recommend")
def recommend_endpoint(req: dict):
    # similarity logic here
    pass

@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    return https_fn.asgi_app(app)(req)
```

### 3. Dependencies
The Firebase function will require:
- `firebase-functions>=0.1.0`
- `fastapi`
- `scikit-learn`
- `pandas`
- `numpy`
- `joblib`

### 4. Implementation Steps required for the CLI/Planner
1. Create `export_model.py` in the root that prepares and exports `recommender_data.joblib`.
2. Initialize Firebase Functions for Python (requires Firebase CLI or manual scaffolding of `functions/` directory).
3. Implement `main.py` inside `functions/` to load the joblib and expose the `/recommend` endpoint.
4. Implement CORS correctly (FastAPI `CORSMiddleware`).

## Validation Architecture
- **Unit/Local check**: Run the `export_model.py` and ensure the joblib file exists. 
- **Endpoint validation**: Use Firebase emulators or `fastapi dev` to launch the API locally and `curl -X POST` it.

## Conclusion
The approach is completely feasible. Scikit-learn + Pandas will operate under the 250MB deployment payload limit as long as we only export the minimal necessary artifacts.
