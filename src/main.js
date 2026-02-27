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
        this.entities.update(deltaTime);
    }

    draw() {
        // Background com gradiente sutil
        const bgGrade = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width / 2
        );
        bgGrade.addColorStop(0, '#0a0a0a');
        bgGrade.addColorStop(1, '#050505');
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
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'rgba(0, 242, 255, 0.5)';
        this.ctx.arc(this.targetPoint.x, this.targetPoint.y, 8, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.moveTo(this.targetPoint.x - 5, this.targetPoint.y - 5);
        this.ctx.lineTo(this.targetPoint.x + 5, this.targetPoint.y + 5);
        this.ctx.moveTo(this.targetPoint.x + 5, this.targetPoint.y - 5);
        this.ctx.lineTo(this.targetPoint.x - 5, this.targetPoint.y + 5);
        this.ctx.stroke();
    }
}

const game = new Game();
game.start();
