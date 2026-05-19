import { useState, useEffect } from "react"
import axios from "axios"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts"

function App() {

  const [name, setName] = useState("")
  const [feedback, setFeedback] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const [analytics, setAnalytics] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    trending: [],
    recent_feedback: []
  })

  const fetchAnalytics = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:5000/analytics"
      )

      setAnalytics(response.data)

    } catch (error) {

      console.log(error)

    }
  }

  useEffect(() => {

    fetchAnalytics()

    const interval = setInterval(() => {
      fetchAnalytics()
    }, 3000)

    return () => clearInterval(interval)

  }, [])

  const handleSubmit = async () => {

    if (!name || !feedback) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    const data = {
      name: name,
      feedback: feedback
    }

    try {

      const response = await axios.post(
        "http://127.0.0.1:5000/feedback",
        data
      )

      setResult(response.data.message)

      setName("")
      setFeedback("")

      fetchAnalytics()

    } catch (error) {

      console.log(error)
      alert("Error submitting")

    } finally {

      setLoading(false)

    }
  }

  const chartData = [
    {
      name: "Positive",
      value: analytics.positive
    },
    {
      name: "Negative",
      value: analytics.negative
    },
    {
      name: "Neutral",
      value: analytics.neutral
    }
  ]

  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#6b7280"
  ]

  return (

    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-pink-100 flex flex-col items-center p-8">

      <h1 className="text-6xl font-extrabold text-blue-700 drop-shadow-lg">
        InsightIQ 📊
      </h1>

      <p className="mt-4 text-gray-700 text-lg">
        Real-Time Sentiment & Trend Analyzer
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-12">

        <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-6 rounded-3xl text-center shadow-xl hover:scale-105 transition">

          <h2 className="text-4xl font-bold text-green-600">
            {analytics.positive}
          </h2>

          <p className="mt-2 text-lg font-medium">
            Positive
          </p>

        </div>

        <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-6 rounded-3xl text-center shadow-xl hover:scale-105 transition">

          <h2 className="text-4xl font-bold text-red-500">
            {analytics.negative}
          </h2>

          <p className="mt-2 text-lg font-medium">
            Negative
          </p>

        </div>

        <div className="bg-white/60 backdrop-blur-lg border border-white/30 p-6 rounded-3xl text-center shadow-xl hover:scale-105 transition">

          <h2 className="text-4xl font-bold text-gray-700">
            {analytics.neutral}
          </h2>

          <p className="mt-2 text-lg font-medium">
            Neutral
          </p>

        </div>

      </div>

      <div className="bg-white/70 backdrop-blur-lg border border-white/30 p-8 rounded-3xl shadow-2xl mt-12 w-full max-w-2xl">

        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Give Feedback
        </h2>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-2xl border mb-5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          placeholder="Write your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full p-4 rounded-2xl border mb-5 h-36 focus:outline-none focus:ring-2 focus:ring-blue-400"
        ></textarea>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-2xl w-full transition duration-300 shadow-lg"
        >

          {
            loading
              ? "Submitting..."
              : "Submit Feedback"
          }

        </button>

        {
          result && (
            <div className="mt-6 bg-green-100 text-green-700 p-4 rounded-2xl text-center font-semibold shadow">
              {result}
            </div>
          )
        }

      </div>

      <div className="bg-white/70 backdrop-blur-lg border border-white/30 p-8 rounded-3xl shadow-2xl mt-12 w-full max-w-2xl">

        <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">
          Trending Topics 🔥
        </h2>

        {
          analytics.trending.map((item, index) => (

            <div
              key={index}
              className="flex justify-between items-center bg-white p-4 rounded-2xl mb-4 shadow hover:scale-105 transition"
            >

              <span className="font-semibold text-lg">
                #{item.word}
              </span>

              <span className="bg-blue-100 px-4 py-1 rounded-full font-bold text-blue-700">
                {item.count}
              </span>

            </div>

          ))
        }

      </div>

      <div className="bg-white/70 backdrop-blur-lg border border-white/30 p-8 rounded-3xl shadow-2xl mt-12 w-full max-w-2xl">

        <h2 className="text-3xl font-bold mb-6 text-center text-pink-700">
          Sentiment Chart 📈
        </h2>

        <div className="flex justify-center">

          <PieChart width={350} height={350}>

            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label
            >

              {
                chartData.map((entry, index) => (
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

        </div>

      </div>

      <div className="bg-white/70 backdrop-blur-lg border border-white/30 p-8 rounded-3xl shadow-2xl mt-12 w-full max-w-2xl">

        <h2 className="text-3xl font-bold mb-6 text-center text-green-700">
          Recent Feedback 💬
        </h2>

        {
          analytics.recent_feedback.map((item, index) => (

            <div
              key={index}
              className="bg-white p-5 rounded-2xl shadow mb-4"
            >

              <div className="flex justify-between mb-2">

                <h3 className="font-bold text-lg">
                  {item.name}
                </h3>

                <span className="text-sm font-semibold text-blue-600">
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

      <footer className="mt-16 text-center text-gray-600 text-sm">

        Built with ❤️ using React, Flask & MongoDB

      </footer>

    </div>

  )
}

export default App