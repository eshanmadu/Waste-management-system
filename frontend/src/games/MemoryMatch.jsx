import React, { useState } from "react";

const emojis = ["🧼", "🗑️", "♻️", "🌿"];
const tiles = shuffle([...emojis, ...emojis]);

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

export default function MemoryMatch() {
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const handleClick = (i) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;
    const newFlipped = [...flipped, i];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (tiles[a] === tiles[b]) {
        setMatched([...matched, a, b]);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-teal-50 p-4">
      <h2 className="text-2xl font-bold mb-4">🧼 Clean the Planet Memory Match</h2>
      <div className="grid grid-cols-4 gap-3">
        {tiles.map((emoji, i) => (
          <div
            key={i}
            className="w-14 h-14 flex items-center justify-center border-2 text-xl bg-white shadow cursor-pointer"
            onClick={() => handleClick(i)}
          >
            {flipped.includes(i) || matched.includes(i) ? emoji : "❓"}
          </div>
        ))}
      </div>
    </div>
  );
}
