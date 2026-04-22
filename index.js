// LA VIDA DE BETO
import * as THREE from 'three';

// ── Cámara isométrica clara ──────────────────────────────────────
const CAM_POS  = new THREE.Vector3(0, 45, 55);
const CAM_LOOK = new THREE.Vector3(0, 0, 0);

const MAP = 40;

// ═══════════════════════════════════════════════════════
//  ESCENA GLOBAL — se crea UNA sola vez
// ═══════════════════════════════════════════════════════
const canvas   = document.getElementById('game-canvas');
const scene    = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 600);
camera.position.copy(CAM_POS);
camera.lookAt(CAM_LOOK);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

// ── Luces permanentes ────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(30, 50, 30);
scene.add(sun);

// ── Escenario estático ───────────────────────────────────────────
(function buildScene() {
    // Suelo verde
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshLambertMaterial({ color: 0x55AA44 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    window._ground = ground;

    // Zona asfalto
    const asphalt = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 50),
        new THREE.MeshLambertMaterial({ color: 0x444444 })
    );
    asphalt.rotation.x = -Math.PI / 2;
    asphalt.position.y = 0.01;
    scene.add(asphalt);

    // Líneas blancas
    const wMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    for (let x = -44; x <= 44; x += 8) {
        const l = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 18), wMat);
        l.rotation.x = -Math.PI / 2;
        l.position.set(x, 0.03, 0);
        scene.add(l);
    }
    [-9, 9].forEach(z => {
        const l = new THREE.Mesh(new THREE.PlaneGeometry(100, 0.5), wMat);
        l.rotation.x = -Math.PI / 2;
        l.position.set(0, 0.03, z);
        scene.add(l);
    });

    // Edificio al fondo
    const bld = new THREE.Mesh(
        new THREE.BoxGeometry(22, 26, 10),
        new THREE.MeshLambertMaterial({ color: 0xD4C5A0 })
    );
    bld.position.set(0, 13, -40);
    scene.add(bld);

    // Ventanas edificio
    const wWin = new THREE.MeshLambertMaterial({ color: 0x88CCFF });
    for (let wy = 4; wy <= 22; wy += 5) {
        [-7,-2,3,8].forEach(wx => {
            const w = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 0.5), wWin);
            w.position.set(wx, wy, -35.2);
            scene.add(w);
        });
    }

    // Cartel azul
    const sign = new THREE.Mesh(
        new THREE.BoxGeometry(18, 3, 0.5),
        new THREE.MeshLambertMaterial({ color: 0x003399 })
    );
    sign.position.set(0, 24, -35.3);
    scene.add(sign);

    // Faroles
    const pMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
    const lMat = new THREE.MeshLambertMaterial({ color: 0xFFFF88 });
    [-38,-20,0,20,38].forEach(x => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,9,8), pMat);
        pole.position.set(x, 4.5, 16);
        scene.add(pole);
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(1,0.7,1), lMat);
        lamp.position.set(x, 9.4, 16);
        scene.add(lamp);
    });

    // Árboles
    const tMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
    const gMat = new THREE.MeshLambertMaterial({ color: 0x33691E });
    [-48,-38,38,48].forEach(x => {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,5,8), tMat);
        t.position.set(x, 2.5, 10);
        scene.add(t);
        const g = new THREE.Mesh(new THREE.SphereGeometry(3.5,8,6), gMat);
        g.position.set(x, 7.5, 10);
        scene.add(g);
    });

})(); // Fin buildScene

// ═══════════════════════════════════════════════════════
//  ENTIDADES
// ═══════════════════════════════════════════════════════

