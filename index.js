// =============================================
// LA VIDA DE BETO - Juego Principal (ES Module)
// =============================================

import * as THREE from 'three';

// =============================================
// CLASES DE ENTIDADES
// =============================================

class Beto {
    constructor(scene) {
        this.scene = scene;
        this.speed = 0.12;
        this.targetPosition = null;
        this.walkCycle = 0;
        this.visible = true;
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();
        const skin = new THREE.MeshLambertMaterial({ color: 0xFFCCAA });
        const blue = new THREE.MeshLambertMaterial({ color: 0x0000CC });
        const yellow = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const black = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const lightBlue = new THREE.MeshLambertMaterial({ color: 0x4488FF });

        // Piernas
        this.legL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.4), lightBlue);
        this.legL.position.set(-0.25, 0.45, 0);
        group.add(this.legL);

        this.legR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.4), lightBlue);
        this.legR.position.set(0.25, 0.45, 0);
        group.add(this.legR);

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.6), blue);
        torso.position.y = 1.3;
        group.add(torso);

        // Franja amarilla
        const franja = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.35, 0.65), yellow);
        franja.position.y = 1.3;
        group.add(franja);

        // Brazos
        this.armL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), blue);
        this.armL.position.set(-0.73, 1.3, 0);
        group.add(this.armL);

        this.armR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.9, 0.35), blue);
        this.armR.position.set(0.73, 1.3, 0);
        group.add(this.armR);

        // Cuello
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.4), skin);
        neck.position.y = 1.95;
        group.add(neck);

        // Cabeza
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.8, 0.7), skin);
        head.position.y = 2.5;
        group.add(head);

        // Ojos
        const eyeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.05);
        const eyeL = new THREE.Mesh(eyeGeo, black);
        eyeL.position.set(-0.2, 2.55, 0.36);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(eyeGeo, black);
        eyeR.position.set(0.2, 2.55, 0.36);
        group.add(eyeR);

        // Bandana amarilla
        const bandana = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.75), yellow);
        bandana.position.y = 2.95;
        group.add(bandana);

        group.scale.set(1.5, 1.5, 1.5);

        this.mesh = group;
        this.scene.add(this.mesh);
    }

    moveTo(x, z) {
        this.targetPosition = new THREE.Vector3(x, 0, z);
    }

    move(keys) {
        const v = new THREE.Vector3();
        if (keys.w || keys.arrowup)    v.z -= 1;
        if (keys.s || keys.arrowdown)  v.z += 1;
        if (keys.a || keys.arrowleft)  v.x -= 1;
        if (keys.d || keys.arrowright) v.x += 1;
        if (v.length() > 0) {
            v.normalize().multiplyScalar(15);
            const p = this.mesh.position.clone().add(v);
            p.x = Math.max(-50, Math.min(50, p.x));
            p.z = Math.max(-50, Math.min(50, p.z));
            this.targetPosition = p;
        }
    }

    update(dt) {
        this.walkCycle += dt * 8;
        const sw = Math.sin(this.walkCycle) * 0.4;
        this.legL.rotation.x = sw;
        this.legR.rotation.x = -sw;
        this.armL.rotation.x = -sw;
        this.armR.rotation.x = sw;

        if (this.targetPosition) {
            const dir = new THREE.Vector3().subVectors(this.targetPosition, this.mesh.position);
            const dist = dir.length();
            if (dist > 0.15) {
                dir.normalize();
                this.mesh.position.addScaledVector(dir, this.speed);
                this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
            } else {
                this.mesh.position.copy(this.targetPosition);
                this.targetPosition = null;
            }
        }
    }
}

