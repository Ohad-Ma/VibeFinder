import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
from collections import OrderedDict

load_dotenv()

app = Flask(__name__)
CORS(app)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

MOOD_GENRE_MAP = {
    "happy": [35, 10751, 16, 10749, 14],      # Comedy, Family, Animation, Romance, Fantasy
    "sad": [18, 10749],                       # Drama, Romance
    "angry": [28],                            # Just Action, exclude violence elsewhere
    "calm": [99, 10770, 16, 10751],           # Documentary, TV Movie, Animation, Family
    "curious": [9648, 878, 99],               # Mystery, Sci-Fi, Documentary
    "bored": [12, 14, 35, 10751]              # Adventure, Fantasy, Comedy, Family
}

@app.route('/get_movies')
def get_movies():
    mood = request.args.get('mood')
    if not mood or mood not in MOOD_GENRE_MAP:
        return jsonify({"error": "Invalid or missing mood"}), 400

    genre_ids = MOOD_GENRE_MAP[mood]
    results = []

    for genre_id in genre_ids:
        page = random.randint(1, 5)

        # Use request params instead of string concat (cleaner & safer)
        params = {
            "with_genres": genre_id,
            "sort_by": "popularity.desc",
            "page": page,
            "api_key": TMDB_API_KEY,
            "include_adult": "false",           # ✅ exclude adult titles
            "include_video": "false",
            # If you also want to block strictly-18+ certifications:
            "certification_country": "US",
            "certification.lte": "R",           # allow up to R (blocks NC-17/Adult)
            # Use "PG-13" instead of "R" if you want even cleaner results
        }

        res = requests.get("https://api.themoviedb.org/3/discover/movie", params=params)
        if res.ok:
            data = res.json()
            results.extend(data.get("results", [])[:3])

    # Extra safety: filter any residual adult-flagged items
    results = [m for m in results if not m.get("adult", False)]

    # Optional: shuffle & dedupe by ID (keep earlier code)
    seen_ids = set()
    unique_results = []
    for movie in results:
        mid = movie.get("id")
        if mid and mid not in seen_ids:
            seen_ids.add(mid)
            unique_results.append(movie)

    return jsonify({"results": unique_results})

if __name__ == '__main__':
    app.run(debug=True)
