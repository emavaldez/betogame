import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars, ContactShadows, Environment } from '@react-three/drei';
import { Player } from './Player';
import { EntitySystem } from './EntitySystem';

export const GameScene = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows camera={{ position: [0, 15, 20], fov: 50 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        
        <Environment preset="city" />

        {/* Suelo / Mapa */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#222" roughness={0.8} />
        </mesh>

        {/* Calles simples (Visual) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <planeGeometry args={[10, 200]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        <Player />
        <EntitySystem />
        
        <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Canvas>
    </div>
  );
};
