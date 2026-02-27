export class Map {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.gridSize = 40;

        // Gera alguns obstáculos iniciais
        this.generateLevel();
    }

    generateLevel() {
        // Exemplo de obstáculos: {x, y, w, h}
        this.obstacles = [
            { x: 300, y: 200, w: 40, h: 200 },
            { x: 500, y: 400, w: 120, h: 40 },
            { x: 600, y: 100, w: 40, h: 100 }
        ];
    }

    draw(ctx) {
        ctx.fillStyle = '#1a1a1a';
        ctx.strokeStyle = '#222';

        // Desenha Grid de Fundo de Baixa Opacidade
        ctx.beginPath();
        for (let x = 0; x < this.game.width; x += this.gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.game.height);
        }
        for (let y = 0; y < this.game.height; y += this.gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.game.width, y);
        }
        ctx.stroke();

        // Desenha Obstáculos
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#00f2ff';
        this.obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#00f2ff';
            ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
            ctx.shadowBlur = 0;
        });
    }

    checkCollision(x, y, radius) {
        for (let obs of this.obstacles) {
            // AABB vs Circle Simplificado
            if (x + radius > obs.x && x - radius < obs.x + obs.w &&
                y + radius > obs.y && y - radius < obs.y + obs.h) {
                return true;
            }
        }
        return false;
    }
}