class Beto {
    constructor() {
        console.log('[BETO] Beto constructor called');
        this.speed = 0.15;
        this.target = null;
        this.wc = 0;
        this._build();
    }
    _build() {
        console.log('[BETO] Beto._build called');
        const g   = new THREE.Group();
        const sk  = new THREE.MeshLambertMaterial({ color: 0xFFCCAA });
        const bl  = new THREE.MeshLambertMaterial({ color: 0x1122CC });
        const ye  = new THREE.MeshLambertMaterial({ color: 0xFFDD00 });
        const blk = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const lb  = new THREE.MeshLambertMaterial({ color: 0x3366FF });

        const box = (w,h,d,m,x,y,z) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m);
            mesh.position.set(x,y,z);
            g.add(mesh);
            return mesh;
        };

        this.lL = box(0.45,1.0,0.45, lb,  -0.28,0,0);
        this.lR = box(0.45,1.0,0.45, lb,   0.28,0,0);
                  box(1.2, 1.2,0.65, bl,   0,   1.3,0);   // torso
                  box(1.25,0.4,0.70, ye,   0,   1.3,0);   // franja
        this.aL = box(0.4, 1.0,0.4,  bl,  -0.82,1.3,0);
        this.aR = box(0.4, 1.0,0.4,  bl,   0.82,1.3,0);
                  box(0.5, 0.35,0.5, sk,   0,   2.1,0);   // cuello
                  box(0.85,0.9,0.80, sk,   0,   2.72,0);  // cabeza
                  box(0.17,0.17,0.1, blk, -0.22,2.78,0.41); // ojo L
                  box(0.17,0.17,0.1, blk,  0.22,2.78,0.41); // ojo R
                  box(0.9, 0.22,0.85,ye,   0,   3.25,0);  // bandana

        this.mesh = g;
        scene.add(g);
    }
    moveTo(x,z) { this.target = new THREE.Vector3(x,0,z); }
    move(keys) {
        const v = new THREE.Vector3(
            (keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),
            0,
            (keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)
        );
        if(v.length()>0){
            v.normalize().multiplyScalar(20);
            const p = this.mesh.position.clone().add(v);
            p.x = Math.max(-MAP,Math.min(MAP,p.x));
            p.z = Math.max(-MAP,Math.min(MAP,p.z));
            this.target = p;
        }
    }
    update(dt) {
        this.wc += dt*8;
        const sw = Math.sin(this.wc)*0.45;
        this.lL.rotation.x =  sw; this.lR.rotation.x = -sw;
        this.aL.rotation.x = -sw; this.aR.rotation.x =  sw;
        if(this.target){
            const d = new THREE.Vector3().subVectors(this.target, this.mesh.position);
            if(d.length()>0.2){
                d.normalize();
                this.mesh.position.addScaledVector(d, this.speed);
                this.mesh.rotation.y = Math.atan2(d.x,d.z);
            } else {
                this.mesh.position.copy(this.target);
                this.target = null;
            }
        }
    }
}

class Car {
    constructor() {
        this.visible   = true;
        this.state     = 'waiting';
        this.born      = Date.now();
        this.parkPos   = null;
        this.collected = false;
        this._build();
    }
    _build() {
        const g    = new THREE.Group();
        const col  = new THREE.Color().setHSL(Math.random(),0.8,0.5);
        const cMat = new THREE.MeshLambertMaterial({ color: col });
        const dMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const gMat = new THREE.MeshLambertMaterial({ color: 0x88CCFF, transparent:true, opacity:0.55 });
        const lMat = new THREE.MeshLambertMaterial({ color: 0xFFFFAA });

        const box = (w,h,d,m,x,y,z) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m);
            mesh.position.set(x,y,z); g.add(mesh);
        };

        box(2.6,0.8,5.0,  cMat, 0, 0.48,  0);    // chasis
        box(2.2,1.0,2.8,  cMat, 0, 1.38,  0.2);  // cabina
        box(2.1,0.8,0.12, gMat, 0, 1.38, -1.2);  // parabrisas

        const wG = new THREE.CylinderGeometry(0.48,0.48,0.28,12);
        [[-1.2,0.48,-1.8],[1.2,0.48,-1.8],[-1.2,0.48,1.8],[1.2,0.48,1.8]].forEach(p=>{
            const w = new THREE.Mesh(wG, dMat);
            w.rotation.z = Math.PI/2;
            w.position.set(...p);
            g.add(w);
        });

        [-0.75,0.75].forEach(x=>{
            box(0.4,0.28,0.1, lMat, x, 0.55, -2.52);
        });

        const iMat = new THREE.MeshLambertMaterial({ color:0xFFEE00 });
        this.ind = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6), iMat);
        this.ind.position.y = 3.6;
        g.add(this.ind);

        this.mesh = g;
        scene.add(g);
    }
    park(x,z) {
        this.state   = 'parking';
        this.parkPos = {x,z};
        this.ind.visible = false;
    }
    leave() { this.state = 'leaving'; }
    update(dt) {
        if(!this.visible) return;
        if(this.state==='waiting'){
            this.ind.rotation.y += dt*3;
            this.ind.position.y  = 3.6 + Math.sin(Date.now()*0.004)*0.28;
            this.ind.visible     = Math.floor(Date.now()/400)%2===0;
            if(Date.now()-this.born > 20000 && Math.random()<0.005) this.leave();
        }
        if(this.state==='parking' && this.parkPos){
            const tgt = new THREE.Vector3(this.parkPos.x, 0, this.parkPos.z);
            const dir = new THREE.Vector3().subVectors(tgt, this.mesh.position);
            if(dir.length()>0.35){
                dir.normalize();
                this.mesh.position.addScaledVector(dir,0.18);
                this.mesh.rotation.y = Math.atan2(dir.x,dir.z);
            } else {
                this.mesh.position.copy(tgt);
                this.state = 'parked';
            }
        }
        if(this.state==='leaving'){
            this.mesh.position.z += dt*15;
            if(this.mesh.position.z>80) this.visible=false;
        }
    }
}

