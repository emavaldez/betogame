// LA VIDA DE BETO
import * as THREE from 'three';

const CAM_POS  = new THREE.Vector3(0, 35, 45);
const CAM_LOOK = new THREE.Vector3(0, 0, 0);
const MAP = 40;

const canvas = document.getElementById('game-canvas');
const scene  = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 600);
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

scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(30, 50, 30);
scene.add(sun);

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
function makeProgressSprite(color='#4CAF50'){
    const can=document.createElement('canvas');
    can.width=128; can.height=128;
    const ctx=can.getContext('2d');
    const tex=new THREE.CanvasTexture(can);
    const mat=new THREE.SpriteMaterial({map:tex, transparent:true, depthTest:false});
    const spr=new THREE.Sprite(mat);
    spr.scale.set(3.5,3.5,1);
    spr.userData={can,ctx,tex,color};
    return spr;
}
function updateProgress(spr, prog){
    const {can,ctx,tex,color}=spr.userData;
    ctx.clearRect(0,0,128,128);
    ctx.beginPath(); ctx.arc(64,64,58,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=10; ctx.stroke();
    ctx.beginPath(); ctx.arc(64,64,58,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(prog,1));
    ctx.strokeStyle=color; ctx.lineWidth=10; ctx.stroke();
    tex.needsUpdate=true;
}

// ═══════════════════════════════════════════════════════
//  ESCENARIO POR NIVEL
// ═══════════════════════════════════════════════════════
let SLOT_CENTERS = [-40,-32,-24,-16,-8,0,8,16,24,32,40];
let SLOT_WIDTH = 8;
let SLOT_LENGTH = 18;
let WAIT_LINE_Z = -18;

function clearSceneStatic(){
    // Removemos todo lo que no sea luz ni renderer
    const toRemove=[];
    scene.traverse(child=>{
        if(child.type==='Mesh' && child!==window._ground) toRemove.push(child);
        if(child.type==='Group') toRemove.push(child);
    });
    toRemove.forEach(m=>{ if(m.parent) m.parent.remove(m); });
}

function buildSceneLevel(level){
    // Suelo base
    const ground=new THREE.Mesh(
        new THREE.PlaneGeometry(300,300),
        new THREE.MeshLambertMaterial({color:0x55AA44})
    );
    ground.rotation.x=-Math.PI/2;
    scene.add(ground);
    window._ground=ground;

    const wMat=new THREE.MeshLambertMaterial({color:0xFFFFFF});

    if(level===1){
        // ══ NIVEL 1: LA CALLE (Casas Caminito) ══
        SLOT_CENTERS=[-40,-32,-24,-16,-8,0,8,16,24,32,40];
        SLOT_WIDTH=8; SLOT_LENGTH=18; WAIT_LINE_Z=-18;

        // Asfalto
        const asphalt=new THREE.Mesh(
            new THREE.PlaneGeometry(100,50),
            new THREE.MeshLambertMaterial({color:0x444444})
        );
        asphalt.rotation.x=-Math.PI/2; asphalt.position.y=0.01; scene.add(asphalt);

        // Líneas blancas
        for(let x=-44;x<=44;x+=SLOT_WIDTH){
            const l=new THREE.Mesh(new THREE.PlaneGeometry(0.5,18),wMat);
            l.rotation.x=-Math.PI/2; l.position.set(x,0.03,0); scene.add(l);
        }
        [-9,9].forEach(z=>{
            const l=new THREE.Mesh(new THREE.PlaneGeometry(100,0.5),wMat);
            l.rotation.x=-Math.PI/2; l.position.set(0,0.03,z); scene.add(l);
        });

        // Casas Caminito
        const colors=[0xFF4444,0xFFD700,0x44AAFF,0x55CC55,0xFF88CC,0xFFAA33,0x9966FF,0x33DDAA];
        for(let i=0;i<9;i++){
            const h=9+Math.random()*7;
            const cx=-36+i*9;
            const col=colors[i%colors.length];
            const wall=new THREE.Mesh(new THREE.BoxGeometry(8,h,7),new THREE.MeshLambertMaterial({color:col}));
            wall.position.set(cx,h/2,-42); scene.add(wall);
            const roof=new THREE.Mesh(new THREE.ConeGeometry(6,3.5,4),new THREE.MeshLambertMaterial({color:0x8B4513}));
            roof.position.set(cx,h+1.75,-42); roof.rotation.y=Math.PI/4; scene.add(roof);
            [-2,2].forEach(vx=>{
                const w=new THREE.Mesh(new THREE.BoxGeometry(2,2.5,0.3),new THREE.MeshLambertMaterial({color:0x88CCFF}));
                w.position.set(cx+vx,h*0.6,-38.5); scene.add(w);
            });
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

    }else if(level===2){
        // ══ NIVEL 2: LA PLAZA (Parque verde, bancos, más slots) ══
        SLOT_CENTERS=[-56,-48,-40,-32,-24,-16,-8,0,8,16,24,32,40,48,56];
        SLOT_WIDTH=8; SLOT_LENGTH=18; WAIT_LINE_Z=-22;

        // Asfalto más ancho
        const asphalt=new THREE.Mesh(
            new THREE.PlaneGeometry(140,60),
            new THREE.MeshLambertMaterial({color:0x555555})
        );
        asphalt.rotation.x=-Math.PI/2; asphalt.position.y=0.01; scene.add(asphalt);

        // Líneas blancas
        for(let x=-60;x<=60;x+=SLOT_WIDTH){
            const l=new THREE.Mesh(new THREE.PlaneGeometry(0.5,18),wMat);
            l.rotation.x=-Math.PI/2; l.position.set(x,0.03,0); scene.add(l);
        }
        [-9,9].forEach(z=>{
            const l=new THREE.Mesh(new THREE.PlaneGeometry(140,0.5),wMat);
            l.rotation.x=-Math.PI/2; l.position.set(0,0.03,z); scene.add(l);
        });

        // Césped de plaza al fondo
        const plaza=new THREE.Mesh(
            new THREE.PlaneGeometry(160,40),
            new THREE.MeshLambertMaterial({color:0x44AA33})
        );
        plaza.rotation.x=-Math.PI/2; plaza.position.set(0,0.01,-50); scene.add(plaza);

        // Senderos de plaza (cruzados)
        const pathMat=new THREE.MeshLambertMaterial({color:0xCCAA77});
        const pathH=new THREE.Mesh(new THREE.PlaneGeometry(160,4),pathMat);
        pathH.rotation.x=-Math.PI/2; pathH.position.set(0,0.02,-50); scene.add(pathH);
        const pathV=new THREE.Mesh(new THREE.PlaneGeometry(4,40),pathMat);
        pathV.rotation.x=-Math.PI/2; pathV.position.set(0,0.02,-50); scene.add(pathV);

        // Bancos
        const benchMat=new THREE.MeshLambertMaterial({color:0x8B4513});
        [-30,-10,10,30].forEach(x=>{
            const bench=new THREE.Mesh(new THREE.BoxGeometry(4,0.8,1.5),benchMat);
            bench.position.set(x,0.4,-55); scene.add(bench);
            const leg=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.8,1.2),new THREE.MeshLambertMaterial({color:0x555555}));
            leg.position.set(x-1.5,0.4,-55); scene.add(leg);
            const leg2=leg.clone(); leg2.position.x=x+1.5; scene.add(leg2);
        });

        // Árboles tipo plaza
        const tMat=new THREE.MeshLambertMaterial({color:0x795548});
        const gMat=new THREE.MeshLambertMaterial({color:0x2E7D32});
        [-50,-35,-20,20,35,50].forEach(x=>{
            const t=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.6,6,8),tMat);
            t.position.set(x,3,-48); scene.add(t);
            const crown=new THREE.Mesh(new THREE.SphereGeometry(4,8,6),gMat);
            crown.position.set(x,9,-48); scene.add(crown);
        });

        // Fuente central en la plaza
        const fountainBase=new THREE.Mesh(new THREE.CylinderGeometry(6,7,1.5,12),new THREE.MeshLambertMaterial({color:0x999999}));
        fountainBase.position.set(0,0.75,-50); scene.add(fountainBase);
        const fountainMid=new THREE.Mesh(new THREE.CylinderGeometry(3,4,2,12),new THREE.MeshLambertMaterial({color:0xAAAAAA}));
        fountainMid.position.set(0,2.25,-50); scene.add(fountainMid);
        const water=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,0.3,12),new THREE.MeshLambertMaterial({color:0x44AAFF,transparent:true,opacity:0.7}));
        water.position.set(0,3.4,-50); scene.add(water);

        // Faroles de plaza
        [-60,-40,-20,20,40,60].forEach(x=>{
            const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,10,8),new THREE.MeshLambertMaterial({color:0x777777}));
            pole.position.set(x,5,-35); scene.add(pole);
            const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.8,8,6),new THREE.MeshLambertMaterial({color:0xFFFFCC}));
            lamp.position.set(x,10.5,-35); scene.add(lamp);
        });

    }else{
        // ══ NIVEL 3: 4 MANZANAS (Estacionamiento enorme, fondo de edificios) ══
        SLOT_CENTERS=[-72,-64,-56,-48,-40,-32,-24,-16,-8,0,8,16,24,32,40,48,56,64,72];
        SLOT_WIDTH=8; SLOT_LENGTH=18; WAIT_LINE_Z=-28;

        // Asfalto enorme
        const asphalt=new THREE.Mesh(
            new THREE.PlaneGeometry(180,80),
            new THREE.MeshLambertMaterial({color:0x444444})
        );
        asphalt.rotation.x=-Math.PI/2; asphalt.position.y=0.01; scene.add(asphalt);

        // Líneas blancas
        for(let x=-76;x<=76;x+=SLOT_WIDTH){
            const l=new THREE.Mesh(new THREE.PlaneGeometry(0.5,18),wMat);
            l.rotation.x=-Math.PI/2; l.position.set(x,0.03,0); scene.add(l);
        }
        [-9,9].forEach(z=>{
            const l=new THREE.Mesh(new THREE.PlaneGeometry(180,0.5),wMat);
            l.rotation.x=-Math.PI/2; l.position.set(0,0.03,z); scene.add(l);
        });

        // Edificios de fondo (altos, grises)
        const bColors=[0x999999,0xAAAAAA,0x888888,0xBBBBBB,0x777777,0xCCCCCC];
        for(let i=0;i<7;i++){
            const h=20+Math.random()*15;
            const w=12+Math.random()*6;
            const cx=-60+i*20;
            const col=bColors[i%bColors.length];
            const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,10),new THREE.MeshLambertMaterial({color:col}));
            b.position.set(cx,h/2,-55); scene.add(b);
            // Ventanas
            for(let fy=3;fy<h-2;fy+=4){
                [-w/4,w/4].forEach(vx=>{
                    const win=new THREE.Mesh(new THREE.BoxGeometry(2,2.5,0.3),new THREE.MeshLambertMaterial({color:0x88BBFF}));
                    win.position.set(cx+vx,fy,-50); scene.add(win);
                });
            }
        }

        // Postes de luz de estacionamiento
        [-70,-50,-30,-10,10,30,50,70].forEach(x=>{
            const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.25,12,8),new THREE.MeshLambertMaterial({color:0x555555}));
            pole.position.set(x,6,-20); scene.add(pole);
            const lamp=new THREE.Mesh(new THREE.BoxGeometry(3,0.5,1),new THREE.MeshLambertMaterial({color:0xFFFFCC}));
            lamp.position.set(x,12.2,-20); scene.add(lamp);
        });

        // Conos de tránsito
        const coneMat=new THREE.MeshLambertMaterial({color:0xFF6600});
        [-35,35].forEach(x=>{
            const cone=new THREE.Mesh(new THREE.ConeGeometry(0.6,1.5,8),coneMat);
            cone.position.set(x,0.75,15); scene.add(cone);
            const base=new THREE.Mesh(new THREE.CylinderGeometry(0.7,0.7,0.1,8),new THREE.MeshLambertMaterial({color:0x333333}));
            base.position.set(x,0.05,15); scene.add(base);
        });
    }
}

