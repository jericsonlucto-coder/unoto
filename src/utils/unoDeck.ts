import { Card, CardColor } from '@/types/uno';

const createCard = (rgb: CardColor, color: string, i: number): Card => {
  if (i === 0) {
    return { color: rgb, value: i, points: i, changeTurn: true, drawValue: 0, src: `/images/${color}${i}.png` };
  } else if (i > 0 && i <= 9) {
    return { color: rgb, value: i, points: i, changeTurn: true, drawValue: 0, src: `/images/${color}${i}.png` };
  } else if (i === 10 || i === 11) {
    return { color: rgb, value: i, points: 20, changeTurn: false, drawValue: 0, src: `/images/${color}${i}.png` };
  } else if (i === 12) {
    return { color: rgb, value: i, points: 20, changeTurn: false, drawValue: 2, src: `/images/${color}${i}.png` };
  } else if (i === 13) {
    return { color: 'any', value: i, points: 50, changeTurn: true, drawValue: 0, src: '/images/wild13.png' };
  } else {
    return { color: 'any', value: i, points: 50, changeTurn: false, drawValue: 4, src: '/images/wild14.png' };
  }
};

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const colors = [
    { rgb: 'rgb(255, 6, 0)' as CardColor, name: 'red' },
    { rgb: 'rgb(0, 170, 69)' as CardColor, name: 'green' },
    { rgb: 'rgb(0, 150, 224)' as CardColor, name: 'blue' },
    { rgb: 'rgb(255, 222, 0)' as CardColor, name: 'yellow' }
  ];

  for (const color of colors) {
    for (let i = 0; i <= 14; i++) {
      deck.push(createCard(color.rgb, color.name, i));
      if (i > 0 && i <= 9) {
        deck.push(createCard(color.rgb, color.name, i));
      }
    }
  }

  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.map(card => ({ ...card, playedByPlayer: false }));
};