class Dog {
    constructor() {
        this.visible = true;
        this.state   = 'wandering';
        this.wt      = Math.random()*10;
        this.atk     = 0;
        this._build();
    }
    _build() {
        const g    = new THREE.Group();
        const fur  = new THREE.MeshLambertMaterial({ color:0x8B6914 });
        const dark = new THREE.MeshLambertMaterial({ color:0x5C3D0E });
        const blk  = new THREE.MeshLambertMaterial({ color:0x111111 });

        const box=(w,h,d,m,x,y,z)=>{
            const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
            mesh.position.set(x,y,z); g.add(mesh); return mesh;
        };

        box(1.6,1.0,2.4, fur, 0, 1.0, 0);
        box(1.2,1.1,1.4, dark,0, 2.0, 1.1);
        box(0.8,0.6,0.65,fur, 0, 1.78,1.8);
        box(0.35,0.6,0.18,dark,-0.52,2.75,1.0);
        box(0.35,0.6,0.18,dark, 0.52,2.75,1.0);
        box(0.2,0.2,0.12,blk,-0.32,2.05,1.75);
        box(0.2,0.2,0.12,blk, 0.32,2.05,1.75);

        this.patas = [];
        const lG = new THREE.BoxGeometry(0.35,0.85,0.35);
        [[-0.6,0.42,-0.75],[0.6,0.42,-0.75],[-0.6,0.42,0.8],[0.6,0.42,0.8]].forEach(p=>{
            const leg = new THREE.Mesh(lG, dark);
            leg.position.set(...p); g.add(leg); this.patas.push(leg);
        });

        this.cola = box(0.15,0.9,0.15, fur, 0, 1.5,-1.3);
        this.cola.rotation.x = -0.8;

        g.scale.set(1.3,1.3,1.3);
        this.mesh = g;
        scene.add(g);
    }
    attack() {
        this.state = 'attacking';
        this.atk   = Date.now();
        for(let i=0;i<4;i++){
            setTimeout(()=>{
                if(this.visible){ this.mesh.scale.set(2,2,2);
                    setTimeout(()=>{ if(this.visible) this.mesh.scale.set(1.3,1.3,1.3); },150); }
            },i*280);
        }
    }
    update(dt) {
        if(!this.visible) return;
        this.wt += dt*5;
        if(this.state==='wandering'){
            if(Math.random()<0.018) this.mesh.rotation.y+=(Math.random()-0.5)*1.4;
            const spd=0.08;
            this.mesh.position.x += Math.sin(this.mesh.rotation.y)*spd;
            this.mesh.position.z += Math.cos(this.mesh.rotation.y)*spd;
            this.mesh.position.x  = Math.max(-MAP,Math.min(MAP,this.mesh.position.x));
            this.mesh.position.z  = Math.max(-MAP,Math.min(MAP,this.mesh.position.z));
            const sw=Math.sin(this.wt)*0.5;
            this.patas[0].rotation.x= sw; this.patas[1].rotation.x=-sw;
            this.patas[2].rotation.x=-sw; this.patas[3].rotation.x= sw;
            this.cola.rotation.z = Math.sin(this.wt*2.5)*0.45;
        }
        if(this.state==='attacking' && Date.now()-this.atk>1200) this.state='leaving';
        if(this.state==='leaving'){
            this.mesh.position.z+=dt*12;
            if(this.mesh.position.z>80) this.visible=false;
        }
        this.mesh.position.y=0;
    }
}

// ═══════════════════════════════════════════════════════
//  ESTADO DEL JUEGO
// ═══════════════════════════════════════════════════════
const G = {
    state:'START', level:1, money:100, lives:3, maxCars:12,
    cars:[], dogs:[], beto:null,
    spawnT:null, dogT:null, keys:{}
};

