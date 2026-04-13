document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const loader = document.getElementById('loader');
    
    const matchSection = document.getElementById('match-section');
    const matchedSongEl = document.getElementById('matched-song');
    const matchedArtistEl = document.getElementById('matched-artist');
    const heroPlayBtn = document.getElementById('hero-play');
    
    const recommendationsSection = document.getElementById('recommendations-section');
    const recommendationList = document.getElementById('recommendation-list');

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    async function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        // Reset UI
        matchSection.classList.add('hidden');
        recommendationsSection.classList.add('hidden');
        recommendationList.innerHTML = '';
        loader.classList.remove('hidden');

        try {
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
                // Populate Hero Mask
                matchedSongEl.innerText = data.matched_song;
                matchedArtistEl.innerText = data.matched_artists;
                matchSection.classList.remove('hidden');
                
                // Attach play logic to hero
                heroPlayBtn.onclick = () => playOnYouTube(data.matched_song, data.matched_artists);

                // Populate List
                renderList(data.recommendations);
                recommendationsSection.classList.remove('hidden');
                
                // Shift background colors uniquely based on song length/name to simulate Apple Music
                shiftBackgroundColors(data.matched_song);

            } else {
                alert("Error getting recommendations");
            }

        } catch (error) {
            console.error(error);
            alert("Ensure the backend API is running.");
        } finally {
            loader.classList.add('hidden');
        }
    }

    function renderList(recommendations) {
        recommendations.forEach((rec, index) => {
            const item = document.createElement('div');
            item.className = 'track-item';
            item.innerHTML = `
                <div class="track-item-num">${index + 1}</div>
                <div class="track-item-art"><i class="fa-solid fa-music"></i></div>
                <div class="track-item-info">
                    <div class="track-item-title">${rec.track_name}</div>
                    <div class="track-item-artist">${rec.artists}</div>
                </div>
                <div class="track-item-match">${(rec.similarity * 100).toFixed(0)}%</div>
            `;
            
            item.addEventListener('click', () => playOnYouTube(rec.track_name, rec.artists));
            recommendationList.appendChild(item);
        });
    }

    function playOnYouTube(trackName, artists) {
        const searchString = `${trackName} ${artists} audio`;
        const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchString)}`;
        window.open(ytUrl, '_blank');
    }

    function shiftBackgroundColors(seedString) {
        // Generate pseudo-random HSL colors based on the string
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const h1 = Math.abs(hash % 360);
        const h2 = Math.abs((hash * 2) % 360);
        const h3 = Math.abs((hash * 3) % 360);

        document.documentElement.style.setProperty('--clr-1', `hsl(${h1}, 80%, 50%)`);
        document.documentElement.style.setProperty('--clr-2', `hsl(${h2}, 80%, 45%)`);
        document.documentElement.style.setProperty('--clr-3', `hsl(${h3}, 80%, 60%)`);
    }
});
