// GameMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function GameMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 space-y-4 p-4">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Play Eco Games!</h1>

      <button onClick={() => navigate("/ecohero")} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl shadow-md">
        🌱 Eco Hero Clicker
      </button>

      <button onClick={() => navigate("/EcoPuzzle")} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-md">
        🧩 Eco Puzzle Game
      </button>

      <button onClick={() => navigate("/GreenRunner")} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-2xl shadow-md">
        🏃 Green Runner
      </button>

      <button onClick={() => navigate("/MemoryMatch")} className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-2xl shadow-md">
        🧼 Clean the Planet Match
      </button>

      <button onClick={() => navigate("/plastichunter")} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl shadow-md">
        🌊 Plastic Hunter: Ocean Rescue
      </button>
    </div>
  );
}