// ═══════════════════════════════════════════════════════
//  ENTIDADES
// ═══════════════════════════════════════════════════════

class Beto {
    constructor(){
        this.speed=0.12;
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
        this.lL=box(0.28,0.6,0.28,lb,-0.18,0,0);
        this.lR=box(0.28,0.6,0.28,lb,0.18,0,0);
        box(0.75,0.75,0.40,bl,0,0.8,0);
        box(0.78,0.24,0.43,ye,0,0.8,0);
        this.aL=box(0.25,0.6,0.25,bl,-0.52,0.8,0);
        this.aR=box(0.25,0.6,0.25,bl,0.52,0.8,0);
        box(0.32,0.22,0.32,sk,0,1.3,0);
        box(0.55,0.55,0.50,sk,0,1.6,0);
        box(0.11,0.11,0.06,blk,-0.14,1.65,0.26);
        box(0.11,0.11,0.06,blk,0.14,1.65,0.26);
        box(0.58,0.14,0.55,ye,0,1.9,0);
        g.scale.set(1.0,1.0,1.0); // Beto más grande
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
            v.normalize().multiplyScalar(3);
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
        this.state='entering';
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
        const darkMat=new THREE.MeshLambertMaterial({color:0x222222});
        const glassMat=new THREE.MeshLambertMaterial({color:0x88CCFF,transparent:true,opacity:0.6});
        const lightMat=new THREE.MeshLambertMaterial({color:0xFFFFAA});
        const blkMat=new THREE.MeshLambertMaterial({color:0x111111});
        const chromeMat=new THREE.MeshLambertMaterial({color:0xCCCCCC});
        const box=(w,h,d,m,x,y,z)=>{
            const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
            mesh.position.set(x,y,z); g.add(mesh);
        };

        // Chasis principal
        box(2.6,1.0,5.5,cMat,0,0.65,0);
        // Techo/cabina
        box(2.2,1.1,3.0,cMat,0,1.7,0.2);

        // Parabrisas frontal
        const frontGlass=new THREE.Mesh(new THREE.PlaneGeometry(2.0,0.8),glassMat);
        frontGlass.position.set(0,1.7,-1.35); frontGlass.rotation.x=-0.1;
        g.add(frontGlass);

        // Parabrisas trasero
        const rearGlass=new THREE.Mesh(new THREE.PlaneGeometry(2.0,0.8),glassMat);
        rearGlass.position.set(0,1.7,1.75); rearGlass.rotation.x=0.1;
        g.add(rearGlass);

        // Ventanas laterales
        [-1.12,1.12].forEach(x=>{
            const sideGlass=new THREE.Mesh(new THREE.PlaneGeometry(2.8,0.7),glassMat);
            sideGlass.position.set(x,1.7,0.2);
            sideGlass.rotation.y=x>0?Math.PI/2:-Math.PI/2;
            g.add(sideGlass);
        });

        // Líneas de puertas
        [-1.32,1.32].forEach(x=>{
            box(0.06,0.85,2.2,chromeMat,x,0.8,0.2);
        });
        // Manijas
        [-1.34,1.34].forEach(x=>{
            box(0.1,0.12,0.35,chromeMat,x,0.9,0.8);
        });

        // Ruedas
        const wG=new THREE.CylinderGeometry(0.48,0.48,0.28,12);
        [[-1.2,0.6,-2.0],[1.2,0.6,-2.0],[-1.2,0.6,2.0],[1.2,0.6,2.0]].forEach(p=>{
            const w=new THREE.Mesh(wG,darkMat); w.rotation.z=Math.PI/2; w.position.set(...p); g.add(w);
        });

        // Luces
        [-0.75,0.75].forEach(x=>box(0.4,0.3,0.1,lightMat,x,0.7,-2.8));
        [-0.75,0.75].forEach(x=>box(0.35,0.25,0.1,blkMat,x,0.7,2.8));

        // Indicador amarillo
        const iMat=new THREE.MeshLambertMaterial({color:0xFFEE00});
        this.ind=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6),iMat);
        this.ind.position.y=4.0; g.add(this.ind);

        g.scale.set(1.8,1.8,1.8);
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
        this.passengers.forEach(p=>p.leave());
    }
    spawnPassengers(){
        const count=1+Math.floor(Math.random()*2);
        for(let i=0;i<count;i++){
            const p=new Passenger();
            // Salen por el lado derecho del auto (pasajero)
            const side=Math.random()>0.5?1.5:-1.5;
            p.mesh.position.set(this.mesh.position.x+side,0,this.mesh.position.z+1);
            p.car=this;
            this.passengers.push(p);
            G.passengers.push(p);
        }
    }
    update(dt){
        if(!this.visible) return;
        if(this.state==='entering'){
            const targetZ=WAIT_LINE_Z;
            // Encontrar posición libre en la fila
            let targetX=0;
            const occupiedXs=G.cars
                .filter(c=>c!==this && c.visible && (c.state==='entering'||c.state==='waiting'))
                .map(c=>c.mesh.position.x);
            let found=false;
            for(let tryX=-30;tryX<=30;tryX+=5){
                if(!occupiedXs.some(ox=>Math.abs(ox-tryX)<4)){
                    targetX=tryX; found=true; break;
                }
            }
            if(!found) targetX=(Math.random()-0.5)*60;

            const dx=targetX-this.mesh.position.x;
            const dz=targetZ-this.mesh.position.z;
            const dist=Math.sqrt(dx*dx+dz*dz);
            if(dist>0.5){
                this.mesh.position.x+=(dx/dist)*dt*12;
                this.mesh.position.z+=(dz/dist)*dt*12;
                this.mesh.rotation.y=Math.atan2(dx,dz);
            }else{
                this.mesh.position.set(targetX,0.15,targetZ);
                this.state='waiting';
            }
        }
        if(this.state==='waiting'){
            this.ind.rotation.y+=dt*3;
            this.ind.position.y=4.0+Math.sin(Date.now()*0.004)*0.28;
            this.ind.visible=Math.floor(Date.now()/400)%2===0;
            if(this.parkPos){
                this.state='parking';
                this.ind.visible=false;
            }
            if(Date.now()-this.born>35000 && Math.random()<0.002){
                this.leave();
                loseLife('auto se fue sin pagar');
            }
        }
        if(this.state==='parking' && this.parkPos){
            const tgt=new THREE.Vector3(this.parkPos.x,0,this.parkPos.z);
            const dir=new THREE.Vector3().subVectors(tgt,this.mesh.position);
            if(dir.length()>0.5){
                dir.normalize();
                this.mesh.position.addScaledVector(dir,0.18);
                this.mesh.rotation.y=Math.atan2(dir.x,dir.z);
            }else{
                this.mesh.position.copy(tgt);
                // Al estacionar, rotar para quedar paralelo a las líneas (norte-sur)
                this.mesh.rotation.y=0;
                this.state='parked';
                this.spawnPassengers();
                G.parkedCount++;
                checkLevelComplete();
            }
        }
        if(this.state==='leaving'){
            // Salir hacia abajo (z positivo)
            this.mesh.position.z+=dt*18;
            if(this.mesh.position.z>80) this.visible=false;
        }
    }
}

