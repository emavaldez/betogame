// LA VIDA DE BETO
import * as THREE from 'three';

// ── Cámara ───────────────────────────────────────────────────────
const CAM_POS  = new THREE.Vector3(0, 30, 40);
const CAM_LOOK = new THREE.Vector3(0, 0, 0);

const MAP = 40;

// ═══════════════════════════════════════════════════════
//  ESCENA GLOBAL
// ═══════════════════════════════════════════════════════
const canvas   = document.getElementById('game-canvas');
const scene    = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera   = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 600);
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

// ── Luces ────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(30, 50, 30);
scene.add(sun);

// ═══════════════════════════════════════════════════════
//  HELPERS: Círculo de progreso 3D
// ═══════════════════════════════════════════════════════
function makeProgressSprite(color='#4CAF50'){
    const can=document.createElement('canvas');
    can.width=128; can.height=128;
    const ctx=can.getContext('2d');
    const tex=new THREE.CanvasTexture(can);
    const mat=new THREE.SpriteMaterial({map:tex, transparent:true, depthTest:false});
    const spr=new THREE.Sprite(mat);
    spr.scale.set(3.5,3.5,1);
    spr.userData={can,ctx,tex,color,progress:0};
    return spr;
}
function updateProgress(spr, prog){
    const {can,ctx,tex,color}=spr.userData;
    ctx.clearRect(0,0,128,128);
    ctx.beginPath(); ctx.arc(64,64,58,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=10; ctx.stroke();
    ctx.beginPath(); ctx.arc(64,64,58,-Math.PI/2,-Math.PI/2+Math.PI*2*prog);
    ctx.strokeStyle=color; ctx.lineWidth=10; ctx.stroke();
    tex.needsUpdate=true;
}

// ═══════════════════════════════════════════════════════
//  ESCENARIO ESTÁTICO
// ═══════════════════════════════════════════════════════
(function buildScene(){
    // Suelo verde
    const ground=new THREE.Mesh(
        new THREE.PlaneGeometry(200,200),
        new THREE.MeshLambertMaterial({color:0x55AA44})
    );
    ground.rotation.x=-Math.PI/2;
    scene.add(ground);
    window._ground=ground;

    // Zona asfalto
    const asphalt=new THREE.Mesh(
        new THREE.PlaneGeometry(100,50),
        new THREE.MeshLambertMaterial({color:0x444444})
    );
    asphalt.rotation.x=-Math.PI/2;
    asphalt.position.y=0.01;
    scene.add(asphalt);

    // Líneas blancas (slots)
    const wMat=new THREE.MeshLambertMaterial({color:0xFFFFFF});
    for(let x=-44;x<=44;x+=8){
        const l=new THREE.Mesh(new THREE.PlaneGeometry(0.5,18),wMat);
        l.rotation.x=-Math.PI/2; l.position.set(x,0.03,0); scene.add(l);
    }
    [-9,9].forEach(z=>{
        const l=new THREE.Mesh(new THREE.PlaneGeometry(100,0.5),wMat);
        l.rotation.x=-Math.PI/2; l.position.set(0,0.03,z); scene.add(l);
    });

    // Casas Caminito
    const colors=[0xFF4444,0xFFD700,0x44AAFF,0x55CC55,0xFF88CC,0xFFAA33,0x9966FF,0x33DDAA];
    const hw=8, hd=7;
    for(let i=0;i<9;i++){
        const h=9+Math.random()*7;
        const cx=-36+i*(hw+1);
        const col=colors[i%colors.length];
        // Pared
        const wall=new THREE.Mesh(new THREE.BoxGeometry(hw,h,hd),new THREE.MeshLambertMaterial({color:col}));
        wall.position.set(cx,h/2,-42); scene.add(wall);
        // Techo
        const roof=new THREE.Mesh(new THREE.ConeGeometry(hw*0.75,3.5,4),new THREE.MeshLambertMaterial({color:0x8B4513}));
        roof.position.set(cx,h+1.75,-42); roof.rotation.y=Math.PI/4; scene.add(roof);
        // Ventanas
        [-2,2].forEach(vx=>{
            const w=new THREE.Mesh(new THREE.BoxGeometry(2,2.5,0.3),new THREE.MeshLambertMaterial({color:0x88CCFF}));
            w.position.set(cx+vx,h*0.6,-38.5); scene.add(w);
        });
        // Puerta
        const door=new THREE.Mesh(new THREE.BoxGeometry(2.2,4,0.3),new THREE.MeshLambertMaterial({color:0x5C3317}));
        door.position.set(cx,2,-38.5); scene.add(door);
    }

    // Faroles
    const pMat=new THREE.MeshLambertMaterial({color:0x999999});
    const lMat=new THREE.MeshLambertMaterial({color:0xFFFF88});
    [-38,-20,0,20,38].forEach(x=>{
        const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,9,8),pMat);
        pole.position.set(x,4.5,16); scene.add(pole);
        const lamp=new THREE.Mesh(new THREE.BoxGeometry(1,0.7,1),lMat);
        lamp.position.set(x,9.4,16); scene.add(lamp);
    });

    // Árboles
    const tMat=new THREE.MeshLambertMaterial({color:0x795548});
    const gMat=new THREE.MeshLambertMaterial({color:0x33691E});
    [-48,-38,38,48].forEach(x=>{
        const t=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.5,5,8),tMat);
        t.position.set(x,2.5,10); scene.add(t);
        const g=new THREE.Mesh(new THREE.SphereGeometry(3.5,8,6),gMat);
        g.position.set(x,7.5,10); scene.add(g);
    });
})();

