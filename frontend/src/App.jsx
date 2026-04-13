import React, { useState, useRef, useCallback, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Search, Play, Pause, Disc3, ArrowRight, SkipForward, SkipBack, Volume2, VolumeX, ChevronDown, Radio, Music2, Sparkles, Monitor, Image as ImageIcon, AlignLeft } from 'lucide-react';
import './firebase';
 
// Change this to your Render URL after deployment
const API_BASE = import.meta.env.MODE === 'development' 
  ? '/api' 
  : 'https://frenzi-api.onrender.com'; 


function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [targetSong, setTargetSong] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  
  const [youtubeId, setYoutubeId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingTrack, setPlayingTrack] = useState({ name: '', artist: '', reason: '', similarity: 0 });
  const [playingTrackIndex, setPlayingTrackIndex] = useState(null);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState({}); // { "trackName|||artist": videoId }
  const [playHistory, setPlayHistory] = useState([]); // Track names of all played songs
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState(-1);
  const [fetchingIds, setFetchingIds] = useState(new Set()); // Track what's currently being fetched
  const [showVideo, setShowVideo] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  
  const playerRef = useRef(null);
  const progressInterval = useRef(null);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);
  const isSeeking = useRef(false);
  const searchBarRef = useRef(null);
  const isInitialMount = useRef(true);
  const isRestoring = useRef(true);
  const searchDebounce = useRef(null);
  const touchStartY = useRef(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    // Restore state from localStorage on mount
    const saved = localStorage.getItem('song_recommender_session');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        if (state.targetSong) setTargetSong(state.targetSong);
        if (state.recommendations) setRecommendations(state.recommendations);
        if (state.youtubeId) setYoutubeId(state.youtubeId);
        if (state.playingTrack) setPlayingTrack(state.playingTrack);
        if (state.playingTrackIndex !== undefined) setPlayingTrackIndex(state.playingTrackIndex);
        if (state.volume !== undefined) setVolume(state.volume);
        if (state.playHistory) setPlayHistory(state.playHistory);
        if (state.currentTime) setCurrentTime(state.currentTime);
        if (state.thumbnails) {
          // MIGRATE: Ensure all restored keys are normalized to the new lowercase format
          const migrated = {};
          Object.entries(state.thumbnails).forEach(([key, vid]) => {
            if (key.includes('|||')) {
               const [n, a] = key.split('|||');
               migrated[thumbKey(n, a)] = vid;
            } else {
               migrated[key] = vid;
            }
          });
          setThumbnails(migrated);
        }
        if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying);
        if (state.isNowPlayingOpen !== undefined) setIsNowPlayingOpen(state.isNowPlayingOpen);
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage on every change
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    const state = {
      targetSong,
      recommendations,
      youtubeId,
      playingTrack,
      playingTrackIndex,
      volume,
      playHistory,
      currentTime,
      thumbnails,
      isPlaying,
      isNowPlayingOpen
    };
    localStorage.setItem('song_recommender_session', JSON.stringify(state));
  }, [targetSong, recommendations, youtubeId, playingTrack, playingTrackIndex, volume, playHistory, currentTime, thumbnails, isPlaying, isNowPlayingOpen]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Standardized key for thumbnail caching (Case-insensitive to prevent mismatches)
