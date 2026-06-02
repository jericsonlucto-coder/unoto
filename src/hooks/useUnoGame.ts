import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, GameState, Player } from '@/types/uno';
import { createDeck, shuffleDeck } from '@/utils/unoDeck';

const GAME_OVER_SCORE = 100;
const CPU_DELAY = 1500;

export const useUnoGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    cpuHand: [],
    deck: [],
    playPile: [],
    playerScore: 0,
    cpuScore: 0,
    playerTurn: true,
    gameOn: true,
    colorPickerIsOpen: false,
    showUno: { player: false, cpu: false },
    roundWinner: null,
    gameWinner: null,
  });

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((soundName: string) => {
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }, []);

  const updateHand = useCallback((hand: Card[], isCpu: boolean) => {
    setGameState(prev => ({
      ...prev,
      [isCpu ? 'cpuHand' : 'playerHand']: [...hand]
    }));
  }, []);

  const drawCard = useCallback((hand: Card[], isCpu: boolean) => {
    setGameState(prev => {
      const newHand = [...hand];
      let newDeck = [...prev.deck];
      let newPlayPile = [...prev.playPile];

      if (newDeck.length === 0 && newPlayPile.length > 1) {
        const lastCard = newPlayPile.pop()!;
        newDeck = shuffleDeck(newPlayPile);
        newPlayPile = [lastCard];
      }

      if (newDeck.length > 0) {
        const newCard = newDeck.shift()!;
        newHand.push(newCard);
        playSound('drawCard');
      }

      return {
        ...prev,
        [isCpu ? 'cpuHand' : 'playerHand']: newHand,
        deck: newDeck,
        playPile: newPlayPile
      };
    });
  }, [playSound]);

  const playCard = useCallback((card: Card, hand: Card[], isCpu: boolean, cardIndex: number) => {
    setGameState(prev => {
      const newHand = [...hand];
      newHand.splice(cardIndex, 1);
      const newPlayPile = [...prev.playPile, { ...card, playedByPlayer: !isCpu }];

      playSound('playCard');

      let newPlayerTurn = !isCpu;
      let showColorPicker = false;

      if (card.color === 'any' && card.drawValue === 0) {
        if (!isCpu) {
          showColorPicker = true;
          newPlayerTurn = true;
        } else {
          // CPU auto-selects color
          setTimeout(() => {
            const colorsInHand = newHand.reduce((acc, c) => {
              if (c.color !== 'any') acc[c.color]++;
              return acc;
            }, {} as Record<string, number>);
            const bestColor = Object.keys(colorsInHand).reduce((a, b) => 
              colorsInHand[a] > colorsInHand[b] ? a : b, Object.keys(colorsInHand)[0]);
            if (bestColor) {
              setSelectedColor(bestColor);
              setGameState(state => ({
                ...state,
                colorPickerIsOpen: false,
                playerTurn: true
              }));
            }
          }, 100);
        }
      }

      return {
        ...prev,
        playerHand: isCpu ? prev.playerHand : newHand,
        cpuHand: isCpu ? newHand : prev.cpuHand,
        playPile: newPlayPile,
        playerTurn: !card.changeTurn ? !isCpu : newPlayerTurn,
        colorPickerIsOpen: showColorPicker,
      };
    });
  }, [playSound]);

  const determinePlayableCards = useCallback((hand: Card[], lastCard: Card): Card[] => {
    return hand.filter(card => 
      card.color === lastCard.color || 
      card.value === lastCard.value || 
      card.color === 'any' || 
      lastCard.color === 'any'
    );
  }, []);

  const cpuPlay = useCallback(() => {
    setGameState(prev => {
      if (prev.playerTurn || !prev.gameOn || prev.colorPickerIsOpen) return prev;

      const playableCards = determinePlayableCards(prev.cpuHand, prev.playPile[prev.playPile.length - 1]);

      if (playableCards.length === 0) {
        setTimeout(() => drawCard(prev.cpuHand, true), 300);
        return { ...prev, playerTurn: true };
      }

      // CPU strategy: prioritize high value cards when opponent has few cards
      let chosenCard = playableCards[0];
      if (playableCards.length > 1) {
        const useHighCard = Math.random() > 0.7 || prev.playerHand.length < 3;
        if (useHighCard) {
          chosenCard = playableCards.reduce((max, card) => card.points > max.points ? card : max);
        } else {
          chosenCard = playableCards.reduce((min, card) => card.points < min.points ? card : min);
        }
      }

      const cardIndex = prev.cpuHand.findIndex(c => c === chosenCard);
      setTimeout(() => playCard(chosenCard, prev.cpuHand, true, cardIndex), 500);

      return prev;
    });
  }, [determinePlayableCards, drawCard, playCard]);

  const tallyPoints = useCallback((loserHand: Card[], isCpu: boolean) => {
    const points = loserHand.reduce((sum, card) => sum + card.points, 0);
    setGameState(prev => ({
      ...prev,
      playerScore: isCpu ? prev.playerScore + points : prev.playerScore,
      cpuScore: isCpu ? prev.cpuScore : prev.cpuScore + points,
    }));
  }, []);

  const checkForWinner = useCallback(() => {
    setGameState(prev => {
      if (prev.playerHand.length === 0) {
        tallyPoints(prev.cpuHand, true);
        return { ...prev, roundWinner: 'player', gameOn: false };
      }
      if (prev.cpuHand.length === 0) {
        tallyPoints(prev.playerHand, false);
        return { ...prev, roundWinner: 'cpu', gameOn: false };
      }
      if (prev.playerScore >= GAME_OVER_SCORE) {
        return { ...prev, gameWinner: 'cpu', gameOn: false };
      }
      if (prev.cpuScore >= GAME_OVER_SCORE) {
        return { ...prev, gameWinner: 'player', gameOn: false };
      }
      return prev;
    });
  }, [tallyPoints]);

  const newGame = useCallback(() => {
    const newDeck = shuffleDeck(createDeck());
    const playerCards = newDeck.splice(0, 7);
    const cpuCards = newDeck.splice(0, 7);
    
    let startCardIndex = newDeck.findIndex(card => card.color !== 'any' && card.value <= 9);
    if (startCardIndex === -1) startCardIndex = 0;
    const startCard = newDeck.splice(startCardIndex, 1)[0];

    setGameState({
      playerHand: playerCards,
      cpuHand: cpuCards,
      deck: newDeck,
      playPile: [startCard],
      playerScore: 0,
      cpuScore: 0,
      playerTurn: true,
      gameOn: true,
      colorPickerIsOpen: false,
      showUno: { player: false, cpu: false },
      roundWinner: null,
      gameWinner: null,
    });
    setSelectedColor(null);
  }, []);

  useEffect(() => {
    if (!gameState.gameOn && gameState.roundWinner) {
      setTimeout(() => {
        newGame();
      }, 3000);
    }
  }, [gameState.gameOn, gameState.roundWinner, newGame]);

  useEffect(() => {
    if (!gameState.playerTurn && gameState.gameOn && !gameState.colorPickerIsOpen) {
      const timer = setTimeout(cpuPlay, CPU_DELAY);
      return () => clearTimeout(timer);
    }
  }, [gameState.playerTurn, gameState.gameOn, gameState.colorPickerIsOpen, cpuPlay]);

  useEffect(() => {
    if (gameState.playerHand.length === 1 && gameState.gameOn) {
      setGameState(prev => ({ ...prev, showUno: { ...prev.showUno, player: true } }));
      playSound('uno');
      setTimeout(() => setGameState(prev => ({ ...prev, showUno: { ...prev.showUno, player: false } })), 2000);
    }
    if (gameState.cpuHand.length === 1 && gameState.gameOn) {
      setGameState(prev => ({ ...prev, showUno: { ...prev.showUno, cpu: true } }));
      setTimeout(() => setGameState(prev => ({ ...prev, showUno: { ...prev.showUno, cpu: false } })), 2000);
    }
  }, [gameState.playerHand.length, gameState.cpuHand.length, gameState.gameOn, playSound]);

  useEffect(() => {
    checkForWinner();
  }, [gameState.playerHand.length, gameState.cpuHand.length, gameState.playerScore, gameState.cpuScore, checkForWinner]);

  return {
    gameState,
    drawCard,
    playCard,
    newGame,
    selectedColor,
    setSelectedColor,
    playSound,
  };
};