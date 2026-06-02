'use client';

import { Player } from '@/types/uno';

interface EndOfGameProps {
  winner: Player;
  onPlayAgain: () => void;
}

export default function EndOfGame({ winner, onPlayAgain }: EndOfGameProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">
          {winner === 'player' ? '🏆 You won the game! 🏆' : '😢 CPU won the game... 😢'}
        </h2>
        <button
          onClick={onPlayAgain}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Play Again!
        </button>
      </div>
    </div>
  );
}