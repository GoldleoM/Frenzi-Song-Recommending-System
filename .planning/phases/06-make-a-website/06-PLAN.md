---
wave: 1
depends_on: []
files_modified: ["export_model.py", "functions/main.py"]
autonomous: true
---

# Plan 06-01: Update ML API for External Songs

## Objective
Modify the current Phase 5 ML artifacts, export script, and Firebase backend function to handle raw external streaming data. Wait for frontend Spotify features.

## Tasks
```xml
<task>
  <read_first>export_model.py</read_first>
  <action>Open `export_model.py`. Update the `OneHotEncoder` setup inside `ColumnTransformer` to include `handle_unknown='ignore'`. When dumping the joblib file at the end, also include the mathematical `pipeline` object in the dictionary (`data_to_export['pipeline'] = pipeline`). Run the script.</action>
  <acceptance_criteria>The joblib export includes the `pipeline` key, and the script runs fully without `NaN` or indexing errors.</acceptance_criteria>
</task>

<task>
  <read_first>functions/main.py</read_first>
  <action>Add a `/recommend/external` endpoint in `functions/main.py`. This endpoint should accept an array of audio features from the Frontend. Take that array, shove it into a `pandas.DataFrame` mimicking the shape of the audio features, pass it to `pipeline.transform(df)`, and execute `cosine_similarity(target_vector, feature_matrix)`. It must return the 5 closest Database songs.</action>
  <acceptance_criteria>The backend restarts without errors and successfully executes logic on external inputs via cURL tests.</acceptance_criteria>
</task>
```

---
wave: 2
depends_on: ["06-01"]
files_modified: ["public/index.html", "public/css/style.css"]
autonomous: true
---

# Plan 06-02: Frontend UI Structure (Vanilla HTML/CSS)

## Objective
Create the static frame representing the Spotify/Apple Music blended user interface architecture using native web technologies.

## Tasks
```xml
<task>
  <action>Create a `public/` directory with `index.html` and `css/style.css`.
Write the structural DOM that mimics a standard music application: Top Search bar, main display area (for song search results, loaded artist/img), and a bottom Player UI. Use CSS flexbox/grid for responsiveness. Set the primary background to a very dark `#0a0a0a`. Apply structural classes.</action>
  <acceptance_criteria>A browser opening `index.html` showcases a static structural representation of the music interface.</acceptance_criteria>
</task>

<task>
  <read_first>public/css/style.css</read_first>
  <action>Upgrade `style.css` using the Apple Music glassmorphism aesthetic. Wrap key components (sidebar, player bar) in frosted semi-transparent layers heavily utilizing CSS properties like `backdrop-filter: blur(25px)` over `rgba(50, 50, 50, 0.4)`. Add subtle animated gradients in the background to bring the aesthetic to life. Style simple input bars to fit modern aesthetics.</action>
  <acceptance_criteria>The static page has visually distinct vibrant blurs and shadows akin to premium mobile-first designs.</acceptance_criteria>
</task>
```

---
wave: 3
depends_on: ["06-02"]
files_modified: ["public/js/app.js"]
autonomous: true
---

# Plan 06-03: Vanilla Frontend Application Logic

## Objective
Wire the DOM to interface simultaneously with Spotify, YouTube, and the local ML backend.

## Tasks
```xml
<task>
  <action>Create `public/js/app.js`. Implement a standard listener on the search bar. When triggered, the application uses the Spotify API `client_credentials` grant structure (using credentials inserted into the frontend variables or via prompt) to query `/v1/search`. Pick the top track, extract its `id`, call `/v1/audio-features`, and extract the JSON variables.</action>
  <acceptance_criteria>Console logs prove the extraction of the audio features from Spotify.</acceptance_criteria>
</task>

<task>
  <action>In `public/js/app.js`, take those audio features from the Spotify step and immediately `POST` them to our local backend `http://127.0.0.1:8000/recommend/external`. Use the return (array of 5 objects containing recommended `track_name` and `artists`) to dynamically spawn HTML Cards into the DOM results section using template literals or `document.createElement()`</action>
  <acceptance_criteria>A user search physically populates the page with 5 cards recommended by the Sklearn Model.</acceptance_criteria>
</task>

<task>
  <action>Inside the new cards, add event listeners. If clicked, launch a dynamic `<iframe>` loading the YouTube player API endpoint. (Given the complexity of direct audio stream fetching on YouTube, an alternative is just constructing the public `https://www.youtube.com/results?search_query=` or embedding YouTube IFrame using a manual `videoId`). Implement basic proxy search logic to hook up the recommended song to a YouTube search output.</action>
  <acceptance_criteria>The interface is somewhat functional for playing output via click interactions using YouTube parameters.</acceptance_criteria>
</task>
```
