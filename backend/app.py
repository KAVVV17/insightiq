from flask import Flask, request, jsonify
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from collections import Counter
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

analyzer = SentimentIntensityAnalyzer()

client = MongoClient("mongodb+srv://kavvvanna317_db_user:MjzdyAdvbsdSNZjT@cluster0.hqnvwka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

db = client["insightiq"]

collection = db["feedbacks"]


@app.route("/")
def home():
    return "InsightIQ Backend Running"


@app.route("/analytics")
def analytics():

    feedback_data = list(collection.find())

    positive = 0
    negative = 0
    neutral = 0

    all_words = []

    for item in feedback_data:

        if item["sentiment"] == "Positive":
            positive += 1

        elif item["sentiment"] == "Negative":
            negative += 1

        else:
            neutral += 1

        words = item["feedback"].lower().split()

        ignore_words = [
            "the", "is", "a", "an", "was",
            "this", "that", "and", "it",
            "to", "of", "in"
        ]

        filtered_words = [
            word for word in words
            if word not in ignore_words
        ]

        all_words.extend(filtered_words)

    trending = Counter(all_words).most_common(5)

    trending_topics = []

    for word, count in trending:

        trending_topics.append({
            "word": word,
            "count": count
        })

    recent_feedback = []

    latest = collection.find().sort("_id", -1).limit(5)

    for item in latest:

        recent_feedback.append({
            "name": item["name"],
            "feedback": item["feedback"],
            "sentiment": item["sentiment"]
        })

    return jsonify({
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "trending": trending_topics,
        "recent_feedback": recent_feedback
    })


@app.route("/feedback", methods=["POST"])
def feedback():

    data = request.json

    text = data["feedback"]

    sentiment_score = analyzer.polarity_scores(text)

    compound = sentiment_score["compound"]

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
if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)