import { useState, useEffect, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, ContactShadows } from '@react-three/drei'

// Constants for gameplay
const INTERACTION_DISTANCE = 2.5;

// Car component that reports distance to Player
function Car({ position, playerPos, onNearCar }: { 
  position: [number, number, number], 
  playerPos: [number, number, number],
  onNearCar: (near: boolean) => void 
}) {
  useEffect(() => {
    const dx = position[0] - playerPos[0];
    const dz = position[2] - playerPos[2];
    const distance = Math.sqrt(dx * dx + dz * dz);
    onNearCar(distance < INTERACTION_DISTANCE);
  }, [playerPos, position, onNearCar]);

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#f44336" />
      </mesh>
      {[[-1.1, -0.5, 1.5], [1.1, -0.5, 1.5], [-1.1, -0.5, -1.5], [1.1, -0.5, -1.5]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2]} />
          <meshStandardMaterial color="black" />
        </mesh>
      ))}
    </group>
  )
}

function Street() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  )
}

// Helper component to handle the 'E' key within the Canvas context
function InteractionHandler({ isNearCar, onCollect }: { isNearCar: boolean, onCollect: () => void }) {
  useEffect(() => {
    const handleE = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && isNearCar) {
        onCollect();
      }
    };
    window.addEventListener('keydown', handleE);
    return () => window.removeEventListener('keydown', handleE);
  }, [isNearCar, onCollect]);

  return null;
}

export default function App() {
  const [score, setScore] = useState(0);
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 1, 0]);
  const [isNearCar, setIsNearCar] = useState(false);
  const [lastAction, setLastAction] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPlayerPos((prev) => {
        const newPos: [number, number, number] = [...prev];
        const speed = 0.4;
        if (e.key === 'ArrowUp' || e.key === 'w') newPos[2] -= speed;
        if (e.key === 'ArrowDown' || e.key === 's') newPos[2] += speed;
        if (e.key === 'ArrowLeft' || e.key === 'a') newPos[0] -= speed;
        if (e.key === 'ArrowRight' || e.key === 'd') newPos[0] += speed;
        return newPos;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCollect = useCallback(() => {
    setScore(s => s + 500);
    setLastAction("Collected $500!");
    setTimeout(() => setLastAction(""), 2000);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      {/* UI Overlay */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', zIndex: 10, fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Beto: The Life of Roberto</h1>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50', marginTop: '10px' }}>
          Money: ${score}
        </div>
        {isNearCar && (
           <div style={{ color: '#ffeb3b', fontSize: '18px', marginTop: '5px', animation: 'pulse 1s infinite' }}>
             Press [E] to collect money!
           </div>
        )}
        {lastAction && (
           <div style={{ color: '#4caf50', fontSize: '18px', marginTop: '5px' }}>
             {lastAction}
           </div>
        )}
        <p style={{ opacity: 0.7, fontSize: '14px' }}>Use WASD or Arrows to move</p>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      <Canvas shadows camera={{ position: [12, 12, 12], fov: 45 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        
        <Street />
        
        {/* Player mesh rendered directly in App */}
        <mesh position={playerPos} castShadow>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="#2196f3" />
        </mesh>

        {/* Car component */}
        <Car 
          position={[3, 0.5, -2]} 
          playerPos={playerPos} 
          onNearCar={(near) => setIsNearCar(near)} 
        />

        <InteractionHandler isNearCar={isNearCar} onCollect={handleCollect} />
        
        <OrbitControls />
        <ContactShadows opacity={0.5} scale={20} blur={2} far={4.5} />
      </Canvas>
    </div>
  )
}