// ═══════════════════════════════════════════════════════
//  ENTIDADES
// ═══════════════════════════════════════════════════════

class Beto {
    constructor(){
        this.speed=0.15;
        this.target=null;
        this.wc=0;
        this._build();
    }
    _build(){
        const g=new THREE.Group();
        const sk=new THREE.MeshLambertMaterial({color:0xFFCCAA});
        const bl=new THREE.MeshLambertMaterial({color:0x1122CC});
        const ye=new THREE.MeshLambertMaterial({color:0xFFDD00});
        const blk=new THREE.MeshLambertMaterial({color:0x111111});
        const lb=new THREE.MeshLambertMaterial({color:0x3366FF});
        const box=(w,h,d,m,x,y,z)=>{
            const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
            mesh.position.set(x,y,z); g.add(mesh); return mesh;
        };
        this.lL=box(0.45,1.0,0.45,lb,-0.28,0,0);
        this.lR=box(0.45,1.0,0.45,lb,0.28,0,0);
        box(1.2,1.2,0.65,bl,0,1.3,0);
        box(1.25,0.4,0.70,ye,0,1.3,0);
        this.aL=box(0.4,1.0,0.4,bl,-0.82,1.3,0);
        this.aR=box(0.4,1.0,0.4,bl,0.82,1.3,0);
        box(0.5,0.35,0.5,sk,0,2.1,0);
        box(0.85,0.9,0.80,sk,0,2.72,0);
        box(0.17,0.17,0.1,blk,-0.22,2.78,0.41);
        box(0.17,0.17,0.1,blk,0.22,2.78,0.41);
        box(0.9,0.22,0.85,ye,0,3.25,0);
        this.mesh=g;
        scene.add(g);
    }
    moveTo(x,z){ this.target=new THREE.Vector3(x,0,z); }
    move(keys){
        const v=new THREE.Vector3(
            (keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),
            0,
            (keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0)
        );
        if(v.length()>0){
            v.normalize().multiplyScalar(4); // ← movimiento más corto
            const p=this.mesh.position.clone().add(v);
            p.x=Math.max(-MAP,Math.min(MAP,p.x));
            p.z=Math.max(-MAP,Math.min(MAP,p.z));
            this.target=p;
        }
    }
    update(dt){
        this.wc+=dt*8;
        const sw=Math.sin(this.wc)*0.45;
        this.lL.rotation.x=sw; this.lR.rotation.x=-sw;
        this.aL.rotation.x=-sw; this.aR.rotation.x=sw;
        if(this.target){
            const d=new THREE.Vector3().subVectors(this.target,this.mesh.position);
            if(d.length()>0.2){
                d.normalize();
                this.mesh.position.addScaledVector(d,this.speed);
                this.mesh.rotation.y=Math.atan2(d.x,d.z);
            }else{
                this.mesh.position.copy(this.target);
                this.target=null;
            }
        }
    }
}

