// =============================================
// NIVEL 3: "4 MANZANAS"
// =============================================

class Level3FourBlocks {
    constructor(game) {
        this.game = game;
        this.name = '4 Manzanas';
        this.description = '¡Muchísimo caos! Muchos autos y perros.';
    }

    setup() {
        // Limpiar escena actual
        while (this.game.scene.children.length > 0) {
            this.game.scene.remove(this.game.scene.children[0]);
        }

        // Configurar cámara para vista panorámica
        this.game.camera.position.set(0, 35, 60);
        this.game.camera.lookAt(0, 0, -10);

        // Crear suelo (asfalto de manzanas)
        const groundGeo = new THREE.PlaneGeometry(120, 100);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x37474F,
            roughness: 0.7
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.game.scene.add(ground);

        // Calles y manzanas
        this.createCityGrid();

        // Edificios alrededor
        this.createSurroundingBuildings();
    }

    createCityGrid() {
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });

        // Calles verticales (cada 20 metros - 4 manzanas)
        for (let x = -50; x <= 50; x += 20) {
            const lineGeo = new THREE.PlaneGeometry(1, 80);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.05, 0);
            this.game.scene.add(line);
        }

        // Calles horizontales (cada 20 metros)
        for (let z = -40; z <= 40; z += 20) {
            const lineGeo = new THREE.PlaneGeometry(100, 1);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.05, z);
            this.game.scene.add(line);
        }

        // Líneas de estacionamiento en cada manzana
        for (let x = -40; x <= 40; x += 20) {
            for (let z = -30; z <= 30; z += 15) {
                const lineGeo = new THREE.PlaneGeometry(8, 1);
                const line = new THREE.Mesh(lineGeo, lineMat);
                line.rotation.x = -Math.PI / 2;
                line.position.set(x, 0.05, z);
                this.game.scene.add(line);
            }
        }
    }

    createSurroundingBuildings() {
        // Crear edificios alrededor de la zona de juego
        const buildingMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

        // Edificios norte
        for (let x = -60; x <= 60; x += 25) {
            const height = 15 + Math.random() * 20;
            const buildingGeo = new THREE.BoxGeometry(12, height, 8);
            const building = new THREE.Mesh(buildingGeo, buildingMat);
            building.position.set(x, height / 2, -60);
            this.game.scene.add(building);

            // Ventanas
            for (let y = 5; y < height - 5; y += 8) {
                for (let z = -4; z <= 4; z += 5) {
                    const windowGeo = new THREE.PlaneGeometry(2, 3);
                    const windowMat = new THREE.MeshStandardMaterial({
                        color: 0xFFFFAA,
                        emissive: 0xFFFFAA,
                        emissiveIntensity: 0.2
                    });
                    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                    windowMesh.position.set(x, y, -56 + z * 0.5);
                    windowMesh.rotation.y = Math.PI / 2;
                    this.game.scene.add(windowMesh);
                }
            }
        }

        // Edificios sur
        for (let x = -60; x <= 60; x += 25) {
            const height = 15 + Math.random() * 20;
            const buildingGeo = new THREE.BoxGeometry(12, height, 8);
            const building = new THREE.Mesh(buildingGeo, buildingMat);
            building.position.set(x, height / 2, 60);
            this.game.scene.add(building);

            // Ventanas
            for (let y = 5; y < height - 5; y += 8) {
                for (let z = -4; z <= 4; z += 5) {
                    const windowGeo = new THREE.PlaneGeometry(2, 3);
                    const windowMat = new THREE.MeshStandardMaterial({
                        color: 0xFFFFAA,
                        emissive: 0xFFFFAA,
                        emissiveIntensity: 0.2
                    });
                    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                    windowMesh.position.set(x, y, 56 - z * 0.5);
                    windowMesh.rotation.y = -Math.PI / 2;
                    this.game.scene.add(windowMesh);
                }
            }
        }

        // Edificios este (izquierda)
        for (let z = -50; z <= 50; z += 25) {
            const height = 15 + Math.random() * 20;
            const buildingGeo = new THREE.BoxGeometry(8, height, 12);
            const building = new THREE.Mesh(buildingGeo, buildingMat);
            building.position.set(-60, height / 2, z);
            this.game.scene.add(building);

            // Ventanas
            for (let y = 5; y < height - 5; y += 8) {
                for (let x = -4; x <= 4; x += 5) {
                    const windowGeo = new THREE.PlaneGeometry(2, 3);
                    const windowMat = new THREE.MeshStandardMaterial({
                        color: 0xFFFFAA,
                        emissive: 0xFFFFAA,
                        emissiveIntensity: 0.2
                    });
                    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                    windowMesh.position.set(-56 + x * 0.5, y, z);
                    windowMesh.rotation.y = Math.PI;
                    this.game.scene.add(windowMesh);
                }
            }
        }

        // Edificios oeste (derecha)
        for (let z = -50; z <= 50; z += 25) {
            const height = 15 + Math.random() * 20;
            const buildingGeo = new THREE.BoxGeometry(8, height, 12);
            const building = new THREE.Mesh(buildingGeo, buildingMat);
            building.position.set(60, height / 2, z);
            this.game.scene.add(building);

            // Ventanas
            for (let y = 5; y < height - 5; y += 8) {
                for (let x = -4; x <= 4; x += 5) {
                    const windowGeo = new THREE.PlaneGeometry(2, 3);
                    const windowMat = new THREE.MeshStandardMaterial({
                        color: 0xFFFFAA,
                        emissive: 0xFFFFAA,
                        emissiveIntensity: 0.2
                    });
                    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                    windowMesh.position.set(56 - x * 0.5, y, z);
                    this.game.scene.add(windowMesh);
                }
            }
        }

        // Edificio principal (oficina de Beto en el centro)
        const mainBuildingGeo = new THREE.BoxGeometry(15, 30, 12);
        const mainBuildingMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const mainBuilding = new THREE.Mesh(mainBuildingGeo, mainBuildingMat);
        mainBuilding.position.set(0, 15, -25);
        this.game.scene.add(mainBuilding);

        // Letrero del edificio principal
        const signText = document.createElement('canvas');
        signText.width = 300;
        signText.height = 80;
        const ctx = signText.getContext('2d');
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 300, 80);
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.fillText('OFICINA DE BETO - ESTACIONAMIENTO', 150, 40);

        const texture = new THREE.CanvasTexture(signText);
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.5), new THREE.MeshBasicMaterial({ map: texture }));
        sign.position.set(0, 23, -19);
        this.game.scene.add(sign);
    }

    getSpawnPosition() {
        // Posiciones de spawn aleatorias en la zona de estacionamiento
        const positions = [];
        for (let x = -45; x <= 45; x += 8) {
            for (let z = -35; z <= 30; z += 6) {
                if (Math.random() > 0.3) { // No todas las posiciones están disponibles
                    positions.push({ x, z });
                }
            }
        }
        return positions[Math.floor(Math.random() * positions.length)];
    }

    checkCollision(playerPos) {
        // Verificar si el jugador está dentro de la zona de juego
        const inZone = playerPos.x > -60 && playerPos.x < 60 &&
                       playerPos.z > -50 && playerPos.z < 50;
        return { inZone: inZone };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level3FourBlocks;
}
