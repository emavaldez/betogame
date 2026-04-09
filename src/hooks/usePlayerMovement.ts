import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const usePlayerMovement = (camera: THREE.Camera, playerMesh: THREE.Mesh | null) => {
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

  useEffect(() => {
    if (!playerMesh) return;

    const moveSpeed = 0.15;
    let frameId: number;

    const update = () => {
      const direction = new THREE.Vector3();
      
      // Obtener dirección de la cámara para movimiento relativo
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).negate();

      if (keys.current['KeyW'] || keys.current['ArrowUp']) direction.add(forward);
      if (keys.current['KeyS'] || keys.current['ArrowDown']) direction.sub(forward);
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) direction.sub(right);
      if (keys.current['KeyD'] || keys.current['ArrowRight']) direction.add(right);

      if (direction.length() > 0) {
        direction.normalize().multiplyScalar(moveSpeed);
        playerMesh.position.add(direction);
      }

      // La cámara sigue al jugador
      const idealOffset = new THREE.Vector3(0, 5, 10).applyQuaternion(camera.quaternion); // Esto es simplificado
      // Para una cámara de 3ra persona real, la posición debe estar detrás del mesh:
      const targetPos = playerMesh.position.clone().add(new THREE.Vector3(0, 5, 8)); 
      // Nota: Implementación básica para evitar lag en el reconstrucción
      
      frameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(frameId);
  }, [playerMesh, camera]);
};