const thumbKey = (name, artist) => {
  const n = String(name || '').toLowerCase().trim();
  const a = String(artist || '').toLowerCase().trim();
  return `${n}|||${a}`;
};

  // --- SEARCH SUGGESTIONS ---
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setFocusedSuggestion(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (e) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  useEffect(() => {
    setLyrics(null);
    setShowLyrics(false);
  }, [playingTrack?.name, playingTrack?.artist]);

  const selectSuggestion = (suggestion) => {
    setQuery(suggestion.track_name);
    setSuggestions([]);
    setShowSuggestions(false);
    // Auto-submit search with this song
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setTargetSong(null);
    fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        song_name: suggestion.track_name, 
        artist: suggestion.artists, 
        n: 5, 
        exclude: playHistory 
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        const seed = { 
          name: data.matched_song, 
          artist: data.matched_artists,
          image_url: data.image_url || null,
          fallback: data.fallback || false
        };
        setTargetSong(seed);
        setRecommendations(data.recommendations || []);
        fetchThumbnails(seed, data.recommendations || []);
      })
      .catch(() => setError('Ensure the backend API is running.'))
      .finally(() => setLoading(false));
  };

  const handleSearchKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && focusedSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[focusedSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isNowPlayingOpen) {
          setIsNowPlayingOpen(false);
        } else if (showSuggestions) {
          setShowSuggestions(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNowPlayingOpen, showSuggestions]);

  // --- FETCH THUMBNAILS (BATCH & PERSIST) ---
  const fetchThumbnails = async (seed, recs) => {
    const allTracks = [];
    if (seed) allTracks.push({ track_name: seed.name, artists: seed.artist });
    if (recs) recs.forEach(r => allTracks.push({ track_name: r.track_name, artists: r.artists }));

    // Stagger the loading to prevent request drops
    for (const t of allTracks) {
      const key = thumbKey(t.track_name, t.artists);
      if (thumbnails[key] || fetchingIds.has(key)) continue;

      setFetchingIds(prev => new Set(prev).add(key));
      
      try {
        const res = await fetch(`${API_BASE}/play`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ track_name: t.track_name, artists: t.artists })
        });
        const data = await res.json();
        
        if (data.videoId) {
          setThumbnails(prev => ({ ...prev, [key]: data.videoId }));
        }
      } catch (e) {
        console.warn("Failed to fetch thumbnail for", t.track_name);
      } finally {
        setFetchingIds(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        // Small delay between requests to be gentle on the server
        await new Promise(r => setTimeout(r, 100));
      }
    }
  };

  // --- SEARCH ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setRecommendations([]);
    setTargetSong(null);
    setSuggestions([]);
    setShowSuggestions(false);

    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_name: query, n: 5, exclude: playHistory })
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      const seed = { 
        name: data.matched_song, 
        artist: data.matched_artists,
        image_url: data.image_url || null,
        fallback: data.fallback || false
      };
      setTargetSong(seed);
      setRecommendations(data.recommendations || []);
      fetchThumbnails(seed, data.recommendations || []);

    } catch (err) {
      console.error(err);
      setError("Ensure the backend API is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- INFINITY RADIO ---
  const handleStartRadio = async (trackName, artist) => {
    setLoading(true);
    setRecommendations([]);
    try {
      const response = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ song_name: trackName, n: 5, exclude: playHistory })
      });
      const data = await response.json();
      if (data.recommendations) {
        const seed = { 
          name: data.matched_song, 
          artist: data.matched_artists,
          image_url: data.image_url,
          fallback: data.fallback || false
        };
        setRecommendations(data.recommendations);
        setTargetSong(seed);
        fetchThumbnails(seed, data.recommendations);
        handlePlayCard(data.recommendations[0].track_name, data.recommendations[0].artists, 0, data.recommendations[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- PLAY ---
  const handlePlayCard = async (trackName, artist, index, recData = null) => {
    setPlayingTrack({ 
      name: trackName, 
      artist, 
      image_url: recData?.image_url || (index === -1 ? targetSong?.image_url : null),
      reason: recData?.reason || '', 
      similarity: recData?.similarity_percent || (recData?.similarity ? (recData.similarity * 100).toFixed(0) : 0) 
    });
    setPlayingTrackIndex(index);
    
    // Track this song in play history to avoid re-recommending it
    setPlayHistory(prev => {
      const normalized = trackName.toLowerCase().trim();
      if (prev.some(h => h.toLowerCase().trim() === normalized)) return prev;
      return [...prev, trackName];
    });

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    isRestoring.current = false; // Never restore time for a song clicked by user

    if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
    }

    // 1. Check local cache first (Saves Quota)
    const key = thumbKey(trackName, artist);
    if (thumbnails[key]) {
      setYoutubeId(thumbnails[key]);
      setIsPlaying(true);
      return;
    }

    // 2. Otherwise fetch on-demand
    setYoutubeId(null);
    setIsPlaying(false);

    try {
      const response = await fetch(`${API_BASE}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_name: trackName, artists: artist })
      });
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }
      
      if (data.videoId) {
        setYoutubeId(data.videoId);
        setThumbnails(prev => ({ ...prev, [key]: data.videoId }));
        // Player will start automatically via onPlayerReady/StateChange if isPlaying was intentioned
        // But here we set isPlaying manually once ID is back
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
      setError("Playback failed.");
    }
  };

  // --- QUEUE NAVIGATION ---
  const handlePlayNext = useCallback(() => {
    if (playingTrackIndex === null) return;
    
    if (playingTrackIndex === -1 && recommendations.length > 0) {
      handlePlayCard(recommendations[0].track_name, recommendations[0].artists, 0, recommendations[0]);
    } else if (playingTrackIndex < recommendations.length - 1) {
      const nextIdx = playingTrackIndex + 1;
      const nextTrack = recommendations[nextIdx];
      handlePlayCard(nextTrack.track_name, nextTrack.artists, nextIdx, nextTrack);
    } else {
      handleStartRadio(playingTrack.name, playingTrack.artist);
    }
  }, [playingTrackIndex, recommendations, playingTrack]);

  const handlePlayPrev = useCallback(() => {
    if (playingTrackIndex === null) return;
    if (playingTrackIndex === 0 && targetSong) {
      handlePlayCard(targetSong.name, targetSong.artist, -1);
      return;
    }
    if (playingTrackIndex > 0) {
      const prevIdx = playingTrackIndex - 1;
      const prevTrack = recommendations[prevIdx];
      handlePlayCard(prevTrack.track_name, prevTrack.artists, prevIdx, prevTrack);
    }
  }, [playingTrackIndex, recommendations, targetSong]);

  // --- LONG PRESS SKIP ---
  const handleLongPressStart = (direction) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (!playerRef.current) return;
      const player = playerRef.current;
      longPressTimer.current = setInterval(async () => {
        const ct = await player.getCurrentTime();
        player.seekTo(direction === 'forward' ? ct + 10 : Math.max(0, ct - 10), true);
      }, 400);
    }, 500);
  };

  const handleLongPressEnd = (action) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      clearInterval(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress.current) {
      action();
    }
    isLongPress.current = false;
  };

  // --- PLAYER CONTROLS ---
  const togglePlayState = (e) => {
    e?.stopPropagation();
    if (!playerRef.current) return;
    const player = playerRef.current;
    isPlaying ? player.pauseVideo() : player.playVideo();
  };

  const seekPlayer = (e) => {
    const pct = parseFloat(e.target.value);
    setProgress(pct);
    setCurrentTime((pct / 100) * duration);
    if (!playerRef.current) return;
    playerRef.current.seekTo((pct / 100) * duration, true);
  };

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (playerRef.current) playerRef.current.setVolume(v);
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    
    // Resume playback only if we are restoring a session (at mount)
    if (isRestoring.current && currentTime > 0) {
      event.target.seekTo(currentTime, true);
      isRestoring.current = false;
    }

    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 0) {
      handlePlayNext();
    } else if (event.data === 1) {
      setIsPlaying(true);
      if (progressInterval.current) clearInterval(progressInterval.current);
      progressInterval.current = setInterval(async () => {
        if (isSeeking.current) return;
        const ct = await event.target.getCurrentTime();
        const dur = await event.target.getDuration();
        if (dur > 0) {
          setProgress((ct / dur) * 100);
          setCurrentTime(ct);
          setDuration(dur);
        }
      }, 500);
    } else {
      setIsPlaying(false);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  const onPlayerError = (event) => {
    // 101/150: Not embeddable, 100: Not found
    if ([101, 150, 100].includes(event.data)) {
      handlePlayNext();
    }
  };

  const fetchLyrics = async () => {
    if (!playingTrack) return;
    
    // Toggle off if already showing
    if (showLyrics) {
      setShowLyrics(false);
      return;
    }

    // Check cache
    if (lyrics) {
      setShowLyrics(true);
      return;
    }
    
    setLyricsLoading(true);
    setShowLyrics(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/lyrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          track_name: playingTrack.name, 
          artist: playingTrack.artist 
        })
      });
      const data = await res.json();
      if (data.error) {
        setLyrics(data.error);
      } else {
        setLyrics(data.lyrics);
      }
    } catch (err) {
      setLyrics("Failed to connect to lyrics server.");
    } finally {
      setLyricsLoading(false);
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    // Only trigger if swiping downwards
    if (deltaY > 150) {
      setIsNowPlayingOpen(false);
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  return (
    <>
      <div className="app-shell">
        {/* ====== SPOTIFY-STYLE MAIN PAGE ====== */}
        <div className="main-page">
          
          <header className="top-bar">
            <h1 className="brand">
              <Music2 size={24} />
              <span>Frenzi</span>
            </h1>
          </header>

          <div className="search-wrapper" ref={searchBarRef}>
            <form className="search-bar" onSubmit={handleSearch}>
              <Search size={18} />
              <input 
                type="text" 
                id="search-input"
                placeholder="What do you want to listen to?" 
                value={query}
                autoComplete="off"
                onChange={handleQueryChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              />
              <button type="submit" className="search-submit" disabled={loading}>
                {loading ? <div className="mini-spinner" /> : <ArrowRight size={18} />}
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((s, i) => (
                  <div 
                    key={`${s.track_name}-${s.artists}-${i}`}
                    className={`suggestion-item ${focusedSuggestion === i ? 'focused' : ''}`}
                    onMouseEnter={() => setFocusedSuggestion(i)}
                    onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                  >
                    <Search size={14} className="suggestion-icon" />
                    <div className="suggestion-text">
                      <span className="suggestion-name">{s.track_name}</span>
                      <span className="suggestion-artist">{s.artists}</span>
                    </div>
                    <span className="suggestion-genre">{s.track_genre}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="error-toast">{error}</div>}

          <main className="content-area">
            {loading && !targetSong && (
              <div className="loading-state">
                <div className="pulse-ring" />
                <p>Analyzing audio DNA...</p>
              </div>
            )}

            {targetSong && !loading && (
              <section className="section fade-in">
                <h2 className="section-label">Seed Track</h2>
                <div 
                  className={`seed-card ${playingTrackIndex === -1 ? 'active' : ''}`}
                  onClick={() => handlePlayCard(targetSong.name, targetSong.artist, -1, targetSong)}
                >
                  <div className="seed-art">
                    {targetSong.image_url ? (
                      <img src={targetSong.image_url} alt="" className="seed-art-img" />
                    ) : thumbnails[thumbKey(targetSong.name, targetSong.artist)] ? (
                      <img src={`https://img.youtube.com/vi/${thumbnails[thumbKey(targetSong.name, targetSong.artist)]}/mqdefault.jpg`} alt="" className="seed-art-img" />
                    ) : (
                      <div className={`seed-art-placeholder ${fetchingIds.has(thumbKey(targetSong.name, targetSong.artist)) ? 'loading' : ''}`}>
                         <Disc3 size={36} className={playingTrackIndex === -1 && isPlaying ? 'spin' : ''} />
                      </div>
                    )}
                  </div>
                  <div className="seed-info">
                    <div className="seed-title-row">
                      <h3>{targetSong.name}</h3>
                      {targetSong.fallback && <span className="fallback-badge">YouTube Match</span>}
                    </div>
                    <p>{targetSong.artist}</p>
                  </div>
                  <div className="seed-actions" onClick={e => e.stopPropagation()}>
                    <button 
                      className="action-btn radio" 
                      title="Start Radio"
                      onClick={() => handleStartRadio(targetSong.name, targetSong.artist)}
                    >
                      <Radio size={16} />
                    </button>
                    <button 
                      className="action-btn play"
                      onClick={() => handlePlayCard(targetSong.name, targetSong.artist, -1)}
                    >
                      {playingTrackIndex === -1 && isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
                    </button>
                  </div>
                </div>
              </section>
            )}

            {recommendations.length > 0 && !loading && (
              <section className="section slide-up">
                <h2 className="section-label">
                  <Sparkles size={14} />
                  Recommended Queue
                </h2>
                <div className="track-list">
                  {recommendations.map((rec, index) => (
                    <div 
                      className={`track-row ${playingTrackIndex === index ? 'active' : ''}`} 
                      key={index}
                      onClick={() => handlePlayCard(rec.track_name, rec.artists, index, rec)}
                    >
                      <span className="track-num">
                        {playingTrackIndex === index && isPlaying ? (
                          <span className="eq-bars">
                            <span /><span /><span />
                          </span>
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div className="track-thumb">
                        {rec.image_url ? (
                          <img src={rec.image_url} alt="" className="track-thumb-img" />
                        ) : thumbnails[thumbKey(rec.track_name, rec.artists)] ? (
                          <img src={`https://img.youtube.com/vi/${thumbnails[thumbKey(rec.track_name, rec.artists)]}/mqdefault.jpg`} alt="" className="track-thumb-img" />
                        ) : (
                          <div className={`track-thumb-placeholder ${fetchingIds.has(thumbKey(rec.track_name, rec.artists)) ? 'loading' : ''}`}>
                             <Disc3 size={18} />
                          </div>
                        )}
                      </div>
                      <div className="track-meta">
                        <span className="track-name">{rec.track_name}</span>
                        <span className="track-artist">{rec.artists}</span>
                      </div>
                      <span className="track-tag">{rec.similarity_percent || (rec.similarity * 100).toFixed(0)}%</span>
                      <button className="row-radio" onClick={(e) => {
                        e.stopPropagation();
                        handleStartRadio(rec.track_name, rec.artists);
                      }}>
                        <Radio size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!targetSong && !loading && (
              <div className="empty-state">
                <Music2 size={64} strokeWidth={1} />
                <h2>Search for a song</h2>
                <p>We'll build you a queue of sonically similar tracks</p>
              </div>
            )}
          </main>
        </div>

        {/* ====== MINI PLAYER BAR ====== */}
        <div 
          className={`mini-player ${playingTrack.name ? 'visible' : ''}`}
          onClick={() => setIsNowPlayingOpen(true)}
        >
          <div className="mini-progress">
            <div className="mini-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="mini-left">
            <div className="mini-art">
              {playingTrack.image_url ? (
                <img src={playingTrack.image_url} alt="" className="mini-art-img" />
              ) : youtubeId ? (
                <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="" className="mini-art-img" />
              ) : (
                <Disc3 size={18} />
              )}
            </div>
            <div className="mini-text">
              <span className="mini-title">{playingTrack.name || 'Not Playing'}</span>
              <span className="mini-artist">{playingTrack.artist || '—'}</span>
            </div>
          </div>
          <div className="mini-controls" onClick={e => e.stopPropagation()}>
            <button className="mini-play-btn" onClick={togglePlayState}>
              {isPlaying ? <Pause size={22} fill="white" /> : <Play size={22} fill="white" />}
            </button>
            <button className="mini-skip-btn" onClick={handlePlayNext}>
              <SkipForward size={20} fill="white" />
            </button>
          </div>
        </div>

        {/* ====== APPLE MUSIC NOW PLAYING SCREEN ====== */}
        <div 
          className={`now-playing ${isNowPlayingOpen ? 'open' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grabber Bar for affordance */}
          <div className="np-grabber-zone" onClick={() => setIsNowPlayingOpen(false)}>
            <div className="np-grabber" />
          </div>

          {/* Blurred background layer */}
          <div 
            className="np-backdrop" 
            style={youtubeId ? { backgroundImage: `url(https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg)` } : {}}
          />

          <div className="np-content">
            <header className="np-header">
              <div className="np-header-left">
                <button className="np-close" onClick={() => { setIsNowPlayingOpen(false); setShowVideo(false); }}>
                  <ChevronDown size={32} strokeWidth={2.5} />
                </button>
              </div>

              {showLyrics ? (
                <div className="np-mini-card fade-in">
                  <div className="np-mini-img-wrapper">
                    {playingTrack.image_url ? (
                      <img src={playingTrack.image_url} alt="" className="np-mini-art" />
                    ) : youtubeId ? (
                      <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="" className="np-mini-art" />
                    ) : (
                      <Music2 size={16} />
                    )}
                  </div>
                  <div className="np-mini-details">
                    <span className="np-mini-title">{playingTrack.name}</span>
                    <span className="np-mini-artist">{playingTrack.artist}</span>
                  </div>
                </div>
              ) : (
                <span className="np-subtitle">{showVideo ? 'PLAYING VIDEO' : 'NOW PLAYING'}</span>
              )}
              
              <div className="np-header-right">
                <button 
                  className={`np-video-toggle ${showVideo ? 'active' : ''}`} 
                  onClick={() => { setShowVideo(!showVideo); setShowLyrics(false); }}
                  title={showVideo ? 'Show Artwork' : 'Show Video'}
                >
                  {showVideo ? <ImageIcon size={22} /> : <Monitor size={22} />}
                </button>
                <button 
                  className={`np-lyrics-toggle ${showLyrics ? 'active' : ''}`} 
                  onClick={fetchLyrics}
                  title="Lyrics"
                >
                  <AlignLeft size={22} />
                </button>
                <button className="np-radio" onClick={() => handleStartRadio(playingTrack.name, playingTrack.artist)}>
                  <Radio size={22} />
                </button>
              </div>
            </header>

            {/* Large Artwork / Video Container */}
            {/* Main Visuals (Art/Video) Container - ALWAYS MOUNTED for persistent playback */}
            <div className={`np-art-container ${showLyrics ? 'lyrics-mode' : ''}`}>
              <div className={`np-art ${isPlaying && !showVideo && !showLyrics ? 'expanded' : ''} ${showVideo || showLyrics ? 'video-mode' : ''}`}>
                {!showVideo && (
                  <div className="np-art-img-wrapper">
                    {playingTrack.image_url ? (
                      <img src={playingTrack.image_url} alt="" className="np-art-img" />
                    ) : youtubeId ? (
                      <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="" className="np-art-img" />
                    ) : (
                      <Disc3 size={120} strokeWidth={0.8} className={isPlaying ? 'spin-slow' : ''} />
                    )}
                  </div>
                )}
              </div>
              
              {/* Embedded Video Player - Never unmounted */}
              {youtubeId && (
                <div className={`youtube-wrapper ${showVideo && !showLyrics ? 'visible' : ''}`}>
                  <YouTube 
                    videoId={youtubeId} 
                    opts={{
                      height: '100%',
                      width: '100%',
                      playerVars: { 
                        autoplay: 1, 
                        controls: 1,
                        modestbranding: 1,
                        rel: 0,
                        origin: window.location.origin
                      } 
                    }} 
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                    onError={onPlayerError}
                    className="youtube-player"
                    iframeClassName="youtube-iframe"
                  />
                </div>
              )}
            </div>

            {showLyrics && (
              <div className="np-lyrics-view fade-in">
                <div className="np-lyrics-content">
                  {lyricsLoading ? (
                    <div className="lyrics-loading">
                      <div className="spinner" />
                      <span>Fetching lyrics...</span>
                    </div>
                  ) : (
                    <pre className="lyrics-text">{lyrics || "Searching for lyrics..."}</pre>
                  )}
                </div>
              </div>
            )}

            {/* Song Info */}
            {!showLyrics && (
              <div className="np-info">
                <h1 className="np-title">{playingTrack.name}</h1>
                <p className="np-artist">{playingTrack.artist}</p>
                {playingTrack.reason && (
                  <div className="np-badge">
                    <span>{playingTrack.reason}</span>
                    <span className="np-badge-pct">{playingTrack.similarity}%</span>
                  </div>
                )}
              </div>
            )}

            {/* Progress */}
            <div className="np-progress">
              <input 
                type="range" 
                className="np-slider progress"
                min="0" max="100" step="0.1" 
                value={progress}
                style={{ '--val': `${progress}%` }}
                onChange={seekPlayer}
                onMouseDown={() => isSeeking.current = true}
                onMouseUp={() => isSeeking.current = false}
                onTouchStart={() => isSeeking.current = true}
                onTouchEnd={() => isSeeking.current = false}
              />
              <div className="np-times">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="np-controls">
              <button 
                className="np-skip"
                onMouseDown={() => handleLongPressStart('backward')}
                onMouseUp={() => handleLongPressEnd(handlePlayPrev)}
                onMouseLeave={() => { if(longPressTimer.current) { clearTimeout(longPressTimer.current); clearInterval(longPressTimer.current); longPressTimer.current = null; } }}
                onTouchStart={() => handleLongPressStart('backward')}
                onTouchEnd={() => handleLongPressEnd(handlePlayPrev)}
              >
                <SkipBack size={36} fill="white" />
              </button>
              <button className="np-play-btn" onClick={togglePlayState}>
                {isPlaying ? <Pause size={36} fill="black" /> : <Play size={36} fill="black" style={{ marginLeft: 3 }} />}
              </button>
              <button 
                className="np-skip"
                onMouseDown={() => handleLongPressStart('forward')}
                onMouseUp={() => handleLongPressEnd(handlePlayNext)}
                onMouseLeave={() => { if(longPressTimer.current) { clearTimeout(longPressTimer.current); clearInterval(longPressTimer.current); longPressTimer.current = null; } }}
                onTouchStart={() => handleLongPressStart('forward')}
                onTouchEnd={() => handleLongPressEnd(handlePlayNext)}
              >
                <SkipForward size={36} fill="white" />
              </button>
            </div>

            {/* Volume */}
            <div className="np-volume">
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <input 
                type="range" 
                className="np-slider volume"
                min="0" max="100" 
                value={volume}
                style={{ '--val': `${volume}%` }}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