const LEVELS = {
    1:{spawn:2500,dogs:5000,label:'La Calle'},
    2:{spawn:1500,dogs:3000,label:'La Plaza'},
    3:{spawn:800, dogs:1800,label:'4 Manzanas'},
};

function toast(txt, color='#FFD700'){
    const el=document.createElement('div');
    el.textContent=txt;
    el.style.cssText=`position:fixed;top:44%;left:50%;transform:translate(-50%,-50%);
        background:rgba(0,0,0,.8);color:${color};padding:12px 28px;border-radius:10px;
        font-size:22px;font-weight:bold;pointer-events:none;z-index:300;
        transition:opacity .5s,top .5s;`;
    document.body.appendChild(el);
    setTimeout(()=>{el.style.opacity='0';el.style.top='34%';},700);
    setTimeout(()=>el.remove(),1300);
}

function startGame(level){
    console.log('[BETO] startGame called, level:', level);

    // Limpiar entidades anteriores
    G.cars.forEach(c=>scene.remove(c.mesh));
    G.dogs.forEach(d=>scene.remove(d.mesh));
    if(G.beto) scene.remove(G.beto.mesh);
    if(window._debugCubes) window._debugCubes.forEach(c=>scene.remove(c));
    clearInterval(G.spawnT);
    clearInterval(G.dogT);

    G.cars=[];
    G.dogs=[];
    G.level=level;
    G.money=100;
    G.lives=3;
    G.state='PLAYING';

    // Crear Beto con la clase completa
    G.beto=new Beto();
    G.beto.mesh.position.set(0,0,0);

    const cfg=LEVELS[level];

    const spawnCar=()=>{
        if(G.cars.length>=G.maxCars) return;
        console.log('[BETO] Spawning car', G.cars.length+1);
        const car=new Car();
        car.mesh.scale.set(2,2,2);
        car.mesh.position.set(
            (Math.random()-0.5)*70,
            0.15,
            -5+(Math.random()-0.5)*10
        );
        console.log('[BETO] Car position:', car.mesh.position);
        G.cars.push(car);
    };

    const spawnDog=()=>{
        if(G.dogs.length>=6) return;
        const dog=new Dog();
        const sides=[[-50,0],[50,0],[0,-40],[0,30]];
        const [px,pz]=sides[Math.floor(Math.random()*4)];
        dog.mesh.position.set(px,0,pz);
        dog.mesh.rotation.y=Math.atan2(-px,-pz);
        G.dogs.push(dog);
    };

    // Spawn inicial
    for(let i=0;i<4;i++) setTimeout(spawnCar, i*200);
    console.log('[BETO] Scheduled 4 cars to spawn');

    // Intervalos
    G.spawnT=setInterval(()=>{ if(G.state==='PLAYING') spawnCar(); }, cfg.spawn);
    G.dogT=setInterval(()=>{ if(G.state==='PLAYING') spawnDog(); }, cfg.dogs);

    console.log('[BETO] startGame nivel',level,'— Beto en',G.beto.mesh.position);

    // Debug cubes (limpiables)
    window._debugCubes=[];
    const debugGeo=new THREE.BoxGeometry(8,8,8);
    const debugMat=new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const debugCube=new THREE.Mesh(debugGeo,debugMat);
    debugCube.position.set(0,4,10);
    scene.add(debugCube);
    window._debugCubes.push(debugCube);

    const debugGeo2=new THREE.BoxGeometry(4,4,4);
    const debugMat2=new THREE.MeshLambertMaterial({ color: 0x00FF00 });
    const debugCube2=new THREE.Mesh(debugGeo2,debugMat2);
    debugCube2.position.copy(G.beto.mesh.position);
    debugCube2.position.y=2;
    scene.add(debugCube2);
    window._debugCubes.push(debugCube2);

    console.log('Beto position:', G.beto.mesh.position);
    console.log('Scene children:', scene.children.length);
}

function gameOver(reason){
    G.state='GAMEOVER';
    clearInterval(G.spawnT); clearInterval(G.dogT);
    document.getElementById('game-over-reason').textContent=reason;
    document.getElementById('final-score').textContent=G.money;
    document.getElementById('game-over-screen').style.display='block';
}

