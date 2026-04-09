import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

export const PlayerController = ({ playerMesh }: { playerMesh: THREE.Mesh | null }) => {
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

  useFrame(() => {
    if (!playerMesh) return;

    const moveSpeed = 0.15 * (1 / camera.fov * 10); // Ajuste dinámico básico
    const direction = new THREE.Vector3();
    
    // Cámara orientada hacia el jugador para efecto 3ra persona
    const targetCamPos = playerMesh.position.clone().add(new THREE.Vector3(0, 8, 12));
    camera.position.lerp(targetCamPos, 0.1);
    camera.lookAt(playerMesh.position);

    // Movimiento relativo a la cámara (simplificado para evitar jitter)
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
      playerMesh.position.add(direction);
      
      // Rotar el mesh hacia la dirección del movimiento
      const targetRotation = Math.atan2(direction.x, direction.z);
      playerMesh.rotation.y = THREE.MathUtils.lerpAngle(playerMesh.rotation.y, targetRotation, 0.1);
    }
  });

  return null;
};
