// =============================================
// NIVEL 1: "LA CALLE"
// =============================================

class Level1Street {
    constructor(game) {
        this.game = game;
        this.name = 'La Calle';
        this.description = 'Pocos autos, pocos perros. Aprende las mecánicas.';
    }

    setup() {
        // Limpiar escena actual
        while (this.game.scene.children.length > 0) {
            this.game.scene.remove(this.game.scene.children[0]);
        }

        // Configurar cámara para vista de calle
        this.game.camera.position.set(0, 15, 35);
        this.game.camera.lookAt(0, 0, -10);

        // Crear suelo (calle)
        const groundGeo = new THREE.PlaneGeometry(80, 60);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x546E7A, // Gris asfalto
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        this.game.scene.add(ground);

        // Líneas de la calle
        this.createRoadLines();

        // Banquetas
        this.createSidewalks();

        // Edificios al fondo (simulados con cajas)
        this.createBackgroundBuildings();

        // Señalética
        this.createSignage();
    }

    createRoadLines() {
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });

        // Línea central discontinua
        for (let i = -30; i < 30; i += 4) {
            const lineGeo = new THREE.PlaneGeometry(1, 2);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(i, 0.05, -10);
            this.game.scene.add(line);
        }

        // Líneas laterales
        for (let i = -35; i < 35; i += 10) {
            const lineGeo = new THREE.PlaneGeometry(1, 60);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(i, 0.05, -30);
            this.game.scene.add(line);
        }
    }

    createSidewalks() {
        const sidewalkMat = new THREE.MeshStandardMaterial({
            color: 0x8D6E63,
            roughness: 0.9
        });

        // Banqueta superior
        const topSidewalkGeo = new THREE.PlaneGeometry(40, 10);
        const topSidewalk = new THREE.Mesh(topSidewalkGeo, sidewalkMat);
        topSidewalk.rotation.x = -Math.PI / 2;
        topSidewalk.position.set(-35, 0.1, -35);
        this.game.scene.add(topSidewalk);

        // Banqueta inferior
        const bottomSidewalkGeo = new THREE.PlaneGeometry(40, 10);
        const bottomSidewalk = new THREE.Mesh(bottomSidewalkGeo, sidewalkMat);
        bottomSidewalk.rotation.x = -Math.PI / 2;
        bottomSidewalk.position.set(-35, 0.1, 35);
        this.game.scene.add(bottomSidewalk);

        // Patios
        const yardMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
        for (let i = -30; i < 30; i += 12) {
            const yardGeo = new THREE.PlaneGeometry(8, 8);
            const yard = new THREE.Mesh(yardGeo, yardMat);
            yard.rotation.x = -Math.PI / 2;
            yard.position.set(i, 0.1, -45);
            this.game.scene.add(yard);

            // Arbolito simple
            const trunkGeo = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x795548 });
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(i, 1, -45);

            const leavesGeo = new THREE.SphereGeometry(1.2, 8, 8);
            const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
            const leaves = new THREE.Mesh(leavesGeo, leavesMat);
            leaves.position.set(i, 3, -45);

            this.game.scene.add(trunk);
            this.game.scene.add(leaves);
        }
    }

    createBackgroundBuildings() {
        const buildingColors = [0x798CB5, 0x607D8B, 0x546E7A];
        const buildingMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });

        // Fondo de edificios (simulado con paredes)
        for (let i = -40; i < 40; i += 15) {
            const buildingGeo = new THREE.BoxGeometry(8, 25, 6);
            const building = new THREE.Mesh(buildingGeo, buildingMat);
            building.position.set(i, 12.5, -50);
            this.game.scene.add(building);

            // Ventanas
            for (let j = 0; j < 3; j++) {
                const windowGeo = new THREE.PlaneGeometry(2, 1.5);
                const windowMat = new THREE.MeshStandardMaterial({
                    color: 0xFFFFAA,
                    emissive: 0xFFFFAA,
                    emissiveIntensity: 0.3
                });
                const windowMesh = new THREE.Mesh(windowGeo, windowMat);
                windowMesh.position.set(i, 15 + j * 8, -47);
                windowMesh.rotation.y = Math.PI / 2;
                this.game.scene.add(windowMesh);
            }
        }

        // Edificio de la oficina de Beto
        const betoOfficeGeo = new THREE.BoxGeometry(10, 20, 8);
        const betoOfficeMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const betoOffice = new THREE.Mesh(betoOfficeGeo, betoOfficeMat);
        betoOffice.position.set(-50, 10, -30);
        this.game.scene.add(betoOffice);

        // Letrero de la oficina
        const signText = document.createElement('canvas');
        signText.width = 256;
        signText.height = 64;
        const ctx = signText.getContext('2d');
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 256, 64);
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.fillText('OFICINA DE BETO', 128, 32);

        const signTexture = new THREE.CanvasTexture(signText);
        const signGeo = new THREE.PlaneGeometry(6, 2);
        const signMat = new THREE.MeshBasicMaterial({ map: signTexture });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(-50, 18, -26);
        this.game.scene.add(sign);
    }

    createSignage() {
        // Señal de estacionamiento
        const signGeo = new THREE.BoxGeometry(1.5, 2, 0.1);
        const signMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.set(-35, 1.5, -45);
        this.game.scene.add(sign);

        // Letrero de "NO ESTACIONAR"
        const noParkText = document.createElement('canvas');
        noParkText.width = 200;
        noParkText.height = 60;
        const ctx = noParkText.getContext('2d');
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, 200, 60);
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#F00';
        ctx.fillText('NO ESTACIONAR', 100, 30);

        const texture = new THREE.CanvasTexture(noParkText);
        const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), new THREE.MeshBasicMaterial({ map: texture }));
        textMesh.position.set(-35, 4, -45);
        this.game.scene.add(textMesh);

        // Señal de "ENTRADA"
        const entryText = document.createElement('canvas');
        entryText.width = 180;
        entryText.height = 60;
        const ctx2 = entryText.getContext('2d');
        ctx2.fillStyle = '#FFF';
        ctx2.fillRect(0, 0, 180, 60);
        ctx2.font = 'bold 24px Arial';
        ctx2.textAlign = 'center';
        ctx2.textBaseline = 'middle';
        ctx2.fillStyle = '#00FF00';
        ctx2.fillText('ENTRADA', 90, 30);

        const entryTexture = new THREE.CanvasTexture(entryText);
        const entryMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2), new THREE.MeshBasicMaterial({ map: entryTexture }));
        entryMesh.position.set(-35, 1.5, -58);
        this.game.scene.add(entryMesh);

        // Faroles de calle
        const poleGeo = new THREE.CylinderGeometry(0.2, 0.2, 6, 8);
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        for (let i = -45; i < 45; i += 15) {
            const pole = new THREE.Mesh(poleGeo, poleMat);
            pole.position.set(i, 3, 25);
            this.game.scene.add(pole);

            // Luminaire
            const lampGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
            const lampMat = new THREE.MeshStandardMaterial({ color: 0xFFFFAA });
            const lamp = new THREE.Mesh(lampGeo, lampMat);
            lamp.position.set(i, 6, 25);
            this.game.scene.add(lamp);

            // Luz puntual
            const pointLight = new THREE.PointLight(0xFFFFAA, 1, 20);
            pointLight.position.set(i, 7, 25);
            this.game.scene.add(pointLight);
        }
    }

    getSpawnPosition() {
        // Posiciones de spawn aleatorias en la calle
        const positions = [
            { x: -30, z: -40 },
            { x: -15, z: -40 },
            { x: 0, z: -40 },
            { x: 15, z: -40 },
            { x: 30, z: -40 }
        ];
        return positions[Math.floor(Math.random() * positions.length)];
    }

    checkCollision(playerPos) {
        // Verificar si el jugador está en la banqueta
        const isOnSidewalk = playerPos.x < -25;
        return { onSidewalk: isOnSidewalk };
    }
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level1Street;
}
