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
            this.mesh.geometry.dispose();
            if (this.mesh.material.length) {
                this.mesh.material.forEach(m => m.dispose());
            } else {
                this.mesh.material.dispose();
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
        this.createModel();
        this.walkCycle = 0;
        this.walkSpeed = 5;
    }

    createModel() {
        const group = new THREE.Group();

        // Cuerpo (camiseta de Boca)
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

        // Pijama/bermuda
        const pantsGeo = new THREE.BoxGeometry(0.8, 0.6, 0.7);
        const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
        const pants = new THREE.Mesh(pantsGeo, pantsMat);
        pants.position.y = 0.3;
        group.add(pants);

        // Manos
        const handGeo = new THREE.BoxGeometry(0.35, 0.4, 0.35);
        const hands = [];
        for (let i = 0; i < 2; i++) {
            const hand = new THREE.Mesh(handGeo, headMat);
            hand.position.set(i === 0 ? -0.7 : 0.7, 1.4, 0);
            group.add(hand);
            hands.push(hand);
        }
        this.hands = hands;

        // Piernas
        const legGeo = new THREE.BoxGeometry(0.35, 0.8, 0.35);
        const legs = [];
        for (let i = 0; i < 2; i++) {
            const leg = new THREE.Mesh(legGeo, pantsMat);
            leg.position.set(i === 0 ? -0.4 : 0.4, 0.4, 0);
            group.add(leg);
            legs.push(leg);
        }
        this.legs = legs;

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
            const direction = new THREE.Vector3().subVectors(
                this.targetPosition,
                this.mesh.position
            ).normalize();

            const distance = this.mesh.position.distanceTo(this.targetPosition);

            if (distance > 0.1) {
                this.mesh.position.add(direction.multiplyScalar(this.speed));
                this.isMoving = true;
                const targetRotation = Math.atan2(direction.x, direction.z);
                this.mesh.rotation.y = targetRotation;
            } else {
                this.targetPosition = null;
                this.isMoving = false;
            }
        }

        const limit = 45;
        this.mesh.position.x = Math.max(-limit, Math.min(limit, this.mesh.position.x));
        this.mesh.position.z = Math.max(-limit, Math.min(limit, this.mesh.position.z));
    }

    move(direction) {
        const moveVector = new THREE.Vector3(0, 0, 0);

        if (direction.includes('w') || direction.includes('arrowup')) moveVector.z -= 1;
        if (direction.includes('s') || direction.includes('arrowdown')) moveVector.z += 1;
        if (direction.includes('a') || direction.includes('arrowleft')) moveVector.x -= 1;
        if (direction.includes('d') || direction.includes('arrowright')) moveVector.x += 1;

        if (moveVector.length() > 0) {
            moveVector.normalize().multiplyScalar(this.speed);
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
    constructor(scene, color = null) {
        super(scene);
        this.color = color || Math.random() * 0xffffff;
        this.state = 'waiting';
        this.parkPosition = null;
        this.arrivalTime = Date.now();
        this.maxWaitTime = 15000;
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();

        // Chasis
        const chassisGeo = new THREE.BoxGeometry(2.2, 0.8, 4.5);
        const chassisMat = new THREE.MeshStandardMaterial({ color: this.color });
        const chassis = new THREE.Mesh(chassisGeo, chassisMat);
        group.add(chassis);

        // Techo
        const roofGeo = new THREE.BoxGeometry(1.8, 0.6, 2.5);
        const roofMat = new THREE.MeshStandardMaterial({ color: this.color });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 1.0;
        group.add(roof);

        // Ventanas
        const windowGeo = new THREE.BoxGeometry(1.8, 0.25, 2.0);
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x87CEEB, transparent: true, opacity: 0.5 });
        const windows = new THREE.Mesh(windowGeo, windowMat);
        windows.position.y = 1.4;
        group.add(windows);

        // Ruedas
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const positions = [[-1.1, 0.4, -1.8], [1.1, 0.4, -1.8], [-1.1, 0.4, 1.8], [1.1, 0.4, 1.8]];
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            group.add(wheel);
        });

        // Faros
        const lightGeo = new THREE.BoxGeometry(0.4, 0.3, 0.1);
        const lightMat = new THREE.MeshStandardMaterial({ color: 0xFFFFAA, emissive: 0xFFFFAA, emissiveIntensity: 0.5 });
        const headlightL = new THREE.Mesh(lightGeo, lightMat);
        headlightL.position.set(-0.8, 0.6, -2.3);
        group.add(headlightL);
        const headlightR = new THREE.Mesh(lightGeo, lightMat);
        headlightR.position.set(0.8, 0.6, -2.3);
        group.add(headlightR);

        // Indicador de estado
        this.statusIndicator = new THREE.Group();
        const indicatorGeo = new THREE.BoxGeometry(1, 0.5, 1);
        const indicatorMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.3 });
        const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
        indicator.position.y = 2.5;
        this.statusIndicator.add(indicator);

        // Texto "Click"
        const textGeo = new THREE.PlaneGeometry(1.5, 0.6);
        this.clickTextMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });
        this.clickText = new THREE.Mesh(textGeo, this.clickTextMaterial);
        this.clickText.position.set(0, 3.0, 0);
        this.clickText.rotation.x = -Math.PI / 2;
        this.statusIndicator.add(this.clickText);

        group.add(this.statusIndicator);
        this.mesh = group;
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.visible) return;

        switch (this.state) {
            case 'waiting':
                this.mesh.rotation.y += deltaTime * 0.2;
                const elapsed = Date.now() - this.arrivalTime;
                if (elapsed < this.maxWaitTime) {
                    this.statusIndicator.visible = Math.floor(elapsed / 500) % 2 === 0;
                    const timeLeft = Math.ceil((this.maxWaitTime - elapsed) / 1000);
                    this.clickTextMaterial.color.setHex(0xFFFFFF);
                } else {
                    this.statusIndicator.visible = false;
                    this.clickTextMaterial.color.setHex(0xFF4444);
                    if (Math.random() < 0.02) this.state = 'leaving';
                }
                break;

            case 'parking':
                const parkProgress = Math.min((Date.now() - this.parkStartTime) / 1000, 1);
                if (this.parkPosition) {
                    const targetPos = new THREE.Vector3(this.parkPosition.x, 0.5, this.parkPosition.z);
                    const direction = new THREE.Vector3().subVectors(targetPos, this.mesh.position).normalize();
                    this.mesh.position.add(direction.multiplyScalar(0.1));
                    if (direction.length() > 0.1) {
                        this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
                    }
                }
                if (parkProgress >= 1) {
                    this.state = 'parked';
                    this.statusIndicator.visible = false;
                }
                break;

            case 'leaving':
                this.mesh.position.z += deltaTime * 0.5;
                if (this.mesh.position.z > 60) this.visible = false;
                break;
        }
        this.mesh.position.y = 0.5;
    }

    markForParking(x, z) {
        this.state = 'parking';
        this.parkStartTime = Date.now();
        this.parkPosition = { x, z };
        const markerGeo = new THREE.BoxGeometry(0.5, 1, 0.5);
        const markerMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, transparent: true, opacity: 0.7 });
        this.parkMarker = new THREE.Mesh(markerGeo, markerMat);
        this.parkMarker.position.set(x, 1, z);
        this.scene.add(this.parkMarker);
    }

    leave() {
        this.state = 'leaving';
    }
}

