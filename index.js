// =============================================
// LA VIDA DE BETO - Juego Principal (ES Module)
// =============================================

import * as THREE from 'three';

// =============================================
// CLASES DE ENTIDADES
// =============================================

class Entity {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = 0;
        this.scale = 1;
        this.visible = true;
    }

    update(deltaTime) {}

    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(m => m.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
        }
    }
}

class Beto extends Entity {
    constructor(scene) {
        super(scene);
        this.speed = 0.15;
        this.direction = new THREE.Vector3(0, 0, 1);
        this.isMoving = false;
        this.targetPosition = null;
        this.walkCycle = 0;
        this.walkSpeed = 5;
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();

        // Cuerpo (azul Boca)
        const bodyGeo = new THREE.BoxGeometry(1, 1.2, 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0000FF });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        group.add(body);

        // Camiseta amarilla
        const jerseyGeo = new THREE.BoxGeometry(1.2, 0.8, 0.7);
        const jerseyMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const jersey = new THREE.Mesh(jerseyGeo, jerseyMat);
        jersey.position.y = 1.0;
        group.add(jersey);

        // Cabeza
        const headGeo = new THREE.BoxGeometry(0.6, 0.7, 0.6);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xFFCCAA });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.8;
        group.add(head);

        // Ojos
        const eyeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.1);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.2, 1.8, 0.35);
        group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.2, 1.8, 0.35);
        group.add(rightEye);

        // Bermuda
        const pantsGeo = new THREE.BoxGeometry(0.8, 0.6, 0.7);
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
        const pants = new THREE.Mesh(pantsGeo, pantsMat);
        pants.position.y = 0.3;
        group.add(pants);

        // Manos
        const handGeo = new THREE.BoxGeometry(0.35, 0.4, 0.35);
        this.hands = [];
        for (let i = 0; i < 2; i++) {
            const hand = new THREE.Mesh(handGeo, headMat);
            hand.position.set(i === 0 ? -0.7 : 0.7, 1.4, 0);
            group.add(hand);
            this.hands.push(hand);
        }

        // Piernas
        const legGeo = new THREE.BoxGeometry(0.35, 0.8, 0.35);
        this.legs = [];
        for (let i = 0; i < 2; i++) {
            const leg = new THREE.Mesh(legGeo, pantsMat);
            leg.position.set(i === 0 ? -0.4 : 0.4, 0.4, 0);
            group.add(leg);
            this.legs.push(leg);
        }

        // Bandana
        const hatGeo = new THREE.BoxGeometry(1.0, 0.2, 1.0);
        const hatMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const hat = new THREE.Mesh(hatGeo, hatMat);
        hat.position.y = 2.3;
        group.add(hat);

        this.mesh = group;
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.visible) return;

        this.walkCycle += deltaTime * this.walkSpeed;

        if (this.legs && this.legs.length > 1) {
            const offset = Math.sin(this.walkCycle) * 0.3;
            this.legs[0].rotation.x = offset;
            this.legs[1].rotation.x = -offset;
        }
        if (this.hands && this.hands.length > 1) {
            const offset = Math.cos(this.walkCycle) * 0.3;
            this.hands[0].rotation.y = offset;
            this.hands[1].rotation.y = -offset;
        }

        if (this.targetPosition) {
            const direction = new THREE.Vector3()
                .subVectors(this.targetPosition, this.mesh.position)
                .normalize();
            const distance = this.mesh.position.distanceTo(this.targetPosition);

            if (distance > 0.1) {
                this.mesh.position.add(direction.multiplyScalar(this.speed));
                this.isMoving = true;
                this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
            } else {
                this.targetPosition = null;
                this.isMoving = false;
            }
        }

        const limit = 45;
        this.mesh.position.x = Math.max(-limit, Math.min(limit, this.mesh.position.x));
        this.mesh.position.z = Math.max(-limit, Math.min(limit, this.mesh.position.z));
    }

    move(keys) {
        const moveVector = new THREE.Vector3(0, 0, 0);
        const keyList = Array.isArray(keys) ? keys : Object.keys(keys);

        if (keyList.includes('w') || keyList.includes('arrowup')) moveVector.z -= 1;
        if (keyList.includes('s') || keyList.includes('arrowdown')) moveVector.z += 1;
        if (keyList.includes('a') || keyList.includes('arrowleft')) moveVector.x -= 1;
        if (keyList.includes('d') || keyList.includes('arrowright')) moveVector.x += 1;

        if (moveVector.length() > 0) {
            moveVector.normalize().multiplyScalar(this.speed * 10);
            const newPos = this.mesh.position.clone().add(moveVector);
            newPos.x = Math.max(-45, Math.min(45, newPos.x));
            newPos.z = Math.max(-45, Math.min(45, newPos.z));
            this.targetPosition = newPos;
        }
    }

    moveTo(x, z) {
        this.targetPosition = new THREE.Vector3(x, 0.5, z);
    }
}

