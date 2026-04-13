// Replace these with your actual Spotify Developer Credentials
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET = 'YOUR_SPOTIFY_CLIENT_SECRET';

let spotifyAccessToken = '';

// YouTube IFrame Player
let ytPlayer;
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        videoId: '',
        playerVars: {
            'autoplay': 1,
            'controls': 0,
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log("YouTube Player is ready");
}

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const cardsGrid = document.getElementById('recommendation-cards');
    const loader = document.getElementById('loader');

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') handleSearch();
    });

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        cardsGrid.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            // First, try our internal database!
            let response = await fetch('http://127.0.0.1:8000/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ song_name: query, n: 5 })
            });
            let data = await response.json();

            // If found in internal DB
            if (data && data.recommendations && !data.error) {
                renderCards(data.recommendations);
                loader.classList.add('hidden');
                return;
            }

            // If not found, use Spotify + External recommendation
            console.log("Song not found in internal DB. Trying Spotify...");
            await fetchSpotifyToken();
            const spotifyTrack = await searchSpotifyTrack(query);
            
            if (!spotifyTrack) {
                alert("Song not found on Spotify either!");
                loader.classList.add('hidden');
                return;
            }

            const features = await getSpotifyAudioFeatures(spotifyTrack.id);
            if (!features) {
                alert("Failed to get audio features from Spotify");
                loader.classList.add('hidden');
                return;
            }

            // POST to our NEW external endpoint
            response = await fetch('http://127.0.0.1:8000/recommend/external', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    song_name: spotifyTrack.name,
                    artists: spotifyTrack.artists[0].name,
                    danceability: features.danceability,
                    energy: features.energy,
                    key: features.key,
                    loudness: features.loudness,
                    mode: features.mode,
                    speechiness: features.speechiness,
                    acousticness: features.acousticness,
                    instrumentalness: features.instrumentalness,
                    liveness: features.liveness,
                    valence: features.valence,
                    tempo: features.tempo,
                    n: 5
                })
            });

            data = await response.json();
            if (data && data.recommendations) {
                renderCards(data.recommendations);
            } else {
                alert("Error getting external recommendations");
            }

        } catch (error) {
            console.error(error);
            alert("Something went wrong connecting to the database.");
        } finally {
            loader.classList.add('hidden');
        }
    }

    function renderCards(recommendations) {
        cardsGrid.innerHTML = '';
        
        recommendations.forEach(rec => {
            const card = document.createElement('div');
            card.className = 'card glass';
            card.innerHTML = `
                <div class="album-art-placeholder">🎵</div>
                <div class="card-title">${rec.track_name}</div>
                <div class="card-artist">${rec.artists}</div>
                <div class="card-similarity">${(rec.similarity * 100).toFixed(1)}% Match</div>
            `;
            
            card.addEventListener('click', () => playOnYouTube(rec.track_name, rec.artists));
            cardsGrid.appendChild(card);
        });
    }

    // --- Spotify Integrations ---

    async function fetchSpotifyToken() {
        if(spotifyAccessToken) return spotifyAccessToken;
        if(SPOTIFY_CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID') {
            alert("Spotify credentials not set! Check app.js.");
            throw new Error("Missing Spotify Credentials");
        }

        const authParams = new URLSearchParams({
            grant_type: 'client_credentials'
        });

        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: authParams
        });
        const data = await res.json();
        spotifyAccessToken = data.access_token;
    }

    async function searchSpotifyTrack(query) {
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
            headers: { 'Authorization': `Bearer ${spotifyAccessToken}` }
        });
        const data = await res.json();
        if(data.tracks && data.tracks.items.length > 0) {
            return data.tracks.items[0];
        }
        return null;
    }

    async function getSpotifyAudioFeatures(trackId) {
        const res = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            headers: { 'Authorization': `Bearer ${spotifyAccessToken}` }
        });
        return await res.json();
    }

    // --- YouTube API ---
    // Note: To properly fetch video IDs, you need the YouTube Data API v3. 
    // This is a simple mock/iframe hijack to pretend we are searching, 
    // but in reality we'd need an API call to get the specific video ID to load.
    async function playOnYouTube(trackName, artists) {
        document.getElementById('now-playing-title').innerText = trackName;
        document.getElementById('now-playing-artist').innerText = artists;
        
        // Normally: Fetch `https://www.googleapis.com/youtube/v3/search` for video ID
        console.log(`Pretending to play: ${trackName} by ${artists}`);
        
        // Let's just open a youtube search window as a fallback 
        // since we don't have a YouTube API key to get valid videoIds for the iframe.
        const searchString = `${trackName} ${artists} audio`;
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchString)}`;
        window.open(ytUrl, '_blank');
    }
});