class Car {
    constructor(){
        this.visible=true;
        this.state='waiting';
        this.born=Date.now();
        this.parkPos=null;
        this.collected=false;
        this.passengers=[];
        this._build();
    }
    _build(){
        const g=new THREE.Group();
        const col=new THREE.Color().setHSL(Math.random(),0.8,0.5);
        const cMat=new THREE.MeshLambertMaterial({color:col});
        const dMat=new THREE.MeshLambertMaterial({color:0x222222});
        const gMat=new THREE.MeshLambertMaterial({color:0x88CCFF,transparent:true,opacity:0.55});
        const lMat=new THREE.MeshLambertMaterial({color:0xFFFFAA});
        const box=(w,h,d,m,x,y,z)=>{
            const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
            mesh.position.set(x,y,z); g.add(mesh);
        };
        box(2.6,0.8,5.0,cMat,0,0.48,0);
        box(2.2,1.0,2.8,cMat,0,1.38,0.2);
        box(2.1,0.8,0.12,gMat,0,1.38,-1.2);
        const wG=new THREE.CylinderGeometry(0.48,0.48,0.28,12);
        [[-1.2,0.48,-1.8],[1.2,0.48,-1.8],[-1.2,0.48,1.8],[1.2,0.48,1.8]].forEach(p=>{
            const w=new THREE.Mesh(wG,dMat); w.rotation.z=Math.PI/2; w.position.set(...p); g.add(w);
        });
        [-0.75,0.75].forEach(x=>box(0.4,0.28,0.1,lMat,x,0.55,-2.52));
        const iMat=new THREE.MeshLambertMaterial({color:0xFFEE00});
        this.ind=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6),iMat);
        this.ind.position.y=3.6; g.add(this.ind);
        this.mesh=g;
        scene.add(g);
    }
    park(x,z){
        this.state='parking';
        this.parkPos={x,z};
        this.ind.visible=false;
    }
    leave(){
        this.state='leaving';
        // pasajeros se van si no cobraron
        this.passengers.forEach(p=>p.leave());
    }
    spawnPassengers(){
        const count=1+Math.floor(Math.random()*2); // 1-2 pasajeros
        for(let i=0;i<count;i++){
            const p=new Passenger();
            p.mesh.position.set(this.mesh.position.x+(i-0.5)*1.5,0,this.mesh.position.z+3.5);
            p.car=this;
            this.passengers.push(p);
            G.passengers.push(p);
        }
    }
    update(dt){
        if(!this.visible) return;
        if(this.state==='waiting'){
            this.ind.rotation.y+=dt*3;
            this.ind.position.y=3.6+Math.sin(Date.now()*0.004)*0.28;
            this.ind.visible=Math.floor(Date.now()/400)%2===0;
            // Buscar un slot activo cerca
            const spot=G.spots.find(s=>s.state==='active'&&!s.assigned);
            if(spot){
                spot.assigned=true;
                this.park(spot.x,spot.z);
            }
            if(Date.now()-this.born>25000 && Math.random()<0.003) this.leave();
        }
        if(this.state==='parking' && this.parkPos){
            const tgt=new THREE.Vector3(this.parkPos.x,0,this.parkPos.z);
            const dir=new THREE.Vector3().subVectors(tgt,this.mesh.position);
            if(dir.length()>0.35){
                dir.normalize();
                this.mesh.position.addScaledVector(dir,0.18);
                this.mesh.rotation.y=Math.atan2(dir.x,dir.z);
            }else{
                this.mesh.position.copy(tgt);
                this.state='parked';
                this.spawnPassengers();
            }
        }
        if(this.state==='leaving'){
            this.mesh.position.z+=dt*15;
            if(this.mesh.position.z>80) this.visible=false;
        }
    }
}

