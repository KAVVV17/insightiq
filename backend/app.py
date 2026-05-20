from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from collections import Counter
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import re
import os

nltk.download('vader_lexicon')

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient("PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE")

db = client["insightiq_db"]
collection = db["feedbacks"]

# Sentiment Analyzer
sia = SentimentIntensityAnalyzer()


@app.route("/")
def home():
    return jsonify({
        "message": "InsightIQ Backend Running 🚀"
    })


@app.route("/feedback", methods=["POST"])
def feedback():

    data = request.json

    text = data["feedback"]

    score = sia.polarity_scores(text)

    compound = score["compound"]

    if compound >= 0.05:
        sentiment = "Positive"

    elif compound <= -0.05:
        sentiment = "Negative"

    else:
        sentiment = "Neutral"

    feedback_item = {
        "name": data["name"],
        "feedback": text,
        "sentiment": sentiment
    }

    collection.insert_one(feedback_item)

    return jsonify({
        "message": f"Feedback received! Sentiment: {sentiment}"
    })


@app.route("/analytics", methods=["GET"])
def analytics():

    feedbacks = list(collection.find())

    positive = 0
    negative = 0
    neutral = 0

    words = []

    recent_feedback = []

    stop_words = [
        "the", "is", "a", "an", "this",
        "that", "and", "or", "to",
        "of", "it", "was", "very",
        "i", "am", "are"
    ]

    for item in feedbacks:

        sentiment = item["sentiment"]

        if sentiment == "Positive":
            positive += 1

        elif sentiment == "Negative":
            negative += 1

        else:
            neutral += 1

        text_words = re.findall(
            r'\b\w+\b',
            item["feedback"].lower()
        )

        filtered = [
            word for word in text_words
            if word not in stop_words
        ]

        words.extend(filtered)

        recent_feedback.append({
            "name": item["name"],
            "feedback": item["feedback"],
            "sentiment": item["sentiment"]
        })

    trending = Counter(words).most_common(5)

    trending_data = []

    for word, count in trending:

        trending_data.append({
            "word": word,
            "count": count
        })

    recent_feedback = recent_feedback[::-1][:5]

    return jsonify({
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "trending": trending_data,
        "recent_feedback": recent_feedback
    })


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )