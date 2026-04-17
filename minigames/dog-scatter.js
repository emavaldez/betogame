// =============================================
// MINIGAME: ESPANTAR PERROS
// =============================================

class DogScatter {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.targetDog = null;
        this.timer = 0;
        this.maxTime = 4; // 4 segundos para espantar
        this.shakeIntensity = 0;
    }

    start(dog) {
        this.active = true;
        this.targetDog = dog;
        this.timer = this.maxTime;

        // Efecto de temblor en la pantalla
        this.startShake();
    }

    startShake() {
        const originalTransform = this.game.canvas.style.transform || '';
        let shakeFrames = 0;
        const maxShake = 20;

        this.shakeInterval = setInterval(() => {
            if (!this.active) {
                clearInterval(this.shakeInterval);
                return;
            }

            shakeFrames++;
            const intensity = Math.sin(shakeFrames * 0.5) * 10;
            this.game.canvas.style.transform = `translate(${intensity}px, ${intensity}px)`;

            // Reducir intensidad gradualmente
            if (shakeFrames > maxShake) {
                clearInterval(this.shakeInterval);
                this.game.canvas.style.transform = originalTransform;
            }
        }, 30);

        // Actualizar UI de tiempo
        this.updateTimerUI();
    }

    updateTimerUI() {
        // Crear o actualizar indicador de tiempo
        if (!this.timerIndicator) {
            this.timerIndicator = document.createElement('div');
            this.timerIndicator.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 15px 25px;
                border-radius: 8px;
                font-size: 14px;
            `;
            document.body.appendChild(this.timerIndicator);
        }

        this.timerUpdateInterval = setInterval(() => {
            if (!this.active) return;

            const timeLeft = Math.ceil(this.timer);
            this.timerIndicator.textContent = `Tiempo para espantar: ${timeLeft}s`;

            // Cambiar color cuando queda poco tiempo
            if (timeLeft <= 1) {
                this.timerIndicator.style.background = 'rgba(255, 0, 0, 0.7)';
            } else {
                this.timerIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
            }
        }, 100);
    }

    stop() {
        this.active = false;
        if (this.shakeInterval) clearInterval(this.shakeInterval);
        if (this.timerUpdateInterval) clearInterval(this.timerUpdateInterval);
        if (this.timerIndicator) {
            this.timerIndicator.remove();
            this.timerIndicator = null;
        }
        this.game.canvas.style.transform = '';
    }

    scatter() {
        if (!this.active || !this.targetDog) return;

        // Efecto de "empuje"
        const pushForce = 10;
        this.targetDog.mesh.position.x += (Math.random() - 0.5) * pushForce;
        this.targetDog.mesh.position.z += (Math.random() - 0.5) * pushForce;

        // Animación de huida
        this.targetDog.state = 'leaving';
        this.targetDog.visible = false; // Ocultar inmediatamente

        // Recompensa visual
        const rewardText = document.createElement('div');
        rewardText.textContent = '¡Perro espantado! +$10';
        rewardText.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            font-size: 18px;
            animation: popUp 0.5s ease-out forwards;
        `;

        document.body.appendChild(rewardText);

        setTimeout(() => {
            rewardText.style.opacity = '0';
            rewardText.style.transform = 'translate(-50%, -60%) scale(1.2)';
            setTimeout(() => rewardText.remove(), 500);
        }, 1000);

        this.stop();
    }

    update(deltaTime) {
        if (!this.active) return;

        this.timer -= deltaTime;

        // Actualizar UI
        if (this.timerIndicator) {
            const timeLeft = Math.ceil(this.timer);
            this.timerIndicator.textContent = `Tiempo para espantar: ${timeLeft}s`;
        }

        // Tiempo agotado
        if (this.timer <= 0) {
            this.stop();
            return false;
        }

        return true;
    }
}

// Exportar para usar en game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DogScatter;
}
