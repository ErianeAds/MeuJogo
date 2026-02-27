import { Player } from '../entities/Player.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Configurações dimensionais
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.lastTime = 0;
        this.gameState = 'running';

        // Inicializa entrada do teclado
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // Estado do Jogo
        this.deathCount = 0;
        this.player = new Player(this);

        // Definição do Nível (0: Vazio, 1: Chão, 2: Lava)
        this.tileSize = 40;
        this.level = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }

    start() {
        requestAnimationFrame(this.loop.bind(this));
    }

    loop(timeStamp) {
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.loop.bind(this));
    }

    update(deltaTime) {
        if (this.gameState !== 'running') return;
        this.player.update();
    }

    draw() {
        // Limpa o canvas com uma cor de fundo premium
        this.ctx.fillStyle = '#0d0221';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid de fundo para auxiliar no visual "Cyber"
        this.drawGrid();

        // Desenha Nível
        this.drawLevel();

        // Renderização de entidades
        this.player.draw(this.ctx);

        // HUD
        this.drawHUD();
    }

    drawHUD() {
        this.ctx.fillStyle = '#00ffcc';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#00ffcc';
        this.ctx.fillText(`DEATHS: ${this.deathCount}`, 20, 30);
        this.ctx.fillText(`POS: ${Math.floor(this.player.x / 40)},${Math.floor(this.player.y / 40)}`, 20, 50);
        this.ctx.shadowBlur = 0;
    }

    drawGrid() {
        this.ctx.strokeStyle = '#1d0a42';
        this.ctx.lineWidth = 1;
        const gridSize = 40;

        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    drawLevel() {
        for (let row = 0; row < this.level.length; row++) {
            for (let col = 0; col < this.level[row].length; col++) {
                const tile = this.level[row][col];
                if (tile === 0) continue;

                const x = col * this.tileSize;
                const y = row * this.tileSize;

                if (tile === 1) {
                    this.ctx.fillStyle = '#341671'; // Bloco sólido
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    this.ctx.strokeStyle = '#623aa2';
                    this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
                } else if (tile === 2) {
                    this.ctx.fillStyle = '#ff0055'; // Lava
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = '#ff0055';
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }
}
