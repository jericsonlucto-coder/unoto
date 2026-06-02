'use client';

import { useEffect } from 'react';
import { Player } from '@/tipo/uno';

interface EndOfRoundProps {
  winner: Player;
}

export default function EndOfRound({ winner }: EndOfRoundProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">
          {winner === 'player' ? '🎉 You won the round! 🎉' : '💀 CPU won the round... 💀'}
        </h2>
      </div>
    </div>
  );
}
