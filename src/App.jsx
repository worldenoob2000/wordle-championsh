import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function App() {
  const [rawText, setRawText] = useState("");
  const [scores, setScores] = useState({});
  const [history, setHistory] = useState([]);

  const parseScores = () => {
    const lines = rawText.split("\n");
    const newScores = {};
    const newHistory = [];

    lines.forEach((line) => {
      const match = line.match(/(\w+):?\s*Wordle (\d+) (\d|X)\/6/);
      if (match) {
        const name = match[1];
        const wordleId = match[2];
        const score = match[3] === "X" ? 7 : parseInt(match[3]);

        if (!newScores[name]) {
          newScores[name] = { total: 0, games: 0 };
        }

        newScores[name].total += score;
        newScores[name].games += 1;

        newHistory.push({ player: name, wordle: wordleId, score });
      }
    });

    setScores(newScores);
    setHistory(newHistory);
  };

  const getAverage = (player) => {
    const { total, games } = scores[player];
    return (total / games).toFixed(2);
  };

  const getChartData = () => {
    const playerMap = {};

    history.forEach(({ player, wordle, score }) => {
      if (!playerMap[wordle]) {
        playerMap[wordle] = { wordle };
      }
      playerMap[wordle][player] = score;
    });

    return Object.values(playerMap).sort(
      (a, b) => parseInt(a.wordle) - parseInt(b.wordle)
    );
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>
        Wordle Score Tracker
      </h1>
      <textarea
        style={{ width: "100%", height: "150px", marginTop: "1rem" }}
        placeholder="Paste your WhatsApp chat export here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      <button
        onClick={parseScores}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px"
        }}
      >
        Parse Scores
      </button>

      {Object.keys(scores).length > 0 && (
        <>
          <h2 style={{ marginTop: "2rem", fontSize: "1.4rem" }}>Leaderboard</h2>
          <ul>
            {Object.entries(scores)
              .sort((a, b) => getAverage(a[0]) - getAverage(b[0]))
              .map(([player, data], i) => (
                <li key={player}>
                  {i + 1}. <strong>{player}</strong> – Avg: {getAverage(player)} (
                  {data.games} games)
                </li>
              ))}
          </ul>

          <h2 style={{ marginTop: "2rem", fontSize: "1.4rem" }}>
            Score Trends
          </h2>
          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <XAxis dataKey="wordle" />
                <YAxis domain={[1, 7]} reversed allowDecimals={false} />
                <Tooltip />
                <Legend />
                {[...new Set(history.map((h) => h.player))].map((player) => (
                  <Line
                    key={player}
                    type="monotone"
                    dataKey={player}
                    stroke={
                      "#" + Math.floor(Math.random() * 16777215).toString(16)
                    }
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}