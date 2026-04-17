// =============================================
// MINIGAME: GUIA DE ESTACIONAMIENTO
// =============================================

class ParkingGuide {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.targetCar = null;
        this.markedPosition = null;
        this.timer = 0;
        this.maxTime = 3; // 3 segundos para marcar
        this.visualMarker = null;
    }

    start(car) {
        this.active = true;
        this.targetCar = car;
        this.timer = this.maxTime;
        this.markedPosition = null;

        // Crear marcador visual en el auto
        const markerGeo = new THREE.BoxGeometry(2, 0.1, 3);
        const markerMat = new THREE.MeshStandardMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.6
        });
        this.visualMarker = new THREE.Mesh(markerGeo, markerMat);
        this.visualMarker.position.set(0, 1.5, 0);
        car.mesh.add(this.visualMarker);

        // Texto flotante "MARCAR LUGAR"
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 256;
        textCanvas.height = 64;
        const ctx = textCanvas.getContext('2d');

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 256, 64);
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.fillText('CLICK PARA MARCAR', 128, 32);

        const texture = new THREE.CanvasTexture(textCanvas);
        const textGeo = new THREE.PlaneGeometry(1.5, 0.4);
        const textMat = new THREE.MeshBasicMaterial({ map: texture });
        this.markText = new THREE.Mesh(textGeo, textMat);
        this.markText.position.set(0, 2.5, 0);
        this.markText.rotation.x = -Math.PI / 2;
        car.mesh.add(this.markText);

        // Texto de tiempo
        const timeCanvas = document.createElement('canvas');
        timeCanvas.width = 128;
        timeCanvas.height = 64;
        const timeCtx = timeCanvas.getContext('2d');

        timeCtx.fillStyle = '#F00';
        timeCtx.fillRect(0, 0, 128, 64);
        timeCtx.font = 'bold 36px Arial';
        timeCtx.textAlign = 'center';
        timeCtx.textBaseline = 'middle';
        timeCtx.fillStyle = '#FFF';
        timeCtx.fillText('3', 64, 32);

        const timeTexture = new THREE.CanvasTexture(timeCanvas);
        const timeGeo = new THREE.PlaneGeometry(0.8, 0.4);
        const timeMat = new THREE.MeshBasicMaterial({ map: timeTexture });
        this.timeText = new THREE.Mesh(timeGeo, timeMat);
        this.timeText.position.set(0, 3.0, 0);
        this.timeText.rotation.x = -Math.PI / 2;
        car.mesh.add(this.timeText);

        // Evento de click
        this.game.canvas.addEventListener('click', this.onCanvasClick.bind(this));
    }

    stop() {
        this.active = false;
        if (this.targetCar && this.visualMarker) {
            this.targetCar.mesh.remove(this.visualMarker);
            this.targetCar.mesh.remove(this.markText);
            this.targetCar.mesh.remove(this.timeText);
        }
        this.game.canvas.removeEventListener('click', this.onCanvasClick.bind(this));
    }

    onCanvasClick(e) {
        if (!this.active || !this.targetCar) return;

        const rect = this.game.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.game.camera);

        const intersects = raycaster.intersectObjects(
            [this.targetCar.mesh],
            true
        );

        if (intersects.length > 0) {
            // Posición relativa al auto
            const hitPoint = intersects[0].point;
            const localPos = this.targetCar.mesh.worldToLocal(hitPoint);

            // Guardar posición marcada
            this.markedPosition = {
                x: localPos.x,
                z: localPos.z
            };

            // Desactivar temporalmente para permitir al auto estacionar
            this.stop();

            // Iniciar animación de estacionamiento
            this.targetCar.state = 'parking';
            this.targetCar.parkStartTime = Date.now();
            this.targetCar.parkPosition = {
                x: this.markedPosition.x + this.targetCar.mesh.position.x,
                z: this.markedPosition.z + this.targetCar.mesh.position.z
            };
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        // Actualizar timer
        this.timer -= deltaTime;
        const timeLeft = Math.max(0, Math.ceil(this.timer));

        // Actualizar canvas del tiempo
        if (this.timeText && this.timeText.material.map) {
            const ctx = this.timeText.material.map.image.getContext('2d');
            ctx.fillStyle = '#F00';
            ctx.fillRect(0, 0, 128, 64);
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#FFF';
            ctx.fillText(timeLeft.toString(), 64, 32);
            this.timeText.material.map.needsUpdate = true;
        }

        // Animar marcador
        if (this.visualMarker) {
            this.visualMarker.scale.setScalar(1 + Math.sin(Date.now() / 200) * 0.1);
            this.visualMarker.rotation.y += deltaTime * 2;
        }

        // Tiempo agotado
        if (this.timer <= 0) {
            this.stop();
            this.targetCar.leave();
            return false;
        }

        return true;
    }
}

// Exportar para usar en game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParkingGuide;
}
