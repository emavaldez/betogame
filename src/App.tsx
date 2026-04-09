import React from 'react';
import { GameScene } from './components/GameScene';
import { useGameStore } from './store/useGameStore';

function App() {
  const { money, score, resetGame } = useGameStore();
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', backgroundColor: '#000' }}>
      {/* HUD / UI */}
      <div style={{ 
        position: 'absolute', top: '20px', left: '20px', zIndex: 10, 
        color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none' 
      }}>
        <h2 style={{ margin: 0 }}>BETO GAME</h2>
        <div style={{ fontSize: '1.5rem' }}>💰 ${money}</div>
        <div style={{ fontSize: '1.2rem' }}>🏆 Score: {score}</div>
        <p style={{ opacity: 0.7 }}>WASD para mover | Mouse para rotar</p>
      </div>

      <button 
        onClick={resetGame} 
        style={{ 
          position: 'absolute', bottom: '20px', right: '20px', zIndex: 10,
          padding: '10px 20px', cursor: 'pointer'
        }}
      >
        Reiniciar
      </button>

      {/* El Motor 3D */}
      <GameScene />
    </div>
  );
}

export default App;
