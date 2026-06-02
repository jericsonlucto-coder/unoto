export type CardColor = 'rgb(255, 6, 0)' | 'rgb(0, 170, 69)' | 'rgb(0, 150, 224)' | 'rgb(255, 222, 0)' | 'any';

export interface Card {
  color: CardColor;
  value: number;
  points: number;
  changeTurn: boolean;
  drawValue: number;
  src: string;
  playedByPlayer?: boolean;
}

export type Player = 'player' | 'cpu';

export interface GameState {
  playerHand: Card[];
  cpuHand: Card[];
  deck: Card[];
  playPile: Card[];
  playerScore: number;
  cpuScore: number;
  playerTurn: boolean;
  gameOn: boolean;
  colorPickerIsOpen: boolean;
  showUno: {
    player: boolean;
    cpu: boolean;
  };
  roundWinner: Player | null;
  gameWinner: Player | null;
}