// ── Click en el suelo ────────────────────────────────────────────
canvas.addEventListener('click', e=>{
    if(G.state!=='PLAYING'||!G.beto) return;
    const rect=canvas.getBoundingClientRect();
    const nx=((e.clientX-rect.left)/rect.width)*2-1;
    const ny=-((e.clientY-rect.top)/rect.height)*2+1;
    const ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(nx,ny), camera);
    const hits=ray.intersectObject(window._ground);
    if(!hits.length) return;
    const pt=hits[0].point;
    G.beto.moveTo(pt.x, pt.z);

    const mat=new THREE.MeshLambertMaterial({color:0xFFFF00,transparent:true,opacity:0.9});
    const mk=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.15,1.2),mat);
    mk.position.set(pt.x,0.08,pt.z);
    scene.add(mk);
    let op=0.9;
    const iv=setInterval(()=>{op-=0.08;mat.opacity=op;if(op<=0){clearInterval(iv);scene.remove(mk);}},70);

    for(const car of G.cars){
        if(car.state!=='waiting') continue;
        if(car.mesh.position.distanceTo(G.beto.mesh.position)<12){
            car.park(pt.x, pt.z);
            toast('¡Auto guiado! 🚗','#4CAF50');
            break;
        }
    }
});

// ── Teclado ──────────────────────────────────────────────────────
document.addEventListener('keydown', e=>{
    const k=e.key.toLowerCase();
    if(k==='arrowup'||k==='w'){ G.keys.w=true; G.keys.arrowup=true; }
    if(k==='arrowdown'||k==='s'){ G.keys.s=true; G.keys.arrowdown=true; }
    if(k==='arrowleft'||k==='a'){ G.keys.a=true; G.keys.arrowleft=true; }
    if(k==='arrowright'||k==='d'){ G.keys.d=true; G.keys.arrowright=true; }
    if(G.state==='PLAYING'&&G.beto) G.beto.move(G.keys);
});
document.addEventListener('keyup', e=>{
    const k=e.key.toLowerCase();
    if(k==='arrowup'||k==='w'){ delete G.keys.w; delete G.keys.arrowup; }
    if(k==='arrowdown'||k==='s'){ delete G.keys.s; delete G.keys.arrowdown; }
    if(k==='arrowleft'||k==='a'){ delete G.keys.a; delete G.keys.arrowleft; }
    if(k==='arrowright'||k==='d'){ delete G.keys.d; delete G.keys.arrowright; }
});

// ═══════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════
let lastT = performance.now();
(function loop(t){
    requestAnimationFrame(loop);
    const dt = Math.min((t-lastT)/1000, 0.1);
    lastT = t;

    if(G.state==='PLAYING'){
        G.beto?.update(dt);
        G.cars.forEach(c=>c.update(dt));
        G.dogs.forEach(d=>d.update(dt));

        G.cars.forEach(car=>{
            if(car.state==='parked'&&!car.collected&&G.beto){
                if(car.mesh.position.distanceTo(G.beto.mesh.position)<6){
                    car.collected=true;
                    const gain=15+Math.floor(Math.random()*35);
                    G.money+=gain;
                    toast(`+$${gain} 💰`,'#FFD700');
                    setTimeout(()=>car.leave(),1500);
                }
            }
        });

        G.dogs.forEach(dog=>{
            if(dog.state==='wandering'&&G.beto){
                if(dog.mesh.position.distanceTo(G.beto.mesh.position)<4){
                    dog.attack();
                    G.money=Math.max(0,G.money-15);
                    toast('¡Mordida! -$15 🐕','#FF5252');
                }
            }
        });

        G.cars=G.cars.filter(c=>{ if(!c.visible){scene.remove(c.mesh);return false;} return true; });
        G.dogs=G.dogs.filter(d=>{ if(!d.visible){scene.remove(d.mesh);return false;} return true; });

        if(G.money<=0) gameOver('¡Sin plata! 💸');
    }

    const $=id=>document.getElementById(id);
    if($('money-display'))  $('money-display').textContent =`$${G.money}`;
    if($('lives-display'))  $('lives-display').textContent =G.lives;
    if($('cars-display'))   $('cars-display').textContent  =`${G.cars.length}/${G.maxCars}`;
    if($('level-display'))  $('level-display').textContent =`${G.level} - ${LEVELS[G.level]?.label||''}`;

    renderer.render(scene, camera);
})(lastT);

// ── UI ───────────────────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click',()=>{
    document.getElementById('start-screen').style.display='none';
    document.getElementById('level-select').style.display='block';
});
document.querySelectorAll('.level-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.level-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        startGame(parseInt(btn.dataset.level));
        document.getElementById('level-select').style.display='none';
    });
});
document.getElementById('restart-btn').addEventListener('click',()=>{
    document.getElementById('game-over-screen').style.display='none';
    document.getElementById('start-screen').style.display='block';
});