class Passenger {
    constructor(){
        this.visible=true;
        this.state='waiting'; // waiting, paying, paid, leaving
        this.payProgress=0;
        this._build();
    }
    _build(){
        const g=new THREE.Group();
        const skin=new THREE.MeshLambertMaterial({color:0xFFCCAA});
        const shirt=new THREE.MeshLambertMaterial({color:new THREE.Color().setHSL(Math.random(),0.7,0.5)});
        const pants=new THREE.MeshLambertMaterial({color:0x333344});
        const body=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.7,0.35),shirt);
        body.position.y=1.0; g.add(body);
        const head=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.45,0.45),skin);
        head.position.y=1.6; g.add(head);
        const legL=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.6,0.2),pants);
        legL.position.set(-0.15,0.3,0); g.add(legL);
        const legR=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.6,0.2),pants);
        legR.position.set(0.15,0.3,0); g.add(legR);
        this.mesh=g;
        scene.add(g);
        // Círculo de progreso
        this.progSprite=makeProgressSprite('#FFD700');
        this.progSprite.position.set(0,3.5,0);
        this.mesh.add(this.progSprite);
        this.progSprite.visible=false;
    }
    leave(){
        this.state='leaving';
        this.progSprite.visible=false;
    }
    update(dt){
        if(!this.visible) return;
        if(this.state==='waiting' && G.beto){
            const dist=this.mesh.position.distanceTo(G.beto.mesh.position);
            if(dist<3.5){
                this.state='paying';
                this.progSprite.visible=true;
            }
        }
        if(this.state==='paying'){
            if(!G.beto) return;
            const dist=this.mesh.position.distanceTo(G.beto.mesh.position);
            if(dist>4.5){
                this.state='waiting';
                this.payProgress=0;
                this.progSprite.visible=false;
                return;
            }
            this.payProgress+=dt;
            updateProgress(this.progSprite, Math.min(this.payProgress/1.5,1));
            if(this.payProgress>=1.5){
                this.state='paid';
                this.progSprite.visible=false;
                const gain=15+Math.floor(Math.random()*35);
                G.money+=gain;
                toast(`+$${gain} 💰`,'#FFD700');
                if(this.car) this.car.collected=true;
                // Se van
                setTimeout(()=>{
                    this.state='leaving';
                    if(this.car) this.car.leave();
                },800);
            }
        }
        if(this.state==='leaving'){
            this.mesh.position.z+=dt*4;
            if(this.mesh.position.z>70) this.visible=false;
        }
    }
}

class ParkingSpot {
    constructor(x,z){
        this.x=x; this.z=z;
        this.state='activating'; // activating, active, used
        this.timer=0;
        this.assigned=false;
        this._build();
    }
    _build(){
        const g=new THREE.Group();
        // Marcador amarillo en el piso
        const m=new THREE.Mesh(
            new THREE.PlaneGeometry(5,12),
            new THREE.MeshLambertMaterial({color:0xFFEE00,transparent:true,opacity:0.4})
        );
        m.rotation.x=-Math.PI/2; m.position.y=0.05;
        g.add(m);
        this.mesh=g;
        scene.add(g);
        g.position.set(this.x,0,this.z);
        // Círculo de progreso
        this.progSprite=makeProgressSprite('#4CAF50');
        this.progSprite.position.set(0,2,0);
        g.add(this.progSprite);
    }
    update(dt){
        if(this.state==='activating'){
            this.timer+=dt;
            updateProgress(this.progSprite, Math.min(this.timer/1.5,1));
            if(this.timer>=1.5){
                this.state='active';
                this.progSprite.visible=false;
                toast('¡Lugar listo! 🅿️','#4CAF50');
            }
        }
        if(this.state==='used' || (this.assigned && this.state==='active')){
            this.progSprite.visible=false;
        }
    }
}