class Car {
    constructor(scene) {
        this.scene = scene;
        this.visible = true;
        this.state = 'waiting';
        this.arrivalTime = Date.now();
        this.maxWaitTime = 18000;
        this.parkPosition = null;
        this.collected = false;
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5);
        const mat = new THREE.MeshLambertMaterial({ color });
        const dark = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const glass = new THREE.MeshLambertMaterial({ color: 0x88CCFF, transparent: true, opacity: 0.6 });
        const lightM = new THREE.MeshLambertMaterial({ color: 0xFFFFAA, emissive: new THREE.Color(0xFFFF88) });

        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.7, 4.8), mat);
        chassis.position.y = 0.35;
        group.add(chassis);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 2.6), mat);
        cabin.position.set(0, 1.1, 0.2);
        group.add(cabin);

        const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.75, 0.1), glass);
        windshield.position.set(0, 1.1, -1.1);
        group.add(windshield);

        const wGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.25, 12);
        [[-1.15, 0, -1.6], [1.15, 0, -1.6], [-1.15, 0, 1.6], [1.15, 0, 1.6]].forEach(p => {
            const w = new THREE.Mesh(wGeo, dark);
            w.rotation.z = Math.PI / 2;
            w.position.set(...p);
            group.add(w);
        });

        [-0.7, 0.7].forEach(x => {
            const f = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.1), lightM);
            f.position.set(x, 0.5, -2.45);
            group.add(f);
        });

        const indMat = new THREE.MeshLambertMaterial({ color: 0xFFEE00, emissive: new THREE.Color(0xFFDD00) });
        this.indicator = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), indMat);
        this.indicator.position.y = 3.2;
        group.add(this.indicator);

        this.mesh = group;
        this.scene.add(this.mesh);
    }

    markForParking(x, z) {
        this.state = 'parking';
        this.parkPosition = { x, z };
        if (this.indicator) this.indicator.visible = false;
    }

    leave() { this.state = 'leaving'; }

    update(dt) {
        if (!this.visible) return;

        if (this.indicator && this.state === 'waiting') {
            this.indicator.rotation.y += dt * 3;
            this.indicator.position.y = 3.2 + Math.sin(Date.now() * 0.004) * 0.25;
            this.indicator.visible = Math.floor(Date.now() / 400) % 2 === 0;
        }

        switch (this.state) {
            case 'waiting': {
                const elapsed = Date.now() - this.arrivalTime;
                if (elapsed >= this.maxWaitTime && Math.random() < 0.008) this.state = 'leaving';
                break;
            }
            case 'parking': {
                if (this.parkPosition) {
                    const target = new THREE.Vector3(this.parkPosition.x, 0, this.parkPosition.z);
                    const dir = new THREE.Vector3().subVectors(target, this.mesh.position);
                    const dist = dir.length();
                    if (dist > 0.4) {
                        dir.normalize();
                        this.mesh.position.addScaledVector(dir, 0.15);
                        this.mesh.rotation.y = Math.atan2(dir.x, dir.z);
                    } else {
                        this.mesh.position.copy(target);
                        this.state = 'parked';
                    }
                }
                break;
            }
            case 'leaving': {
                this.mesh.position.z += dt * 12;
                if (this.mesh.position.z > 80) this.visible = false;
                break;
            }
        }
    }
}

class Dog {
    constructor(scene) {
        this.scene = scene;
        this.visible = true;
        this.state = 'wandering';
        this.walkTime = Math.random() * 10;
        this.attackTime = 0;
        this.createModel();
    }