class Passenger extends Entity {
    constructor(scene) {
        super(scene);
        this.state = 'waiting';
        this.arrivalTime = Date.now();
        this.maxWaitTime = 8000;
        this.accessories = [];
        const possible = ['remera', 'pantalon', 'bufanda', 'gorro', 'trompeta'];
        for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
            const acc = possible[Math.floor(Math.random() * possible.length)];
            if (!this.accessories.includes(acc)) this.accessories.push(acc);
        }
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();

        // Cuerpo
        const bodyGeo = new THREE.BoxGeometry(0.8, 1.5, 0.6);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4FC3F7 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        group.add(body);

        // Cabeza
        const headGeo = new THREE.BoxGeometry(0.5, 0.6, 0.5);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xFFCCAA });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.9;
        group.add(head);

        // Ojos
        const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.2, 1.9, 0.3);
        group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.2, 1.9, 0.3);
        group.add(rightEye);

        // Accesorios
        this.createAccessories(group);

        // Indicador de estado
        this.statusIndicator = new THREE.Group();
        const indicatorGeo = new THREE.BoxGeometry(1, 0.5, 1);
        this.statusMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.3 });
        const indicator = new THREE.Mesh(indicatorGeo, this.statusMat);
        indicator.position.y = 2.8;
        this.statusIndicator.add(indicator);

        // Texto "Pagar"
        const textGeo = new THREE.PlaneGeometry(1.5, 0.6);
        this.payTextMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });
        this.payText = new THREE.Mesh(textGeo, this.payTextMaterial);
        this.payText.position.set(0, 3.2, 0);
        this.payText.rotation.x = -Math.PI / 2;
        this.statusIndicator.add(this.payText);

        group.add(this.statusIndicator);
        this.mesh = group;
        this.scene.add(this.mesh);
    }

    createAccessories(parent) {
        const colors = [0x2196F3, 0xFFC107, 0xE91E63];
        this.accessories.forEach(acc => {
            const accGroup = new THREE.Group();
            switch (acc) {
                case 'remera':
                    const remeraGeo = new THREE.BoxGeometry(1.2, 0.8, 0.7);
                    const remeraMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
                    const remera = new THREE.Mesh(remeraGeo, remeraMat);
                    remera.position.y = 1.4;
                    accGroup.add(remera);
                    break;
                case 'pantalon':
                    const pantGeo = new THREE.BoxGeometry(1.0, 0.7, 0.8);
                    const pantMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
                    const pantalon = new THREE.Mesh(pantGeo, pantMat);
                    pantalon.position.y = 0.6;
                    accGroup.add(pantalon);
                    break;
                case 'bufanda':
                    const bufGeo = new THREE.TorusGeometry(0.3, 0.1, 8, 20);
                    const bufMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
                    const bufanda = new THREE.Mesh(bufGeo, bufMat);
                    bufanda.position.set(0, 1.8, 0);
                    accGroup.add(bufanda);
                    break;
                case 'gorro':
                    const gorroGeo = new THREE.ConeGeometry(0.25, 0.6, 16);
                    const gorroMat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
                    const gorro = new THREE.Mesh(gorroGeo, gorroMat);
                    gorro.position.set(0, 2.4, 0);
                    accGroup.add(gorro);
                    break;
                case 'trompeta':
                    const trumGeo = new THREE.CylinderGeometry(0.1, 0.3, 0.8, 8);
                    const trumMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
                    const trompeta = new THREE.Mesh(trumGeo, trumMat);
                    trompeta.position.set(0.5, 1.2, 0.4);
                    accGroup.add(trompeta);
                    break;
            }
            parent.add(accGroup);
        });
    }

    update(deltaTime) {
        if (!this.visible) return;

        switch (this.state) {
            case 'waiting':
                const elapsed = Date.now() - this.arrivalTime;
                if (elapsed < this.maxWaitTime) {
                    this.statusIndicator.visible = Math.floor(elapsed / 400) % 2 === 0;
                    this.payTextMaterial.color.setHex(0xFFFFFF);
                } else {
                    this.statusIndicator.visible = false;
                    this.payTextMaterial.color.setHex(0xFF4444);
                    if (Math.random() < 0.05) this.state = 'leaving';
                }
                break;
            case 'paying':
                const payProgress = Math.min((Date.now() - this.payStartTime) / 1000, 1);
                if (payProgress >= 1) {
                    this.state = 'leaving';
                    this.payTextMaterial.color.setHex(0x4CAF50);
                }
                break;
            case 'leaving':
                this.mesh.position.z += deltaTime * 0.3;
                if (this.mesh.position.z > 60) this.visible = false;
                break;
        }
        this.mesh.position.y = 1;
    }

    startPaying() {
        this.state = 'paying';
        this.payStartTime = Date.now();
        this.statusIndicator.visible = true;
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
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();

        // Cuerpo
        const bodyGeo = new THREE.BoxGeometry(1.2, 0.8, 2.0);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5D4037 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.6;
        group.add(body);

        // Cabeza
        const headGeo = new THREE.BoxGeometry(1.0, 0.9, 1.2);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 1.4, 0.8);
        group.add(head);

        // Orejas
        const earGeo = new THREE.BoxGeometry(0.3, 0.7, 0.1);
        const earMat = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const leftEar = new THREE.Mesh(earGeo, earMat);
        leftEar.position.set(-0.5, 1.6, 0.8);
        leftEar.rotation.z = Math.PI / 4;
        group.add(leftEar);
        const rightEar = new THREE.Mesh(earGeo, earMat);
        rightEar.position.set(0.5, 1.6, 0.8);
        rightEar.rotation.z = -Math.PI / 4;
        group.add(rightEar);

        // Ojos
        const eyeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.35, 1.4, 1.1);
        group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.35, 1.4, 1.1);
        group.add(rightEye);

        // Patas
        const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const positions = [[-0.5, 0.4, -0.8], [0.5, 0.4, -0.8], [-0.5, 0.4, 1.0], [0.5, 0.4, 1.0]];
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(...pos);
            group.add(leg);
        });

        // Cola
        const tailGeo = new THREE.CylinderGeometry(0.1, 0.2, 0.8, 8);
        const tailMat = new THREE.MeshStandardMaterial({ color: 0x3E2723 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0, 1.2, -1.0);
        group.add(tail);

        this.mesh = group;
        this.scene.add(this.mesh);
    }

    update(deltaTime) {
        if (!this.visible) return;

        switch (this.state) {
            case 'wandering':
                const wanderSpeed = 0.05;
                if (Math.random() < 0.02) this.mesh.rotation.y += (Math.random() - 0.5) * Math.PI / 2;
                this.mesh.position.x += Math.sin(this.mesh.rotation.y) * wanderSpeed;
                this.mesh.position.z += Math.cos(this.mesh.rotation.y) * wanderSpeed;
                const limit = 45;
                this.mesh.position.x = Math.max(-limit, Math.min(limit, this.mesh.position.x));
                this.mesh.position.z = Math.max(-limit, Math.min(limit, this.mesh.position.z));
                this.walkTime = (this.walkTime || 0) + deltaTime * 5;
                const walkOffset = Math.sin(this.walkTime) * 0.2;
                this.mesh.children[3].position.y = 0.4 + walkOffset;
                this.mesh.children[6].position.y = 0.4 - walkOffset;
                break;
            case 'attacking':
                const attackProgress = Math.min((Date.now() - this.attackTime) / 1500, 1);
                if (attackProgress >= 1) this.state = 'leaving';
                break;
            case 'leaving':
                this.mesh.position.z += deltaTime * 0.3;
                if (this.mesh.position.z > 60) this.visible = false;
                break;
        }
    }

    attack() {
        this.state = 'attacking';
        this.attackTime = Date.now();
        const originalScale = this.mesh.scale.x;
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (this.visible) {
                    this.mesh.scale.set(1.5, 1.5, 1.5);
                    setTimeout(() => { if (this.visible) this.mesh.scale.set(originalScale, originalScale, originalScale); }, 200);
                }
            }, i * 300);
        }
    }
}

