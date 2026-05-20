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
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");

  const [analytics, setAnalytics] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    trending: [],
    recent_feedback: [],
  });

  const BACKEND_URL =
    "https://insightiq-backend-ueiz.onrender.com";

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/analytics`
      );

      setAnalytics(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const submitFeedback = async (e) => {
    e.preventDefault();

    if (!name || !feedback) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/feedback`, {
        name,
        feedback,
      });

      alert("Feedback Submitted 🚀");

      setName("");
      setFeedback("");

      fetchAnalytics();
    } catch (error) {
      console.log(error);
      alert("Submission failed");
    }
  };

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

  const COLORS = ["#22c55e", "#ef4444", "#facc15"];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-8">
        InsightIQ 📊
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* FORM */}
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Submit Feedback
          </h2>

          <form onSubmit={submitFeedback}>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-3 rounded-lg bg-zinc-800 mb-4 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              placeholder="Enter feedback"
              className="w-full p-3 rounded-lg bg-zinc-800 mb-4 outline-none"
              rows="5"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition-all px-6 py-3 rounded-xl w-full font-semibold"
            >
              Submit
            </button>
          </form>
        </div>

        {/* PIE CHART */}
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">
            Sentiment Overview
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TRENDING */}
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          Trending Keywords
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.trending}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="word" />
            <YAxis />
            <Tooltip />

            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT FEEDBACK */}
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg mt-8">
        <h2 className="text-2xl font-semibold mb-4">
          Recent Feedback
        </h2>

        <div className="space-y-4">
          {analytics.recent_feedback.map((item, index) => (
            <div
              key={index}
              className="bg-zinc-800 p-4 rounded-xl"
            >
              <h3 className="font-bold text-lg">
                {item.name}
              </h3>

              <p className="text-zinc-300 mt-2">
                {item.feedback}
              </p>

              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-blue-600 text-sm">
                {item.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;