class Dog {
    constructor(targetCar){
        this.visible=true;
        this.state='approaching';
        this.targetCar=targetCar;
        this.timer=0;
        this.chaseProgress=0;
        this._build();
    }
    _build(){
        const g=new THREE.Group();
        const fur=new THREE.MeshLambertMaterial({color:0x8B6914});
        const dark=new THREE.MeshLambertMaterial({color:0x5C3D0E});
        const blk=new THREE.MeshLambertMaterial({color:0x111111});
        const box=(w,h,d,m,x,y,z)=>{
            const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
            mesh.position.set(x,y,z); g.add(mesh); return mesh;
        };
        box(1.6,1.0,2.4,fur,0,1.0,0);
        box(1.2,1.1,1.4,dark,0,2.0,1.1);
        box(0.8,0.6,0.65,fur,0,1.78,1.8);
        box(0.35,0.6,0.18,dark,-0.52,2.75,1.0);
        box(0.35,0.6,0.18,dark,0.52,2.75,1.0);
        box(0.2,0.2,0.12,blk,-0.32,2.05,1.75);
        box(0.2,0.2,0.12,blk,0.32,2.05,1.75);
        this.patas=[];
        const lG=new THREE.BoxGeometry(0.35,0.85,0.35);
        [[-0.6,0.42,-0.75],[0.6,0.42,-0.75],[-0.6,0.42,0.8],[0.6,0.42,0.8]].forEach(p=>{
            const leg=new THREE.Mesh(lG,dark);
            leg.position.set(...p); g.add(leg); this.patas.push(leg);
        });
        this.cola=box(0.15,0.9,0.15,fur,0,1.5,-1.3);
        this.cola.rotation.x=-0.8;
        g.scale.set(1.3,1.3,1.3);
        this.mesh=g;
        // Spawn al lado del auto objetivo
        if(this.targetCar){
            const tp=this.targetCar.mesh.position;
            this.mesh.position.set(tp.x+5,0,tp.z+5);
        }
        scene.add(g);
        // Progreso
        this.progSprite=makeProgressSprite('#FF5252');
        this.progSprite.position.set(0,3.5,0);
        this.mesh.add(this.progSprite);
        this.progSprite.visible=false;
    }
    update(dt){
        if(!this.visible) return;
        this.timer+=dt;
        if(this.state==='approaching' && this.targetCar){
            const tp=this.targetCar.mesh.position;
            const dir=new THREE.Vector3().subVectors(tp,this.mesh.position);
            if(dir.length()>4){
                dir.normalize();
                this.mesh.position.addScaledVector(dir,0.06);
                this.mesh.rotation.y=Math.atan2(dir.x,dir.z);
            }else{
                this.state='peeing';
                this.peeTimer=0;
            }
        }
        if(this.state==='peeing'){
            this.peeTimer+=dt;
            // Mover cola
            this.cola.rotation.z=Math.sin(this.timer*8)*0.6;
            if(this.peeTimer>6){
                // Mearon el auto, se va sin pago
                toast('¡Perro meó el auto! 🐕💦','#FF5252');
                if(this.targetCar) this.targetCar.leave();
                this.state='leaving';
            }
            if(G.beto){
                const dist=this.mesh.position.distanceTo(G.beto.mesh.position);
                if(dist<4){
                    this.state='chased';
                    this.chaseProgress=0;
                    this.progSprite.visible=true;
                }
            }
        }
        if(this.state==='chased'){
            if(!G.beto) return;
            const dist=this.mesh.position.distanceTo(G.beto.mesh.position);
            if(dist>5){
                this.state='peeing';
                this.progSprite.visible=false;
                this.chaseProgress=0;
                return;
            }
            this.chaseProgress+=dt;
            updateProgress(this.progSprite, Math.min(this.chaseProgress/1.5,1));
            if(this.chaseProgress>=1.5){
                toast('¡Perro espantado! 👋','#4CAF50');
                this.state='leaving';
                this.progSprite.visible=false;
            }
        }
        if(this.state==='leaving'){
            this.mesh.position.z+=dt*12;
            if(this.mesh.position.z>80) this.visible=false;
        }
        // Anim patas
        const sw=Math.sin(this.timer*10)*0.5;
        this.patas[0].rotation.x=sw; this.patas[1].rotation.x=-sw;
        this.patas[2].rotation.x=-sw; this.patas[3].rotation.x=sw;
    }
}

// ═══════════════════════════════════════════════════════
//  ESTADO DEL JUEGO
// ═══════════════════════════════════════════════════════
const G={
    state:'START', level:1, money:100, lives:3, maxCars:12,
    cars:[], dogs:[], beto:null, spots:[], passengers:[],
    spawnT:null, dogT:null, keys:{}
};

