from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from collections import Counter
import re
import os

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient("mongodb+srv://kavvvanna317_db_user:cseaiml17@cluster0.hqnvwka.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["insightiq"]
collection = db["feedbacks"]

analyzer = SentimentIntensityAnalyzer()

# HOME
@app.route("/")
def home():
    return jsonify({
        "message": "InsightIQ Backend Running 🚀"
    })

# FEEDBACK ROUTE
@app.route("/feedback", methods=["POST"])
def feedback():

    try:

        data = request.json

        name = data.get("name")
        text = data.get("feedback")

        score = analyzer.polarity_scores(text)
        compound = score["compound"]

        if compound >= 0.05:
            sentiment = "Positive"

        elif compound <= -0.05:
            sentiment = "Negative"

        else:
            sentiment = "Neutral"

        feedback_item = {
            "name": name,
            "feedback": text,
            "sentiment": sentiment
        }

        collection.insert_one(feedback_item)

        return jsonify({
            "message": f"Feedback received! Sentiment: {sentiment}"
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# ANALYTICS
@app.route("/analytics")
def analytics():

    try:

        data = list(collection.find({}, {"_id": 0}))

        positive = len(
            [x for x in data if x["sentiment"] == "Positive"]
        )

        negative = len(
            [x for x in data if x["sentiment"] == "Negative"]
        )

        neutral = len(
            [x for x in data if x["sentiment"] == "Neutral"]
        )

        words = []

        for item in data:

            text = item["feedback"].lower()

            found = re.findall(r'\b\w+\b', text)

            words.extend(found)

        common = Counter(words).most_common(5)

        trending = []

        for word, count in common:

            trending.append({
                "word": word,
                "count": count
            })

        recent = data[-5:]

        return jsonify({
            "positive": positive,
            "negative": negative,
            "neutral": neutral,
            "trending": trending,
            "recent_feedback": recent
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500

# RENDER PORT
if __name__ == "__main__":

    port = int(os.environ.get("PORT", 10000))

    app.run(
        host="0.0.0.0",
        port=port
    )