class Car extends Entity {
    constructor(scene) {
        super(scene);
        this.color = Math.random() * 0xffffff;
        this.state = 'waiting';
        this.parkPosition = null;
        this.arrivalTime = Date.now();
        this.maxWaitTime = 15000;
        this.parkStartTime = 0;
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();

        const chassisMat = new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.3, metalness: 0.7 });

        // Chasis
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.5), chassisMat);
        group.add(chassis);

        // Techo
        const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 2.5), chassisMat);
        roof.position.y = 1.0;
        group.add(roof);

        // Ventanas
        const windows = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.25, 2.0),
            new THREE.MeshStandardMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.5 })
        );
        windows.position.y = 1.4;
        group.add(windows);

        // Ruedas
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        [[-1.1, 0.4, -1.8], [1.1, 0.4, -1.8], [-1.1, 0.4, 1.8], [1.1, 0.4, 1.8]].forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            group.add(wheel);
        });

        // Faros
        const lightMat = new THREE.MeshStandardMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA, emissiveIntensity: 0.5 });
        [-0.8, 0.8].forEach(x => {
            const headlight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), lightMat);
            headlight.position.set(x, 0.6, -2.3);
            group.add(headlight);
        });

        // Indicador flotante
        const indicatorMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.5 });
        this.indicator = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), indicatorMat);
        this.indicator.position.y = 2.8;
        group.add(this.indicator);

        this.mesh = group;
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.visible) return;

        // Animar indicador
        if (this.indicator) {
            this.indicator.rotation.y += deltaTime * 2;
            this.indicator.position.y = 2.8 + Math.sin(Date.now() * 0.003) * 0.2;
        }

        switch (this.state) {
            case 'waiting': {
                const elapsed = Date.now() - this.arrivalTime;
                if (elapsed >= this.maxWaitTime) {
                    if (Math.random() < 0.01) this.state = 'leaving';
                }
                break;
            }
            case 'parking': {
                if (this.parkPosition) {
                    const target = new THREE.Vector3(this.parkPosition.x, 0.5, this.parkPosition.z);
                    const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
                    const dist = dir.length();
                    if (dist > 0.3) {
                        dir.normalize();
                        this.mesh.position.add(dir.multiplyScalar(0.12));
                        this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
                    } else {
                        this.mesh.position.copy(target);
                        this.state = 'parked';
                        if (this.indicator) this.indicator.visible = false;
                    }
                }
                break;
            }
            case 'leaving': {
                this.mesh.position.z += deltaTime * 8;
                if (this.mesh.position.z > 70) this.visible = false;
                break;
            }
        }

        this.mesh.position.y = 0.5;
    }

    markForParking(x, z) {
        this.state = 'parking';
        this.parkStartTime = Date.now();
        this.parkPosition = { x, z };
    }

    leave() {
        this.state = 'leaving';
    }
}