    createModel() {
        const group = new THREE.Group();
        const fur = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        const dark = new THREE.MeshLambertMaterial({ color: 0x5C3D0E });
        const eyeM = new THREE.MeshLambertMaterial({ color: 0x111111 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 2.2), fur);
        body.position.y = 0.85;
        group.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.0, 1.3), dark);
        head.position.set(0, 1.7, 1.0);
        group.add(head);

        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.6), fur);
        snout.position.set(0, 1.55, 1.6);
        group.add(snout);

        [-0.45, 0.45].forEach((x, i) => {
            const ear = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 0.15), dark);
            ear.position.set(x, 2.2, 0.9);
            ear.rotation.z = i === 0 ? 0.3 : -0.3;
            group.add(ear);
        });

        [-0.3, 0.3].forEach(x => {
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.1), eyeM);
            eye.position.set(x, 1.75, 1.6);
            group.add(eye);
        });

        this.patas = [];
        const legGeo = new THREE.BoxGeometry(0.3, 0.75, 0.3);
        [[-0.55, 0.38, -0.7], [0.55, 0.38, -0.7], [-0.55, 0.38, 0.75], [0.55, 0.38, 0.75]].forEach(p => {
            const leg = new THREE.Mesh(legGeo, dark);
            leg.position.set(...p);
            group.add(leg);
            this.patas.push(leg);
        });

        this.cola = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 0.9, 8), fur);
        this.cola.position.set(0, 1.3, -1.2);
        this.cola.rotation.x = -0.7;
        group.add(this.cola);

        group.scale.set(1.2, 1.2, 1.2);
        this.mesh = group;
        this.scene.add(this.mesh);
    }

    attack() {
        this.state = 'attacking';
        this.attackTime = Date.now();
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                if (this.visible) {
                    this.mesh.scale.set(2.0, 2.0, 2.0);
                    setTimeout(() => { if (this.visible) this.mesh.scale.set(1.2, 1.2, 1.2); }, 150);
                }
            }, i * 280);
        }
    }

    update(dt) {
        if (!this.visible) return;
        this.walkTime += dt * 5;

        switch (this.state) {
            case 'wandering': {
                if (Math.random() < 0.018) this.mesh.rotation.y += (Math.random() - 0.5) * Math.PI * 0.7;
                const spd = 0.07;
                this.mesh.position.x += Math.sin(this.mesh.rotation.y) * spd;
                this.mesh.position.z += Math.cos(this.mesh.rotation.y) * spd;
                this.mesh.position.x = Math.max(-50, Math.min(50, this.mesh.position.x));
                this.mesh.position.z = Math.max(-50, Math.min(50, this.mesh.position.z));
                const sw = Math.sin(this.walkTime) * 0.45;
                if (this.patas.length === 4) {
                    this.patas[0].rotation.x = sw;
                    this.patas[1].rotation.x = -sw;
                    this.patas[2].rotation.x = -sw;
                    this.patas[3].rotation.x = sw;
                }
                if (this.cola) this.cola.rotation.z = Math.sin(this.walkTime * 2.5) * 0.4;
                break;
            }
            case 'attacking': {
                if (Date.now() - this.attackTime > 1200) this.state = 'leaving';
                break;
            }
            case 'leaving': {
                this.mesh.position.z += dt * 10;
                if (this.mesh.position.z > 80) this.visible = false;
                break;
            }
        }
        this.mesh.position.y = 0;
    }
}

// =============================================
// MOTOR
// =============================================

const LEVELS = {
    1: { spawnRate: 2500, dogRate: 5000, label: 'La Calle' },
    2: { spawnRate: 1500, dogRate: 3000, label: 'La Plaza' },
    3: { spawnRate: 800,  dogRate: 1800, label: '4 Manzanas' },
};

