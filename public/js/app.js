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
            // Hit our unified securely wrapped backend endpoint!
            const response = await fetch('http://127.0.0.1:8000/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ song_name: query, n: 5 })
            });
            const data = await response.json();

            if (data && data.error) {
                alert(data.error);
                return;
            }

            if (data && data.recommendations) {
                renderCards(data.recommendations);
            } else {
                alert("Error getting recommendations");
            }

        } catch (error) {
            console.error(error);
            alert("Something went wrong connecting to the backend server.");
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

    // --- YouTube Proxy System ---
    async function playOnYouTube(trackName, artists) {
        document.getElementById('now-playing-title').innerText = trackName;
        document.getElementById('now-playing-artist').innerText = artists;
        
        const searchString = `${trackName} ${artists} audio`;
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchString)}`;
        window.open(ytUrl, '_blank');
    }
});
