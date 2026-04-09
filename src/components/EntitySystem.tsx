import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

interface EntityProps {
  type: 'car' | 'dog';
  initialPos: [number, number, number];
}

const Entity = ({ type, initialPos }: EntityProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { addMoney, addScore } = useGameStore();
  const [isInteracting, setIsInteracting] = useState(false);
  const interactionProgress = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Lógica de movimiento simple para autos (patrulla la calle)
    if (type === 'car') {
      meshRef.current.position.z += 0.05 * delta * 10; // Se mueven hacia adelante
      if (meshRef.current.position.z > 50) meshRef.current.position.z = -50; // Loop
    }

    // Lógica de interacción "Hold E"
    // Nota: Para esto necesitaríamos un listener global o capturar la tecla en el frame
  });

  return (
    <mesh ref={meshRef} position={initialPos} castShadow>
      {type === 'car' ? (
        <boxGeometry args={[2, 1.5, 4]} />
      ) : (
        <sphereGeometry args={[0.5, 16, 16]} />
      )}
      <meshStandardMaterial color={type === 'car' ? 'red' : 'brown'} />
    </mesh>
  );
};

export const EntitySystem = () => {
  const [entities, setEntities] = useState<{id: number, type: 'car' | 'dog', pos: [number, number, number]}[]>([]);

  useEffect(() => {
    // Spawn inicial
    const initial: any[] = [];
    for(let i=0; i<5; i++) {
      initial.push({ id: i, type: 'car', pos: [Math.random()*20-10, 0.75, Math.random()*40-20] });
    }
    setEntities(initial);

    // Spawn dinámico cada 10 seg
    const interval = setInterval(() => {
      setEntities(prev => [...prev, { 
        id: Date.now(), 
        type: Math.random() > 0.7 ? 'dog' : 'car', 
        pos: [Math.random()*40-20, 0.75, Math.random()*40-20] 
      }]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {entities.map(e => (
        <Entity key={e.id} type={e.type} initialPos={e.pos} />
      ))}
    </>
  );
};
