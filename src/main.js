import { Map } from './map.js';
import { EntityManager } from './entities.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Configuração de display
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.lastTime = 0;

        // Componentes do Sistema
        this.map = new Map(this);
        this.entities = new EntityManager(this);

        // Input
        this.targetPoint = null;
        this.canvas.addEventListener('click', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleInput(e.touches[0]));
    }

    resize() {
        this.width = 1024;
        this.height = 768;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    handleInput(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.targetPoint = { x, y };
        this.entities.setSquadTarget(x, y);
    }

    start() {
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timeStamp) {
        const deltaTime = (timeStamp - this.lastTime) / 1000;
        this.lastTime = timeStamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        this.map.update(deltaTime);
        this.entities.update(deltaTime);
        this.updateHUD();
    }

    updateHUD() {
        const squadCount = this.entities.squad.length;
        const statusText = document.getElementById('status-text');
        if (statusText) {
            statusText.innerHTML = `Squad Status: ${squadCount > 0 ? 'Operational' : 'Terminated'} | Units: ${squadCount}`;
            statusText.style.color = squadCount > 0 ? '#00f2ff' : '#ff3366';
        }
    }

    draw() {
        // Background com gradiente e efeito de Profundidade
        const bgGrade = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 100,
            this.width / 2, this.height / 2, this.width
        );
        bgGrade.addColorStop(0, '#0a0a1a');
        bgGrade.addColorStop(1, '#020205');
        this.ctx.fillStyle = bgGrade;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Camadas de renderização
        this.map.draw(this.ctx);
        this.entities.draw(this.ctx);

        // Draw Target Overlay
        if (this.targetPoint) {
            this.drawTargetMarker();
        }
    }

    drawTargetMarker() {
        const time = Date.now() * 0.005;
        const size = 10 + Math.sin(time) * 3;

        this.ctx.save();
        this.ctx.translate(this.targetPoint.x, this.targetPoint.y);

        this.ctx.strokeStyle = '#00f2ff';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f2ff';
        this.ctx.lineWidth = 2;

        // Círculo Pulsante
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size, 0, Math.PI * 2);
        this.ctx.stroke();

        // Crosshair
        this.ctx.beginPath();
        this.ctx.moveTo(-size - 5, 0);
        this.ctx.lineTo(-size + 2, 0);
        this.ctx.moveTo(size + 5, 0);
        this.ctx.lineTo(size - 2, 0);
        this.ctx.moveTo(0, -size - 5);
        this.ctx.lineTo(0, -size + 2);
        this.ctx.moveTo(0, size + 5);
        this.ctx.lineTo(0, size - 2);
        this.ctx.stroke();

        this.ctx.restore();
    }
}


const game = new Game();
game.start();