class Dog extends Entity {
    constructor(scene) {
        super(scene);
        this.state = 'wandering';
        this.attackTime = 0;
        this.walkTime = 0;
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8D6E63 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });

        // Cuerpo
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.0), bodyMat);
        body.position.y = 0.6;
        group.add(body);

        // Cabeza
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.2), darkMat);
        head.position.set(0, 1.4, 0.8);
        group.add(head);

        // Orejas
        [-0.5, 0.5].forEach((x, i) => {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.1), darkMat);
            ear.position.set(x, 1.7, 0.8);
            ear.rotation.z = i === 0 ? Math.PI / 6 : -Math.PI / 6;
            group.add(ear);
        });

        // Ojos
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        [-0.35, 0.35].forEach(x => {
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), eyeMat);
            eye.position.set(x, 1.4, 1.15);
            group.add(eye);
        });

        // Patas (guardamos refs para animar)
        const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        this.patas = [];
        [[-0.5, 0.4, -0.7], [0.5, 0.4, -0.7], [-0.5, 0.4, 0.8], [0.5, 0.4, 0.8]].forEach(pos => {
            const leg = new THREE.Mesh(legGeo, darkMat);
            leg.position.set(...pos);
            group.add(leg);
            this.patas.push(leg);
        });

        // Cola
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 0.8, 8), darkMat);
        tail.position.set(0, 1.2, -1.1);
        tail.rotation.x = -0.5;
        group.add(tail);
        this.tail = tail;

        this.mesh = group;
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.visible) return;

        switch (this.state) {
            case 'wandering': {
                const speed = 0.06;
                if (Math.random() < 0.02) {
                    this.mesh.rotation.y += (Math.random() - 0.5) * Math.PI / 2;
                }
                this.mesh.position.x += Math.sin(this.mesh.rotation.y) * speed;
                this.mesh.position.z += Math.cos(this.mesh.rotation.y) * speed;

                const limit = 44;
                this.mesh.position.x = Math.max(-limit, Math.min(limit, this.mesh.position.x));
                this.mesh.position.z = Math.max(-limit, Math.min(limit, this.mesh.position.z));

                // Animar patas
                this.walkTime += deltaTime * 6;
                if (this.patas.length >= 4) {
                    this.patas[0].rotation.x = Math.sin(this.walkTime) * 0.4;
                    this.patas[1].rotation.x = -Math.sin(this.walkTime) * 0.4;
                    this.patas[2].rotation.x = -Math.sin(this.walkTime) * 0.4;
                    this.patas[3].rotation.x = Math.sin(this.walkTime) * 0.4;
                }
                if (this.tail) this.tail.rotation.z = Math.sin(this.walkTime * 2) * 0.3;
                break;
            }
            case 'attacking': {
                if (Date.now() - this.attackTime > 1500) this.state = 'leaving';
                break;
            }
            case 'leaving': {
                this.mesh.position.z += deltaTime * 6;
                if (this.mesh.position.z > 70) this.visible = false;
                break;
            }
        }

        this.mesh.position.y = 0;
    }

    attack() {
        this.state = 'attacking';
        this.attackTime = Date.now();
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (this.visible) {
                    this.mesh.scale.set(1.5, 1.5, 1.5);
                    setTimeout(() => { if (this.visible) this.mesh.scale.set(1, 1, 1); }, 200);
                }
            }, i * 350);
        }
    }
}

// =============================================
// MOTOR DEL JUEGO
// =============================================

const CONFIG = {
    colors: { grass: 0x4CAF50, lineWhite: 0xFFFFFF },
    levels: {
        1: { spawnRate: 2000, dogRate: 4000 },
        2: { spawnRate: 1200, dogRate: 2500 },
        3: { spawnRate: 700, dogRate: 1500 }
    }
};

