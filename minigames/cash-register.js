// =============================================
// MINIGAME: CAJA REGISTRADORA (COBRO)
// =============================================

class CashRegister {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.targetPassenger = null;
        this.timer = 0;
        this.maxTime = 5; // 5 segundos para cobrar
        this.barPosition = 0.5; // Posición inicial de la barra (0 a 1)
        this.barDirection = 1; // Dirección de movimiento de la barra
        this.barSpeed = 0.8; // Velocidad de la barra
        this.score = 0;
    }

    start(passenger) {
        this.active = true;
        this.targetPassenger = passenger;
        this.timer = this.maxTime;
        this.barPosition = 0.5;
        this.barDirection = 1;
        this.score = 0;

        // Crear UI de cobro
        this.createUI();
    }

    createUI() {
        // Contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'cash-ui';
        this.container.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            color: white;
            min-width: 250px;
        `;

        // Título
        const title = document.createElement('h3');
        title.textContent = 'COBRAR PASAJERO';
        title.style.marginBottom = '10px';
        this.container.appendChild(title);

        // Barra de cobro
        const barContainer = document.createElement('div');
        barContainer.style.cssText = `
            width: 200px;
            height: 20px;
            background: #333;
            border-radius: 10px;
            overflow: hidden;
            margin: 15px auto;
        `;

        this.bar = document.createElement('div');
        this.bar.id = 'cash-bar';
        this.bar.style.cssText = `
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #FFC107);
            border-radius: 10px;
            transition: width 0.1s ease-out;
        `;
        barContainer.appendChild(this.bar);
        this.container.appendChild(barContainer);

        // Botón de cobro
        const button = document.createElement('button');
        button.textContent = 'COBRAR ($25)';
        button.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 18px;
            border-radius: 8px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        `;
        button.onmouseenter = () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
        };
        button.onmouseleave = () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        };
        button.onclick = () => this.attemptCash();
        this.container.appendChild(button);

        // Instrucciones
        const instructions = document.createElement('p');
        instructions.textContent = '¡Mantén el botón presionado cuando la barra esté en el área verde!';
        instructions.style.fontSize = '12px';
        instructions.style.color = '#aaa';
        this.container.appendChild(instructions);

        // Contador de puntos
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.textContent = `Puntos: 0`;
        this.scoreDisplay.style.cssText = `
            margin-top: 15px;
            font-size: 24px;
            color: #FFD700;
        `;
        this.container.appendChild(this.scoreDisplay);

        document.body.appendChild(this.container);

        // Iniciar animación de la barra
        this.animateBar();
    }

    animateBar() {
        if (!this.active) return;

        const barWidth = 200; // Ancho del contenedor
        const greenZoneStart = 0.6 * barWidth; // 60% es el inicio de la zona verde

        // Mover barra
        this.barPosition += this.barDirection * this.barSpeed * (1/60);

        if (this.barPosition >= 1) {
            this.barPosition = 1;
            this.barDirection = -1;
        } else if (this.barPosition <= 0) {
            this.barPosition = 0;
            this.barDirection = 1;
        }

        // Actualizar UI
        this.bar.style.width = (this.barPosition * barWidth) + 'px';

        // Verificar si está en zona verde
        const inGreenZone = this.barPosition >= 0.6;

        if (inGreenZone) {
            this.bar.style.background = '#4CAF50'; // Verde
            this.greenTime = (this.greenTime || 0) + (1/60);
        } else {
            this.bar.style.background = '#f44336'; // Rojo
            this.greenTime = 0;
        }

        // Comprobar si está listo para cobrar
        if (inGreenZone && this.greenTime > 0.5) {
            this.readyToCash = true;
            document.querySelector('#cash-ui button').style.background =
                'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)';
        } else {
            this.readyToCash = false;
            document.querySelector('#cash-ui button').style.background =
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }

        requestAnimationFrame(() => this.animateBar());
    }

    attemptCash() {
        if (!this.active) return;

        if (this.readyToCash && this.greenTime > 0.5) {
            // Cobro exitoso
            const amount = 25 + Math.floor(Math.random() * 25); // $25-$50
            this.score += amount;
            this.updateScore();

            // Efecto de éxito
            this.showFloatingText(`+$${amount}`, 0, -50);

            // Terminar minijuego
            this.stop();
            this.targetPassenger.state = 'leaving';

            return true;
        } else {
            // Cobro fallido
            this.showFloatingText('¡Muy temprano!', 0, -50);
            return false;
        }
    }

    showFloatingText(text, x, y) {
        const floatText = document.createElement('div');
        floatText.textContent = text;
        floatText.style.cssText = `
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translate(-50%, -50%);
            color: #FFD700;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            animation: floatUp 1s ease-out forwards;
        `;

        document.body.appendChild(floatText);

        setTimeout(() => {
            floatText.style.top = '30%';
            floatText.style.opacity = '0';
        }, 50);

        setTimeout(() => {
            floatText.remove();
        }, 1000);
    }

    updateScore() {
        this.scoreDisplay.textContent = `Puntos: ${this.score}`;
    }

    stop() {
        this.active = false;
        if (this.container) {
            this.container.style.display = 'none';
        }
        document.body.removeChild(this.container);
    }

    update(deltaTime) {
        if (!this.active) return;

        // Actualizar timer
        this.timer -= deltaTime;

        if (this.timer <= 0) {
            this.stop();
            this.targetPassenger.leave();
            return false;
        }

        return true;
    }
}

// Exportar para usar en game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CashRegister;
}
