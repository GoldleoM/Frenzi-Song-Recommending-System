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
            'playsinline': 1
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
        recommendationList.innerHTML = '';
        
        recommendations.forEach((rec, index) => {
            const item = document.createElement('div');
            item.className = 'track-item';
            item.innerHTML = `
                <div class="track-item-num">${index + 1}</div>
                <div class="track-item-art"><i class="fa-solid fa-music"></i></div>
                <div class="track-item-info">
                    <div class="track-item-title">${rec.track_name}</div>
                    <div class="track-item-artist">${rec.artists} <span style="opacity: 0.6; margin-left: 5px;">• ${rec.reason || 'Similar vibes'}</span></div>
                </div>
                <div class="track-item-match">${rec.similarity_percent || (rec.similarity * 100).toFixed(0)}%</div>
            `;
            
            item.addEventListener('click', () => playOnYouTube(rec.track_name, rec.artists));
            recommendationList.appendChild(item);
        });
    }

    const mediaPlayerBar = document.getElementById('media-player-bar');
    const mediaTitle = document.getElementById('media-title');
    const mediaArtist = document.getElementById('media-artist');
    const mediaPlayPauseBtn = document.getElementById('media-play-pause');
    const mediaArtIcon = document.getElementById('media-art-icon');
    let isPlaying = false;

    async function playOnYouTube(trackName, artists) {
        // Show loading state in media bar
        mediaPlayerBar.classList.remove('hidden');
        mediaTitle.innerText = "Loading Audio...";
        mediaArtist.innerText = `${trackName} • ${artists}`;
        mediaArtIcon.className = "fa-solid fa-circle-notch fa-spin";
        
        try {
            const response = await fetch('http://127.0.0.1:8000/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ track_name: trackName, artists: artists })
            });
            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
                mediaTitle.innerText = "Error Loading";
                mediaArtIcon.className = "fa-solid fa-music";
                return;
            }
            
            if (data.videoId && ytPlayer) {
                mediaTitle.innerText = trackName;
                mediaArtIcon.className = "fa-solid fa-music";
                
                ytPlayer.loadVideoById(data.videoId);
                isPlaying = true;
                updatePlayStateUI();
            }
        } catch (error) {
            console.error(error);
            mediaTitle.innerText = "Error";
            mediaArtIcon.className = "fa-solid fa-music";
        }
    }

    mediaPlayPauseBtn.addEventListener('click', () => {
        if (!ytPlayer) return;
        
        if (isPlaying) {
            ytPlayer.pauseVideo();
            isPlaying = false;
        } else {
            ytPlayer.playVideo();
            isPlaying = true;
        }
        updatePlayStateUI();
    });

    function updatePlayStateUI() {
        if (isPlaying) {
            mediaPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            document.querySelector('.media-art').classList.add('spinning');
            document.getElementById('media-progress-filled').style.width = "70%"; // Aesthetic fake progress
        } else {
            mediaPlayPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            document.querySelector('.media-art').classList.remove('spinning');
        }
    }

    function shiftBackgroundColors(seedString) {
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