const GAME = {
    state: 'START',
    currentLevel: 1,
    money: 100,
    lives: 3,
    maxCars: 12,
    entities: { cars: [], dogs: [] },
    keys: {},
    beto: null,
    spawnInterval: null,
    dogInterval: null,
};

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 90, 160);

        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
        this.camera.position.set(0, 28, 38);
        this.camera.lookAt(0, 0, -8);

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        // LUCES — siempre en escena, nunca se borran
        const ambient = new THREE.AmbientLight(0xffffff, 0.85);
        ambient.name = 'ambient';
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xFFF5E0, 1.1);
        sun.position.set(20, 40, 20);
        sun.castShadow = true;
        sun.name = 'sun';
        this.scene.add(sun);

        // Escena estática
        this.buildStaticScene();

        // Eventos
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        document.addEventListener('keydown', e => {
            const k = e.key.toLowerCase()
                .replace('arrow', '')
                .replace('arrowup','w').replace('arrowdown','s')
                .replace('arrowleft','a').replace('arrowright','d');
            GAME.keys[k] = true;
            if (GAME.state === 'PLAYING' && GAME.beto) GAME.beto.move(GAME.keys);
        });
        document.addEventListener('keyup', e => {
            const k = e.key.toLowerCase();
            delete GAME.keys[k];
            delete GAME.keys[k.replace('arrow','')];
        });

        this.canvas.addEventListener('click', e => this.onClick(e));

        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    }

    buildStaticScene() {
        // Suelo verde grande
        const groundGeo = new THREE.PlaneGeometry(160, 160);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Zona de asfalto
        const asphalt = new THREE.Mesh(
            new THREE.PlaneGeometry(90, 35),
            new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        asphalt.rotation.x = -Math.PI / 2;
        asphalt.position.set(0, 0.02, -8);
        this.scene.add(asphalt);

        // Líneas de estacionamiento
        const lineMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        for (let x = -40; x <= 40; x += 8) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 14), lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(x, 0.04, -8);
            this.scene.add(line);
        }
        [-1, -15].forEach(z => {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(90, 0.4), lineMat);
            line.rotation.x = -Math.PI / 2;
            line.position.set(0, 0.04, z);
            this.scene.add(line);
        });

        // Edificio al fondo
        const bld = new THREE.Mesh(
            new THREE.BoxGeometry(20, 24, 9),
            new THREE.MeshLambertMaterial({ color: 0xE8D5B0 })
        );
        bld.position.set(0, 12, -55);
        this.scene.add(bld);

        // Ventanas del edificio
        const winMat = new THREE.MeshLambertMaterial({ color: 0xAADDFF, emissive: new THREE.Color(0x224466) });
        for (let wy = 4; wy <= 20; wy += 4) {
            [-6, -2, 2, 6].forEach(wx => {
                const win = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 0.3), winMat);
                win.position.set(wx, wy, -50.6);
                this.scene.add(win);
            });
        }

        // Señal azul en edificio
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(16, 3, 0.5),
            new THREE.MeshLambertMaterial({ color: 0x003399 })
        );
        sign.position.set(0, 22, -50.8);
        this.scene.add(sign);

        // Faroles
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const lampMat = new THREE.MeshLambertMaterial({ color: 0xFFFF99, emissive: new THREE.Color(0xFFFF66) });
        [-36, -20, 0, 20, 36].forEach(x => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 9, 8), poleMat);
            pole.position.set(x, 4.5, 14);
            this.scene.add(pole);
            const lamp = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1), lampMat);
            lamp.position.set(x, 9.3, 14);
            this.scene.add(lamp);
        });

        // Árboles
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
        const leavesMat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
        [-50, -42, 42, 50].forEach(x => {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 4, 8), trunkMat);
            trunk.position.set(x, 2, 8);
            this.scene.add(trunk);
            const leaves = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), leavesMat);
            leaves.position.set(x, 7, 8);
            this.scene.add(leaves);
        });
    }

    onClick(e) {
        if (GAME.state !== 'PLAYING' || !GAME.beto) return;

        const rect = this.canvas.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
        const hits = ray.intersectObject(this.ground);

        if (hits.length > 0) {
            const pt = hits[0].point;
            GAME.beto.moveTo(pt.x, pt.z);
            this.spawnMark(pt.x, pt.z);

            // ¿Auto cercano para guiar?
            for (const car of GAME.entities.cars) {
                if (car.state !== 'waiting') continue;
                const dist = car.mesh.position.distanceTo(GAME.beto.mesh.position);
                if (dist < 12) {
                    car.markForParking(pt.x, pt.z);
                    this.toast('¡Auto guiado! 🚗', '#4CAF50');
                    break;
                }
            }
        }
    }

    spawnMark(x, z) {
        const mat = new THREE.MeshLambertMaterial({ color: 0xFFFF00, transparent: true, opacity: 0.9 });
        const mark = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.2), mat);
        mark.position.set(x, 0.1, z);
        this.scene.add(mark);
        let op = 0.9;
        const iv = setInterval(() => {
            op -= 0.08;
            mat.opacity = op;
            if (op <= 0) { clearInterval(iv); this.scene.remove(mark); }
        }, 70);
    }

    toast(text, color = '#FFD700') {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = `
            position:fixed;top:45%;left:50%;transform:translate(-50%,-50%);
            background:rgba(0,0,0,.78);color:${color};
            padding:12px 26px;border-radius:10px;font-size:22px;font-weight:bold;
            pointer-events:none;z-index:200;transition:opacity .5s,top .5s;
        `;
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = '0'; el.style.top = '35%'; }, 700);
        setTimeout(() => el.remove(), 1300);
    }

    loop(time) {
        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        if (GAME.state === 'PLAYING') {
            if (GAME.beto) GAME.beto.update(dt);
            GAME.entities.cars.forEach(c => c.update(dt));
            GAME.entities.dogs.forEach(d => d.update(dt));

            if (GAME.beto) {
                // Cobrar autos estacionados
                GAME.entities.cars.forEach(car => {
                    if (car.state === 'parked' && !car.collected) {
                        const dist = car.mesh.position.distanceTo(GAME.beto.mesh.position);
                        if (dist < 6) {
                            car.collected = true;
                            const gain = 15 + Math.floor(Math.random() * 35);
                            GAME.money += gain;
                            this.toast(`+$${gain} 💰`, '#FFD700');
                            setTimeout(() => car.leave(), 1500);
                        }
                    }
                });

                // Perros atacan a Beto
                GAME.entities.dogs.forEach(dog => {
                    if (dog.state === 'wandering') {
                        const dist = dog.mesh.position.distanceTo(GAME.beto.mesh.position);
                        if (dist < 4) {
                            dog.attack();
                            GAME.money = Math.max(0, GAME.money - 15);
                            this.toast('¡Mordida! -$15 🐕', '#FF5252');
                        }
                    }
                });
            }

            // Limpiar invisibles
            GAME.entities.cars = GAME.entities.cars.filter(c => {
                if (!c.visible) { this.scene.remove(c.mesh); return false; }
                return true;
            });
            GAME.entities.dogs = GAME.entities.dogs.filter(d => {
                if (!d.visible) { this.scene.remove(d.mesh); return false; }
                return true;
            });

            if (GAME.money <= 0) this.gameOver('¡Te quedaste sin plata! 💸');
        }

        this.updateHUD();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(t => this.loop(t));
    }

    updateHUD() {
        const $ = id => document.getElementById(id);
        if ($('money-display'))  $('money-display').textContent  = `$${GAME.money}`;
        if ($('lives-display'))  $('lives-display').textContent  = GAME.lives;
        if ($('cars-display'))   $('cars-display').textContent   = `${GAME.entities.cars.length}/${GAME.maxCars}`;
        if ($('level-display'))  $('level-display').textContent  = `${GAME.currentLevel} - ${LEVELS[GAME.currentLevel].label}`;
    }

    startGame(level) {
        // Quitar entidades anteriores de la escena
        GAME.entities.cars.forEach(c => this.scene.remove(c.mesh));
        GAME.entities.dogs.forEach(d => this.scene.remove(d.mesh));
        if (GAME.beto) this.scene.remove(GAME.beto.mesh);

        GAME.state = 'PLAYING';
        GAME.currentLevel = level;
        GAME.money = 100;
        GAME.lives = 3;
        GAME.entities.cars = [];
        GAME.entities.dogs = [];
        GAME.keys = {};

        clearInterval(GAME.spawnInterval);
        clearInterval(GAME.dogInterval);

        // Beto aparece en el centro de la zona de estacionamiento
        GAME.beto = new Beto(this.scene);
        GAME.beto.mesh.position.set(0, 0, -5);

        const cfg = LEVELS[level];

        // Spawnear algunos autos de inmediato para que no quede vacío
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (GAME.state !== 'PLAYING') return;
                const car = new Car(this.scene);
                car.mesh.position.set(
                    -32 + i * 16 + (Math.random() - 0.5) * 4,
                    0,
                    -28 + (Math.random() - 0.5) * 4
                );
                GAME.entities.cars.push(car);
            }, i * 300);
        }

        // Intervalo de spawn de autos
        GAME.spawnInterval = setInterval(() => {
            if (GAME.state !== 'PLAYING') return;
            if (GAME.entities.cars.length >= GAME.maxCars) return;
            const car = new Car(this.scene);
            car.mesh.position.set(
                (Math.random() - 0.5) * 70,
                0,
                -38 + (Math.random() - 0.5) * 6
            );
            GAME.entities.cars.push(car);
        }, cfg.spawnRate);

        // Intervalo de spawn de perros
        GAME.dogInterval = setInterval(() => {
            if (GAME.state !== 'PLAYING') return;
            const dog = new Dog(this.scene);
            const sides = [[55,-10],[-55,-10],[0,-48],[0,18]];
            const [px, pz] = sides[Math.floor(Math.random() * sides.length)];
            dog.mesh.position.set(px, 0, pz);
            dog.mesh.rotation.y = Math.atan2(-px, -pz - (-8));
            GAME.entities.dogs.push(dog);
        }, cfg.dogRate);
    }

    gameOver(reason) {
        GAME.state = 'GAMEOVER';
        clearInterval(GAME.spawnInterval);
        clearInterval(GAME.dogInterval);
        document.getElementById('game-over-reason').textContent = reason;
        document.getElementById('final-score').textContent = GAME.money;
        document.getElementById('game-over-screen').style.display = 'block';
    }
}

// =============================================
// INICIO
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