class Passenger {
    constructor(){
        this.visible=true;
        this.state='waiting';
        this.payProgress=0;
        this._build();
    }
    _build(){
        const g=new THREE.Group();
        const skin=new THREE.MeshLambertMaterial({color:0xFFCCAA});
        const shirt=new THREE.MeshLambertMaterial({color:new THREE.Color().setHSL(Math.random(),0.7,0.5)});
        const pants=new THREE.MeshLambertMaterial({color:0x333344});
        const body=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.8,0.4),shirt);
        body.position.y=1.1; g.add(body);
        const head=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.5,0.5),skin);
        head.position.y=1.8; g.add(head);
        const legL=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.7,0.22),pants);
        legL.position.set(-0.17,0.35,0); g.add(legL);
        const legR=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.7,0.22),pants);
        legR.position.set(0.17,0.35,0); g.add(legR);
        g.scale.set(1.5,1.5,1.5);
        this.mesh=g;
        scene.add(g);
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
        this.state='activating';
        this.timer=0;
        this.assigned=false;
        this.carId=null;
        this._build();
    }
    _build(){
        const g=new THREE.Group();
        // Rectángulo amarillo alineado con las líneas (norte-sur)
        const m=new THREE.Mesh(
            new THREE.PlaneGeometry(SLOT_WIDTH-1,SLOT_LENGTH-1),
            new THREE.MeshLambertMaterial({color:0xFFEE00,transparent:true,opacity:0.30})
        );
        m.rotation.x=-Math.PI/2; m.position.y=0.05;
        g.add(m);
        // Borde naranja
        const edgeMat=new THREE.MeshLambertMaterial({color:0xFFAA00,transparent:true,opacity:0.5});
        const ew=SLOT_WIDTH-1, el=SLOT_LENGTH-1;
        [[0,0,el/2,ew,0.15],[0,0,-el/2,ew,0.15],[ew/2,0,0,0.15,el],[-ew/2,0,0,0.15,el]].forEach(([ex,ey,ez,ewd,eld])=>{
            const e=new THREE.Mesh(new THREE.PlaneGeometry(ewd,eld),edgeMat);
            e.rotation.x=-Math.PI/2; e.position.set(ex,ey+0.06,ez); g.add(e);
        });
        this.mesh=g;
        scene.add(g);
        g.position.set(this.x,0,this.z);
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
                const car=G.cars.find(c=>c.state==='waiting'&&!c.parkPos);
                if(car){
                    this.assigned=true;
                    this.carId=car;
                    car.park(this.x,this.z);
                }
            }
        }
    }
    release(){
        scene.remove(this.mesh);
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
        g.scale.set(1.6,1.6,1.6);
        this.mesh=g;
        if(this.targetCar){
            const tp=this.targetCar.mesh.position;
            this.mesh.position.set(tp.x+6,0,tp.z+6);
        }
        scene.add(g);
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
            this.cola.rotation.z=Math.sin(this.timer*8)*0.6;
            if(this.peeTimer>6){
                toast('¡Perro meó el auto! 🐕💦','#FF5252');
                if(this.targetCar) this.targetCar.leave();
                this.state='leaving';
                loseLife('perro meó el auto');
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
    spawnT:null, dogT:null, keys:{},
    parkedCount:0
};

const LEVELS={
    1:{spawn:2500,dogs:6000,label:'La Calle',maxDogs:3,target:20},
    2:{spawn:1800,dogs:4500,label:'La Plaza',maxDogs:5,target:40},
    3:{spawn:1200,dogs:3000,label:'4 Manzanas',maxDogs:8,target:60},
};

function toast(txt,color='#FFD700'){
    const el=document.createElement('div');
    el.textContent=txt;
    el.style.cssText=`position:fixed;top:44%;left:50%;transform:translate(-50%,-50%);
        background:rgba(0,0,0,.8);color:${color};padding:12px 28px;border-radius:10px;
        font-size:22px;font-weight:bold;pointer-events:none;z-index:300;
        transition:opacity .5s,top .5s;`;
    document.body.appendChild(el);
    setTimeout(()=>{el.style.opacity='0';el.style.top='34%';},900);
    setTimeout(()=>el.remove(),1500);
}

function loseLife(reason){
    G.lives--;
    console.log('[BETO] Pierde vida:',reason,'vidas:',G.lives);
    if(G.lives<=0){
        gameOver('¡Sin vidas! 💔');
    }
}

function checkLevelComplete(){
    const cfg=LEVELS[G.level];
    if(G.parkedCount>=cfg.target){
        G.state='LEVEL_COMPLETE';
        clearInterval(G.spawnT); clearInterval(G.dogT);
        if(G.level<3){
            toast(`¡Nivel ${G.level} completado! 🎉`,'#4CAF50');
            setTimeout(()=>{
                startGame(G.level+1);
            },2500);
        }else{
            toast('¡Ganaste el juego! 🏆','#FFD700');
            setTimeout(()=>{
                gameOver('¡Juego completado! 🏆');
            },2000);
        }
    }
}

function startGame(level){
    console.log('[BETO] startGame level',level);
    G.cars.forEach(c=>scene.remove(c.mesh));
    G.dogs.forEach(d=>scene.remove(d.mesh));
    G.spots.forEach(s=>s.release());
    G.passengers.forEach(p=>scene.remove(p.mesh));
    if(G.beto) scene.remove(G.beto.mesh);
    clearInterval(G.spawnT); clearInterval(G.dogT);

    // Limpiar escenario anterior
    clearSceneStatic();
    // Construir nuevo escenario
    buildSceneLevel(level);

    G.cars=[]; G.dogs=[]; G.spots=[]; G.passengers=[];
    G.level=level; G.money=100; G.lives=3; G.parkedCount=0; G.state='PLAYING';

    G.beto=new Beto();
    G.beto.mesh.position.set(0,0,5);

    const cfg=LEVELS[level];

    const spawnCar=()=>{
        if(G.cars.length>=G.maxCars) return;
        const car=new Car();
        car.mesh.position.set((Math.random()-0.5)*40,0.15,-55);
        G.cars.push(car);
    };

    const spawnDog=()=>{
        if(G.dogs.length>=cfg.maxDogs) return;
        const parked=G.cars.filter(c=>c.state==='parked');
        if(parked.length===0) return;
        const target=parked[Math.floor(Math.random()*parked.length)];
        if(G.dogs.some(d=>d.targetCar===target)) return;
        const dog=new Dog(target);
        G.dogs.push(dog);
    };

    for(let i=0;i<3;i++) setTimeout(spawnCar,i*500);

    G.spawnT=setInterval(()=>{ if(G.state==='PLAYING') spawnCar(); }, cfg.spawn);
    G.dogT=setInterval(()=>{ if(G.state==='PLAYING') spawnDog(); }, cfg.dogs);

    console.log('[BETO] Nivel',level,'iniciado - meta:',cfg.target);
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

    G.beto.moveTo(pt.x,pt.z);

    // Verificar si es un slot de estacionamiento
    let slotX=null;
    for(const cx of SLOT_CENTERS){
        if(Math.abs(pt.x-cx)<SLOT_WIDTH/2-0.5){ slotX=cx; break; }
    }
    if(slotX!==null && Math.abs(pt.z)<SLOT_LENGTH/2){
        // Ya hay un spot aquí?
        const existing=G.spots.find(s=>Math.abs(s.x-slotX)<1 && Math.abs(s.z-pt.z)<2);
        if(!existing){
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

        G.cars=G.cars.filter(c=>{
            if(!c.visible){
                scene.remove(c.mesh);
                if(c.parkPos){
                    const spot=G.spots.find(s=>Math.abs(s.x-c.parkPos.x)<1 && Math.abs(s.z-c.parkPos.z)<1);
                    if(spot) spot.release();
                }
                return false;
            }
            return true;
        });
        G.dogs=G.dogs.filter(d=>{ if(!d.visible){scene.remove(d.mesh);return false;} return true; });
        G.passengers=G.passengers.filter(p=>{ if(!p.visible){scene.remove(p.mesh);return false;} return true; });
        G.spots=G.spots.filter(s=>{
            if(s.assigned && s.carId && !G.cars.includes(s.carId)){
                s.release();
                return false;
            }
            return true;
        });
    }

    const $=id=>document.getElementById(id);
    if($('money-display'))  $('money-display').textContent =`$${G.money}`;
    if($('lives-display'))  $('lives-display').textContent =G.lives;
    if($('cars-display'))   $('cars-display').textContent  =`${G.parkedCount}/${LEVELS[G.level]?.target||20}`;
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

window._G = G;
