import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export const Player = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const moveSpeed = 0.2;
    const direction = new THREE.Vector3();
    
    // Cámara follow logic (suave)
    const targetCamPos = meshRef.current.position.clone().add(new THREE.Vector3(0, 10, 15));
    camera.position.lerp(targetCamPos, 0.1);
    camera.lookAt(meshRef.current.position);

    // Movimiento relativo a cámara básica
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).negate();

    if (keys.current['KeyW']) direction.add(forward);
    if (keys.current['KeyS']) direction.sub(forward);
    if (keys.current['KeyA']) direction.sub(right);
    if (keys.current['KeyD']) direction.add(right);

    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(moveSpeed);
      meshRef.current.position.add(direction);
      const targetRotation = Math.atan2(direction.x, direction.z);
      meshRef.current.rotation.y = THREE.MathUtils.lerpAngle(meshRef.current.rotation.y, targetRotation, 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1, 0]} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
};
