// =============================================
// NIVEL 2: "LA PLAZA"
// =============================================

class Level2Plaza {
    constructor(game) {
        this.game = game;
        this.name = 'La Plaza';
        this.description = 'Espacio abierto, más autos y perros.';
    }

    setup() {
        // Limpiar escena actual
        while (this.game.scene.children.length > 0) {
            this.game.scene.remove(this.game.scene.children[0]);
        }

        // Configurar cámara para vista isométrica/panorámica
        this.game.camera.position.set(0, 25, 40);
        this.game.camera.lookAt(0, 0, -10);

        // Crear suelo (plaza de estacionamiento)
        const groundGeo = new THREE.PlaneGeometry(80, 60);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x5D4037, // Tierra/patio
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.game.scene.add(ground);

        // Líneas de estacionamiento (cuadrícula)
        this.createParkingGrid();

        // Vallas y límites
        this.createFences();
    }

    createParkingGrid() {
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });

        // Líneas verticales (cada 6 metros)
        for (let x = -35; x <= 35; x += 6) {
            const lineGeo = new THREE.PlaneGeometry(1, 40);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.05, 0);
            this.game.scene.add(line);

            // Números de espacio
            if (x % 18 === 0) {
                const spaceText = document.createElement('canvas');
                spaceText.width = 64;
                spaceText.height = 32;
                const ctx = spaceText.getContext('2d');
                ctx.fillStyle = '#FFF';
                ctx.fillRect(0, 0, 64, 32);
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#333';
                ctx.fillText('P' + (Math.abs(x) / 6 + 1), 32, 16);

                const texture = new THREE.CanvasTexture(spaceText);
                const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ map: texture }));
                textMesh.position.set(x, 0.2, -5);
                this.game.scene.add(textMesh);
            }
        }

        // Líneas horizontales
        for (let z = -25; z <= 15; z += 6) {
            const lineGeo = new THREE.PlaneGeometry(70, 1);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.05, z);
            this.game.scene.add(line);
        }
    }

    createFences() {
        // Valla de madera alrededor de la plaza
        const fenceGeo = new THREE.PlaneGeometry(80, 4);
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });

        const northFence = new THREE.Mesh(fenceGeo, fenceMat);
        northFence.rotation.x = -Math.PI / 2;
        northFence.position.set(0, 2, -45);
        this.game.scene.add(northFence);

        const southFence = new THREE.Mesh(fenceGeo, fenceMat);
        southFence.rotation.x = -Math.PI / 2;
        southFence.position.set(0, 2, 30);
        this.game.scene.add(southFence);

        const eastFence = new THREE.Mesh(new THREE.PlaneGeometry(4, 60), fenceMat);
        eastFence.rotation.x = -Math.PI / 2;
        eastFence.position.set(45, 2, 0);
        this.game.scene.add(eastFence);

        const westFence = new THREE.Mesh(new THREE.PlaneGeometry(4, 60), fenceMat);
        westFence.rotation.x = -Math.PI / 2;
        westFence.position.set(-45, 2, 0);
        this.game.scene.add(westFence);

        // Puerta de entrada
        const gateGeo = new THREE.BoxGeometry(8, 3, 0.5);
        const gateMat = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const gate = new THREE.Mesh(gateGeo, gateMat);
        gate.position.set(-45, 1.5, -15);
        this.game.scene.add(gate);

        // Letrero de entrada
        const signText = document.createElement('canvas');
        signText.width = 200;
        signText.height = 60;
        const ctx = signText.getContext('2d');
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 200, 60);
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('ESTACIONAMIENTO', 100, 30);

        const texture = new THREE.CanvasTexture(signText);
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), new THREE.MeshBasicMaterial({ map: texture }));
        sign.position.set(-45, 5, -15);
        this.game.scene.add(sign);
    }

    getSpawnPosition() {
        // Posiciones de spawn aleatorias en la plaza
        const positions = [
            { x: -30, z: -42 },
            { x: -20, z: -42 },
            { x: -10, z: -42 },
            { x: 0, z: -42 },
            { x: 10, z: -42 },
            { x: 20, z: -42 },
            { x: 30, z: -42 }
        ];
        return positions[Math.floor(Math.random() * positions.length)];
    }

    checkCollision(playerPos) {
        // Verificar si el jugador está dentro de la plaza
        const inPlaza = playerPos.x > -45 && playerPos.x < 45 &&
                        playerPos.z > -40 && playerPos.z < 35;
        return { inPlaza: inPlaza };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level2Plaza;
}
