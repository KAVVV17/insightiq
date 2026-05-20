import { useEffect, useState } from "react";
import axios from "axios";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function App() {

  // BACKEND URL
  const BACKEND_URL =
    "https://insightiq-backend-ueiz.onrender.com";

  // STATES
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const [analytics, setAnalytics] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    trending: [],
    recent_feedback: [],
  });

  // FETCH ANALYTICS
  const fetchAnalytics = async () => {

    try {

      const response = await axios.get(
        `${BACKEND_URL}/analytics`
      );

      setAnalytics(response.data);

    } catch (error) {

      console.log("Analytics Error:", error);

    }
  };

  // LOAD DATA
  useEffect(() => {

    fetchAnalytics();

  }, []);

  // SUBMIT FEEDBACK
  const submitFeedback = async (e) => {

    e.preventDefault();

    if (!name || !feedback) {

      alert("Please fill all fields");

      return;
    }

    setLoading(true);

    try {

      const response = await axios.post(
        `${BACKEND_URL}/feedback`,
        {
          name: name,
          feedback: feedback,
        }
      );

      alert(response.data.message);

      setName("");
      setFeedback("");

      fetchAnalytics();

    } catch (error) {

      console.log("Submission Error:", error);

      alert("Submission Failed");

    } finally {

      setLoading(false);

    }
  };

  // PIE DATA
  const pieData = [
    {
      name: "Positive",
      value: analytics.positive,
    },
    {
      name: "Negative",
      value: analytics.negative,
    },
    {
      name: "Neutral",
      value: analytics.neutral,
    },
  ];

  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#eab308",
  ];

  return (

    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-pink-100 p-6">

      {/* TITLE */}
      <h1 className="text-5xl font-bold text-center text-blue-700 mb-3">
        InsightIQ 📊
      </h1>

      <p className="text-center text-gray-700 mb-10">
        Real-Time Sentiment Analysis Dashboard
      </p>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        <div className="bg-white rounded-3xl p-6 shadow-xl text-center">

          <h2 className="text-4xl font-bold text-green-600">
            {analytics.positive}
          </h2>

          <p className="mt-2 text-lg">
            Positive
          </p>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl text-center">

          <h2 className="text-4xl font-bold text-red-500">
            {analytics.negative}
          </h2>

          <p className="mt-2 text-lg">
            Negative
          </p>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl text-center">

          <h2 className="text-4xl font-bold text-yellow-500">
            {analytics.neutral}
          </h2>

          <p className="mt-2 text-lg">
            Neutral
          </p>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* FORM */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">

          <h2 className="text-3xl font-bold mb-6 text-blue-700">
            Submit Feedback
          </h2>

          <form onSubmit={submitFeedback}>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-4 rounded-2xl mb-5 outline-none"
            />

            <textarea
              placeholder="Write your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border p-4 rounded-2xl mb-5 h-36 outline-none"
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl w-full font-semibold transition-all"
            >

              {
                loading
                  ? "Submitting..."
                  : "Submit Feedback 🚀"
              }

            </button>

          </form>

        </div>

        {/* PIE CHART */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">

          <h2 className="text-3xl font-bold mb-6 text-pink-700">
            Sentiment Overview 📈
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >

                {
                  pieData.map((entry, index) => (

                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />

                  ))
                }

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* TRENDING */}
      <div className="bg-white rounded-3xl p-8 shadow-xl mt-10">

        <h2 className="text-3xl font-bold mb-6 text-purple-700">
          Trending Keywords 🔥
        </h2>

        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={analytics.trending}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="word" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="count"
              fill="#3b82f6"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      {/* RECENT FEEDBACK */}
      <div className="bg-white rounded-3xl p-8 shadow-xl mt-10">

        <h2 className="text-3xl font-bold mb-6 text-green-700">
          Recent Feedback 💬
        </h2>

        <div className="space-y-4">

          {
            analytics.recent_feedback.map((item, index) => (

              <div
                key={index}
                className="bg-gray-100 p-5 rounded-2xl"
              >

                <div className="flex justify-between items-center mb-2">

                  <h3 className="font-bold text-lg">
                    {item.name}
                  </h3>

                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {item.sentiment}
                  </span>

                </div>

                <p className="text-gray-700">
                  {item.feedback}
                </p>

              </div>

            ))
          }

        </div>

      </div>

      {/* FOOTER */}
      <footer className="text-center mt-12 text-gray-700">

        Built with ❤️ using React + Flask + MongoDB

      </footer>

    </div>

  );
}

export default App;