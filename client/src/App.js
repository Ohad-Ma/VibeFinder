import React, { useState, useEffect } from "react";
import "./App.css";
import {
  darkStars,
  darkMoon,
  darkClouds,
  darkCastle,
  lightSun,
  lightClouds,
  lightFlowers,
  lightHills,
  logo,
} from "./assets";

const moods = ["happy", "sad", "angry", "calm", "curious", "bored"];
const moodEmojis = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  calm: "😌",
  curious: "🧐",
  bored: "😐",
};

function App() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  // Scroll & Theme setup
  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("light-mode", !darkMode);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [darkMode]);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);
  }, []);

  const handleMoodClick = (mood) => {
    setSelectedMood(mood);
    setMovies([]);
    setError(null);
    fetchMovies(mood);
  };

  const toggleFlip = (index) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const fetchMovies = (mood) => {
    setLoading(true);
    fetch(`http://localhost:5000/get_movies?mood=${mood}`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch(() => {
        setError("Failed to fetch movies.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleDarkMode = () => {
    const curtain = document.getElementById("curtain");
    curtain.classList.add("animate");
    setTimeout(() => setDarkMode((prev) => !prev), 300);
    setTimeout(() => curtain.classList.remove("animate"), 1000);
  };

  return (
    <div className="page-wrapper">
      {darkMode ? (
        <>
          <img
            src={darkStars}
            className="bg-prop dark-prop stars"
            alt="stars"
          />
          <img src={darkMoon} className="bg-prop dark-prop moon" alt="moon" />
          <img
            src={darkClouds}
            className="bg-prop dark-prop clouds"
            alt="clouds"
          />
          <img
            src={darkCastle}
            className="bg-prop dark-prop castle"
            alt="castle"
          />
        </>
      ) : (
        <>
          <img src={lightSun} className="bg-prop light-prop sun" alt="sun" />
          <img
            src={lightClouds}
            className="bg-prop light-prop clouds"
            alt="clouds"
          />
          <img
            src={lightFlowers}
            className="bg-prop light-prop flowers"
            alt="flowers"
          />
          <img
            src={lightHills}
            className="bg-prop light-prop hills"
            alt="hills"
          />
        </>
      )}

      <div className={`app-container ${selectedMood ? 'expanded' : 'intro'}`}>
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <div className="psychonauts-toggle-wrapper">
            <div
              className={`psychonauts-toggle ${darkMode ? "checked" : ""}`}
              onClick={toggleDarkMode}
              role="button"
              aria-label="Toggle Theme"
            ></div>
          </div>
        </div>
        {!selectedMood && (
          <div className={`logo-wrapper ${selectedMood ? "logo-animate" : ""}`}>
            <img src={logo} alt="VibeFinder Logo" className="logo" />
          </div>
        )}
        <h1 style={{ paddingBottom: 50, paddingTop: 50 }}>How do you feel today?</h1>
        <div className={`mood-buttons ${selectedMood ? "shrunk" : ""}`}>
          {moods.map((mood) => (
            <button key={mood} onClick={() => handleMoodClick(mood)}>
              {moodEmojis[mood]} {mood}
            </button>
          ))}
        </div>

        {selectedMood && (
          <h2 style={{textAlign: "center", textTransform: "uppercase", marginTop: 50, fontSize: 50, letterSpacing: 30}}>
            <em>{selectedMood}</em> {moodEmojis[selectedMood]} 
          </h2>
        )}

        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Finding movies...</p>
          </div>
        )}

        {error && <p className="error">{error}</p>}
        <div className="movies-grid">
          {movies.map((movie, i) => (
            <div
              key={i}
              className={`movie-card ${flippedCards[i] ? "flipped" : ""}`}
              onClick={() => toggleFlip(i)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/fallback.jpg"
                    }
                    alt={movie.title}
                  />
                  <h3
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "0.6rem",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>{movie.title}</span>
                    <span
                      style={{
                        fontSize: "0.8em",
                        color: "#ffd700",
                        transform: "translateY(1px)",
                        display: "inline-block",
                      }}
                    >
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                  </h3>
                </div>
                <div className="card-back">
                  <p>{movie.overview || "No overview available."}</p>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      movie.title + " trailer"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Watch Trailer
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showScroll && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ⬆ Back to Top
        </button>
      )}
      <div id="curtain" className="curtain-overlay"></div>
    </div>
  );
}

export default App;