const LEVELS={
    1:{spawn:2500,dogs:6000,label:'La Calle',maxDogs:3},
    2:{spawn:1800,dogs:4500,label:'La Plaza',maxDogs:5},
    3:{spawn:1200,dogs:3000,label:'4 Manzanas',maxDogs:8},
};

function toast(txt,color='#FFD700'){
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
    console.log('[BETO] startGame level',level);
    // Limpiar
    G.cars.forEach(c=>scene.remove(c.mesh));
    G.dogs.forEach(d=>scene.remove(d.mesh));
    G.spots.forEach(s=>scene.remove(s.mesh));
    G.passengers.forEach(p=>scene.remove(p.mesh));
    if(G.beto) scene.remove(G.beto.mesh);
    clearInterval(G.spawnT); clearInterval(G.dogT);

    G.cars=[]; G.dogs=[]; G.spots=[]; G.passengers=[];
    G.level=level; G.money=100; G.lives=3; G.state='PLAYING';

    G.beto=new Beto();
    G.beto.mesh.position.set(0,0,5);

    const cfg=LEVELS[level];

    const spawnCar=()=>{
        if(G.cars.length>=G.maxCars) return;
        const car=new Car();
        // Aparecen en la calle (entrada sur)
        car.mesh.position.set((Math.random()-0.5)*70,0.15,28+Math.random()*8);
        car.mesh.rotation.y=Math.PI; // miran hacia arriba
        G.cars.push(car);
    };

    const spawnDog=()=>{
        if(G.dogs.length>=cfg.maxDogs) return;
        const parked=G.cars.filter(c=>c.state==='parked');
        if(parked.length===0) return;
        const target=parked[Math.floor(Math.random()*parked.length)];
        // No más de 1 perro por auto
        if(G.dogs.some(d=>d.targetCar===target)) return;
        const dog=new Dog(target);
        G.dogs.push(dog);
    };

    // Spawn inicial
    for(let i=0;i<3;i++) setTimeout(spawnCar,i*300);

    G.spawnT=setInterval(()=>{ if(G.state==='PLAYING') spawnCar(); }, cfg.spawn);
    G.dogT=setInterval(()=>{ if(G.state==='PLAYING') spawnDog(); }, cfg.dogs);

    console.log('[BETO] Nivel',level,'iniciado');
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

    // Beto camina al punto
    G.beto.moveTo(pt.x,pt.z);

    // Verificar si es un slot de estacionamiento
    // Slots: centros en x = -40,-32,-24,-16,-8,0,8,16,24,32,40 ; z entre -9 y 9
    const slotCenters=[-40,-32,-24,-16,-8,0,8,16,24,32,40];
    let slotX=null;
    for(const cx of slotCenters){
        if(Math.abs(pt.x-cx)<3.5){ slotX=cx; break; }
    }
    if(slotX!==null && Math.abs(pt.z)<9){
        // Ya existe un spot aquí?
        const exists=G.spots.some(s=>Math.abs(s.x-slotX)<1 && Math.abs(s.z-pt.z)<2);
        if(!exists){
            G.spots.push(new ParkingSpot(slotX,pt.z));
            toast('Activando lugar...','#FFEE00');
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
        G.spots.forEach(s=>s.update(dt));
        G.passengers.forEach(p=>p.update(dt));

        // Limpiar invisibles
        G.cars=G.cars.filter(c=>{ if(!c.visible){scene.remove(c.mesh);return false;} return true; });
        G.dogs=G.dogs.filter(d=>{ if(!d.visible){scene.remove(d.mesh);return false;} return true; });
        G.passengers=G.passengers.filter(p=>{ if(!p.visible){scene.remove(p.mesh);return false;} return true; });
        G.spots=G.spots.filter(s=>{
            if(s.state==='active' && s.assigned){
                // Cuando el auto se va, liberar spot
                const carStillThere=G.cars.some(c=>c.parkPos && Math.abs(c.parkPos.x-s.x)<1 && c.visible);
                if(!carStillThere){ scene.remove(s.mesh); return false; }
            }
            return true;
        });

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

// Expose for debugging
window._G = G;
