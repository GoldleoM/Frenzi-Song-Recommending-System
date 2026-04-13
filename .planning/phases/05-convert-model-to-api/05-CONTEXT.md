# Phase 5: Convert model to API - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Wrapping the recommender logic into a servable web API hosted on Firebase so it can be consumed by the future website.
</domain>

<decisions>
## Implementation Decisions

### API Framework & Hosting
- **D-01:** Use **Firebase Cloud Functions (2nd gen) with Python** + **FastAPI**. Supports scikit-learn without rewriting logic in Node.js.

### Data & Model Loading Strategy
- **D-02:** Export the trained model/feature matrix to a **`.pkl` (Pickle) file**. The Firebase function will load this file for fast, serverless cold starts instead of fully rebuilding via the CSV pipeline per request.

### Endpoint Design & Payload
- **D-03:** A single HTTPS trigger endpoint (e.g., `POST /recommend` or `GET /recommend`) returning the recommendation queue as JSON.

### Web Integration Constraints
- **D-04:** Use standard CORS and test via the **Firebase Local Emulator Suite** for local website development.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Logic & Scikit-learn
- `dataset.csv` — Feature matrix origin.
- `Untitled.ipynb` / existing python scripts — Source of the similarity calculation logic.
- Requirements state keeping scikit-learn and no deep learning. Firebase Cloud Functions (2nd Gen) for Python satisfies this.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `refactor_notebook.py` and the main notebook hold the data pipeline and recommendation algorithm code needing extraction.

### Established Patterns
- We rely strictly on scikit-learn preprocessing and cosine similarity metric arrays.
</code_context>

<specifics>
## Specific Ideas

- The user specifically requested Firebase as the backend ("i want firebase as my backend").
- We must provide a script to export the current model state into a `.pkl` file first, then build the Firebase function to consume that pickle file.
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 05-convert-model-to-api*
*Context gathered: 2026-04-13*