const GAME = {
    state: 'START',
    currentLevel: 1,
    money: 100,
    lives: 3,
    maxCars: 15,
    entities: { cars: [], passengers: [], dogs: [] },
    keys: {},
    beto: null,
    spawnInterval: null,
    dogInterval: null
};

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 25, 45);
        this.camera.lookAt(0, 0, -5);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        this.groundMesh = null;

        this.setupLights();
        this.setupInitialScene();
        this.setupEvents();

        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(15, 30, 15);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    setupInitialScene() {
        // Suelo
        const groundGeo = new THREE.PlaneGeometry(120, 120);
        const groundMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.grass, roughness: 0.9 });
        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.receiveShadow = true;
        this.groundMesh.userData.isGround = true;
        this.scene.add(this.groundMesh);

        // Líneas de estacionamiento
        this.createParkingLines();
    }

    createParkingLines() {
        const lineMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.lineWhite, roughness: 0.5 });
        for (let x = -36; x <= 36; x += 6) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 8), lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.05, -10);
            this.scene.add(line);
        }
        // Líneas horizontales delimitadoras
        for (let z of [-6, -14]) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(80, 0.5), lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.05, z);
            this.scene.add(line);
        }
    }

    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('keydown', e => {
            GAME.keys[e.key.toLowerCase()] = true;
            if (GAME.state === 'PLAYING' && GAME.beto) {
                GAME.beto.move(Object.keys(GAME.keys).filter(k => GAME.keys[k]));
            }
        });

        document.addEventListener('keyup', e => {
            GAME.keys[e.key.toLowerCase()] = false;
        });

        this.canvas.addEventListener('click', e => this.onCanvasClick(e));
    }

    onCanvasClick(e) {
        if (GAME.state !== 'PLAYING' || !GAME.beto) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        const intersects = raycaster.intersectObject(this.groundMesh);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            GAME.beto.moveTo(point.x, point.z);
            this.showMark(point.x, point.z);

            // Buscar auto cercano para estacionar
            const nearbyCar = GAME.entities.cars.find(car => {
                if (car.state !== 'waiting') return false;
                const dist = car.mesh.position.distanceTo(GAME.beto.mesh.position);
                return dist < 8;
            });

            if (nearbyCar) {
                nearbyCar.markForParking(point.x, point.z);
                this.showMessage('¡Auto guiado! 🚗', '#4CAF50');
            }
        }
    }

    showMark(x, z) {
        const markerMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.8 });
        const marker = new THREE.Mesh(new THREE.BoxGeometry(1, 0.15, 1), markerMat);
        marker.position.set(x, 0.15, z);
        this.scene.add(marker);

        let opacity = 0.8;
        const fade = setInterval(() => {
            opacity -= 0.08;
            markerMat.opacity = opacity;
            if (opacity <= 0) {
                clearInterval(fade);
                this.scene.remove(marker);
            }
        }, 80);
    }

    showMessage(text, color = '#FFD700') {
        const msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.75);
            color: ${color};
            padding: 14px 28px;
            border-radius: 10px;
            font-size: 22px;
            font-weight: bold;
            pointer-events: none;
            z-index: 100;
            transition: opacity 0.4s, transform 0.4s;
        `;
        document.body.appendChild(msg);
        setTimeout(() => {
            msg.style.opacity = '0';
            msg.style.transform = 'translate(-50%, -70%)';
        }, 800);
        setTimeout(() => msg.remove(), 1300);
    }

    loop(time) {
        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        if (GAME.state === 'PLAYING') {
            if (GAME.beto) GAME.beto.update(deltaTime);

            GAME.entities.cars.forEach(car => car.update(deltaTime));
            GAME.entities.dogs.forEach(dog => dog.update(deltaTime));

            // Detectar perro cerca de Beto
            GAME.entities.dogs.forEach(dog => {
                if (dog.state === 'wandering' && GAME.beto) {
                    const dist = dog.mesh.position.distanceTo(GAME.beto.mesh.position);
                    if (dist < 3) {
                        dog.attack();
                        GAME.money = Math.max(0, GAME.money - 10);
                        this.showMessage('¡Un perro te mordió! -$10 🐕', '#f44336');
                    }
                }
            });

            // Detectar pasajeros/autos estacionados cerca de Beto para cobrar
            GAME.entities.cars.forEach(car => {
                if (car.state === 'parked' && GAME.beto) {
                    const dist = car.mesh.position.distanceTo(GAME.beto.mesh.position);
                    if (dist < 4 && !car.collected) {
                        car.collected = true;
                        const earned = 20 + Math.floor(Math.random() * 30);
                        GAME.money += earned;
                        this.showMessage(`+$${earned} cobrado! 💰`, '#4CAF50');
                        setTimeout(() => car.leave(), 2000);
                    }
                }
            });

            // Limpiar entidades invisibles
            GAME.entities.cars = GAME.entities.cars.filter(c => {
                if (!c.visible) { this.scene.remove(c.mesh); return false; }
                return true;
            });
            GAME.entities.dogs = GAME.entities.dogs.filter(d => {
                if (!d.visible) { this.scene.remove(d.mesh); return false; }
                return true;
            });

            // Game over checks
            if (GAME.money <= 0) this.gameOver('¡Te quedaste sin plata!');
        }

        this.updateUI();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(t => this.loop(t));
    }

    updateUI() {
        const moneyEl = document.getElementById('money-display');
        const livesEl = document.getElementById('lives-display');
        const levelEl = document.getElementById('level-display');
        const carsEl = document.getElementById('cars-display');

        if (moneyEl) moneyEl.textContent = `$${GAME.money}`;
        if (livesEl) livesEl.textContent = GAME.lives;
        if (levelEl) {
            const names = ['La Calle', 'La Plaza', '4 Manzanas'];
            levelEl.textContent = `${GAME.currentLevel} - ${names[GAME.currentLevel - 1]}`;
        }
        if (carsEl) carsEl.textContent = `${GAME.entities.cars.length}/${GAME.maxCars}`;
    }

    startGame(level) {
        GAME.state = 'PLAYING';
        GAME.currentLevel = level;
        GAME.money = 100;
        GAME.lives = 3;
        GAME.entities.cars = [];
        GAME.entities.dogs = [];
        GAME.entities.passengers = [];

        // Limpiar la escena de entidades previas (no las luces)
        const toRemove = [];
        this.scene.traverse(obj => {
            if (obj.userData.isEntity) toRemove.push(obj);
        });
        toRemove.forEach(obj => this.scene.remove(obj));

        // Si no hay suelo todavía (por si acaso), lo recreamos
        if (!this.groundMesh || !this.scene.children.includes(this.groundMesh)) {
            this.setupInitialScene();
        }

        // Crear a Beto
        GAME.beto = new Beto(this.scene);
        GAME.beto.mesh.position.set(0, 0.5, 5);
        GAME.beto.mesh.userData.isEntity = true;

        // Limpiar intervals anteriores
        if (GAME.spawnInterval) clearInterval(GAME.spawnInterval);
        if (GAME.dogInterval) clearInterval(GAME.dogInterval);

        const cfg = CONFIG.levels[level] || CONFIG.levels[1];

        // Spawn de autos
        GAME.spawnInterval = setInterval(() => {
            if (GAME.state !== 'PLAYING') return;
            if (GAME.entities.cars.length >= GAME.maxCars) return;

            const car = new Car(this.scene);
            car.mesh.position.set(
                (Math.random() - 0.5) * 70,
                0.5,
                -45 + Math.random() * 5
            );
            car.mesh.userData.isEntity = true;
            GAME.entities.cars.push(car);
        }, cfg.spawnRate);

        // Spawn de perros
        GAME.dogInterval = setInterval(() => {
            if (GAME.state !== 'PLAYING') return;
            if (Math.random() < 0.6) {
                const dog = new Dog(this.scene);
                dog.mesh.position.set(
                    (Math.random() - 0.5) * 80,
                    0,
                    (Math.random() - 0.5) * 80
                );
                dog.mesh.userData.isEntity = true;
                GAME.entities.dogs.push(dog);
            }
        }, cfg.dogRate);

        console.log(`[BETO] Nivel ${level} iniciado. Beto en escena:`, GAME.beto.mesh.position);
    }

    gameOver(reason) {
        GAME.state = 'GAMEOVER';
        if (GAME.spawnInterval) clearInterval(GAME.spawnInterval);
        if (GAME.dogInterval) clearInterval(GAME.dogInterval);
        const reasonEl = document.getElementById('game-over-reason');
        const scoreEl = document.getElementById('final-score');
        const screen = document.getElementById('game-over-screen');
        if (reasonEl) reasonEl.textContent = reason;
        if (scoreEl) scoreEl.textContent = GAME.money;
        if (screen) screen.style.display = 'block';
    }
}

// =============================================
// INICIALIZACIÓN
// =============================================

const game = new GameEngine();

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('level-select').style.display = 'block';
});

document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        game.startGame(parseInt(btn.dataset.level));
        document.getElementById('level-select').style.display = 'none';
    });
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
});
