import { create } from 'zustand';

interface GameState {
  money: number;
  score: number;
  level: number;
  isGameOver: boolean;
  difficultyMultiplier: number;
  resetGame: () => void;
  addMoney: (amount: number) => void;
  addScore: (points: number) => void;
  nextLevel: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  money: 0,
  score: 0,
  level: 1,
  isGameOver: false,
  difficultyMultiplier: 1,
  resetGame: () => set({ money: 0, score: 0, level: 1, isGameOver: false, difficultyMultiplier: 1 }),
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  nextLevel: () => set((state) => ({ 
    level: state.level + 1, 
    difficultyMultiplier: state.difficultyMultiplier + 0.2 
  })),
}));