// =============================================
// MOTOR DEL JUEGO
// =============================================

const CONFIG = {
    playerSpeed: 0.15,
    cameraHeight: 20,
    cameraDistance: 30,
    colors: { grass: 0x4CAF50, ground: 0x795548, sky: 0x87CEEB, lineWhite: 0xFFFFFF },
    levels: {}
};

const GAME = {
    state: 'START',
    currentLevel: 1,
    money: 100,
    lives: 3,
    carsCount: 0,
    maxCars: 20,
    entities: { cars: [], passengers: [], dogs: [] },
    keys: {},
    mouse: { x: 0, y: 0 },
    cameraAngle: 0,
    lastTime: 0,
    spawnInterval: null,
    dogInterval: null
};

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

        try {
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
            // Force WebGL context to be created immediately
            const gl = this.renderer.getContext();
            if (!gl) {
                throw new Error('WebGL context not created');
            }
        } catch(e) {
            console.error('[BETO] WebGL failed, trying fallback:', e.message);
            // Try without antialias as fallback
            try {
                this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false });
            } catch(e2) {
                console.error('[BETO] All rendering failed:', e2.message);
                return;
            }
        }

        this.beto = null;
        this.levelManager = null;
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        this.camera.position.set(0, 25, 45);
        this.camera.lookAt(0, 0, -10);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('keydown', (e) => {
            GAME.keys[e.key.toLowerCase()] = true;
            if (GAME.beto) GAME.beto.move(Object.keys(GAME.keys));
        });
        document.addEventListener('keyup', (e) => { GAME.keys[e.key.toLowerCase()] = false; });

        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));

        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    onCanvasClick(e) {
        if (!GAME.beto || !this.levelManager) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        const ground = this.scene.children.find(c => c.geometry.type === 'PlaneGeometry' && c.material.color.getHex() !== 0x87CEEB);

        if (ground) {
            const intersects = raycaster.intersectObject(ground);
            if (intersects.length > 0) {
                const point = intersects[0].point;
                this.showMark(point.x, point.z);
                GAME.beto.moveTo(point.x, point.z);

                const nearbyCar = GAME.entities.cars.find(car =>
                    car.mesh.position.distanceTo(GAME.beto.mesh.position) < 5 &&
                    car.state === 'waiting'
                );

                if (nearbyCar && Date.now() - nearbyCar.arrivalTime > 3000) {
                    const markerGeo = new THREE.BoxGeometry(2, 0.1, 3);
                    const markerMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.6 });
                    const marker = new THREE.Mesh(markerGeo, markerMat);
                    marker.position.set(nearbyCar.mesh.position.x, 1.5, nearbyCar.mesh.position.z);
                    this.scene.add(marker);

                    setTimeout(() => {
                        if (marker) {
                            this.scene.remove(marker);
                            marker.geometry.dispose();
                            marker.material.dispose();
                        }
                    }, 2000);

                    nearbyCar.markForParking(point.x, point.z);
                }
            }
        }
    }

    showMark(x, z) {
        const markerGeo = new THREE.BoxGeometry(1, 0.2, 1);
        const markerMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.7 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.set(x, 0.2, z);
        this.scene.add(marker);

        let opacity = 0.7;
        const fadeInterval = setInterval(() => {
            opacity -= 0.1;
            marker.material.opacity = opacity;
            if (opacity <= 0) {
                clearInterval(fadeInterval);
                this.scene.remove(marker);
            }
        }, 100);
    }

    loop(time) {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (GAME.beto) GAME.beto.update(deltaTime);

        GAME.entities.cars.forEach(car => car.update(deltaTime));
        GAME.entities.passengers.forEach(p => p.update(deltaTime));
        GAME.entities.dogs.forEach(dog => dog.update(deltaTime));

        GAME.entities.cars = GAME.entities.cars.filter(c => c.visible);
        GAME.entities.passengers = GAME.entities.passengers.filter(p => p.visible);
        GAME.entities.dogs = GAME.entities.dogs.filter(d => d.visible);

        this.updateUI();

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame((t) => this.loop(t));
    }

    updateUI() {
        document.getElementById('money-display').textContent = `$${GAME.money}`;
        document.getElementById('lives-display').textContent = GAME.lives;

        const levelNames = ['La Calle', 'La Plaza', '4 Manzanas'];
        document.getElementById('level-display').textContent = `${GAME.currentLevel} - ${levelNames[GAME.currentLevel - 1]}`;

        document.getElementById('cars-display').textContent =
            `${GAME.entities.cars.length}/${GAME.maxCars}`;
    }

    startGame(level) {
        GAME.state = 'PLAYING';
        GAME.currentLevel = level;
        GAME.money = 100;
        GAME.lives = 3;
        GAME.carsCount = 0;

        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.grass, roughness: 0.9 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        const lineMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.lineWhite, roughness: 0.5 });
        for (let x = -35; x <= 35; x += 6) {
            const lineGeo = new THREE.PlaneGeometry(1, 40);
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.05, 0);
            this.scene.add(line);
        }

        GAME.beto = new Beto(this.scene);
        GAME.beto.mesh.position.set(0, 0.5, 0);

        const levelConfig = CONFIG.levels[level] || {};

        const spawnInterval = setInterval(() => {
            if (GAME.state !== 'PLAYING' || GAME.entities.cars.length >= GAME.maxCars) {
                clearInterval(spawnInterval);
                return;
            }
            const car = new Car(this.scene);
            car.mesh.position.set((Math.random() - 0.5) * 60, 0.5, -20 + Math.random() * 10);
            GAME.entities.cars.push(car);
        }, levelConfig.spawnRate || 1000);

        const dogInterval = setInterval(() => {
            if (GAME.state !== 'PLAYING') {
                clearInterval(dogInterval);
                return;
            }
            if (Math.random() < 0.3) {
                const dog = new Dog(this.scene);
                dog.mesh.position.set((Math.random() - 0.5) * 60, 0.5, (Math.random() - 0.5) * 60);
                GAME.entities.dogs.push(dog);
            }
        }, levelConfig.dogRate || 2000);

        GAME.spawnInterval = spawnInterval;
        GAME.dogInterval = dogInterval;
    }

    gameOver(reason) {
        GAME.state = 'GAMEOVER';
        if (GAME.spawnInterval) clearInterval(GAME.spawnInterval);
        if (GAME.dogInterval) clearInterval(GAME.dogInterval);
        document.getElementById('game-over-reason').textContent = reason;
        document.getElementById('final-score').textContent = GAME.money;
        document.getElementById('game-over-screen').style.display = 'block';
    }
}

// =============================================
// INICIALIZACIÓN
// =============================================

console.log('[BETO] About to create GameEngine...');
const game = new GameEngine();
console.log('[BETO] GameEngine created successfully');

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

CONFIG.levels[1] = { spawnRate: 800, dogRate: 2500 };
CONFIG.levels[2] = { spawnRate: 600, dogRate: 1800 };
CONFIG.levels[3] = { spawnRate: 400, dogRate: 1200 };

document.addEventListener('keydown', (e) => {
    if (GAME.state === 'PLAYING' && GAME.beto) {
        switch(e.key.toLowerCase()) {
            case 'w': GAME.beto.move({ w: true }); break;
            case 'a': GAME.beto.move({ a: true }); break;
            case 's': GAME.beto.move({ s: true }); break;
            case 'd': GAME.beto.move({ d: true }); break;
            case 'arrowup': GAME.beto.move({ w: true }); break;
            case 'arrowleft': GAME.beto.move({ a: true }); break;
            case 'arrowdown': GAME.beto.move({ s: true }); break;
            case 'arrowright': GAME.beto.move({ d: true }); break;
        }
    }
});
