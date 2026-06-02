'use client';

import Image from 'next/image';
import { useUnoGame } from '@/hooks/useUnoGame';
import { Card } from '@/tipo/uno';
import ColorPicker from './ColorPicker';
import EndOfRound from './EndOfRound';
import EndOfGame from './EndOfGame';

export default function Game() {
  const { gameState, drawCard, playCard, newGame, selectedColor, setSelectedColor, playSound } = useUnoGame();

  const handlePlayerPlay = (index: number, card: Card) => {
    if (!gameState.playerTurn || gameState.colorPickerIsOpen || !gameState.gameOn) return;
    
    const lastCard = gameState.playPile[gameState.playPile.length - 1];
    if (card.color === lastCard.color || card.value === lastCard.value || card.color === 'any' || lastCard.color === 'any') {
      playCard(card, gameState.playerHand, false, index);
    }
  };

  const handleDrawCard = () => {
    if (gameState.playerTurn && !gameState.colorPickerIsOpen && gameState.gameOn) {
      drawCard(gameState.playerHand, false);
      setTimeout(() => {
        // End turn after drawing
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-900 p-4">
      {/* CPU Section */}
      <div className="mb-8">
        <div className="flex justify-center gap-2 flex-wrap mb-2">
          {gameState.cpuHand.map((_card: Card, idx: number) => (
            <div key={idx} className="w-24 h-32 relative">
              <Image
                src="/images/back.png"
                alt="CPU card"
                fill
                className="object-contain rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
        {gameState.showUno.cpu && (
          <div className="text-center animate-bounce">
            <span className="text-red-600 font-bold text-2xl bg-yellow-300 px-4 py-2 rounded-full">UNO!</span>
          </div>
        )}
      </div>

      {/* Score Board */}
      <div className="bg-black/50 rounded-lg p-4 mb-8 max-w-md mx-auto">
        <div className="flex justify-between text-white text-xl">
          <span className={!gameState.playerTurn ? 'opacity-50' : ''}>CPU: {gameState.cpuScore}</span>
          <span className="text-yellow-400 text-sm">First to 100 loses</span>
          <span className={gameState.playerTurn ? 'opacity-50' : ''}>PLAYER: {gameState.playerScore}</span>
        </div>
      </div>

      {/* Play Area */}
      <div className="flex justify-center items-center gap-8 mb-8">
        {/* Play Pile */}
        <div className="w-32 h-44 relative">
          {gameState.playPile.length > 0 && (
            <Image
              src={gameState.playPile[gameState.playPile.length - 1].src}
              alt="Play pile"
              fill
              className="object-contain rounded-lg shadow-xl"
              style={selectedColor ? { border: `4px solid ${selectedColor}` } : {}}
            />
          )}
        </div>

        {/* Draw Pile */}
        <div 
          className="w-32 h-44 relative cursor-pointer hover:scale-105 transition-transform"
          onClick={handleDrawCard}
        >
          <Image
            src="/images/back.png"
            alt="Draw pile"
            fill
            className="object-contain rounded-lg shadow-xl"
          />
        </div>
      </div>

      {/* Player Section */}
      <div className="mt-8">
        <div className="flex justify-center gap-2 flex-wrap">
          {gameState.playerHand.map((card: Card, idx: number) => (
            <div
              key={idx}
              onClick={() => handlePlayerPlay(idx, card)}
              className={`w-24 h-32 relative cursor-pointer transition-transform hover:scale-105 ${
                !gameState.playerTurn || gameState.colorPickerIsOpen ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Image
                src={card.src}
                alt={`Card ${card.value}`}
                fill
                className="object-contain rounded-lg shadow-lg"
              />
            </div>
          ))}
        </div>
        {gameState.showUno.player && (
          <div className="text-center animate-bounce mt-2">
            <span className="text-red-600 font-bold text-2xl bg-yellow-300 px-4 py-2 rounded-full">UNO!</span>
          </div>
        )}
      </div>

      {/* Modals */}
      {gameState.colorPickerIsOpen && (
        <ColorPicker onSelectColor={(color: string) => {
          setSelectedColor(color);
          playSound('colorButton');
        }} />
      )}

      {gameState.roundWinner && (
        <EndOfRound winner={gameState.roundWinner} />
      )}

      {gameState.gameWinner && (
        <EndOfGame winner={gameState.gameWinner} onPlayAgain={newGame} />
      )}
    </div>
  );
}
