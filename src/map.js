export class Map {
    constructor(game) {
        this.game = game;
        this.obstacles = [];
        this.gridSize = 40;
        this.scanlinePos = 0;

        this.generateLevel();
    }

    generateLevel() {
        this.obstacles = [
            { x: 300, y: 150, w: 60, h: 250 },
            { x: 550, y: 400, w: 150, h: 60 },
            { x: 650, y: 120, w: 60, h: 120 },
            { x: 200, y: 500, w: 200, h: 40 }
        ];
    }

    update(deltaTime) {
        this.scanlinePos += deltaTime * 50;
        if (this.scanlinePos > this.game.height) this.scanlinePos = 0;
    }

    draw(ctx) {
        // Grid de Fundo Dinâmico
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= this.game.width; x += this.gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.game.height);
        }
        for (let y = 0; y <= this.game.height; y += this.gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(this.game.width, y);
        }
        ctx.stroke();

        // Scanline Efeito
        ctx.fillStyle = 'rgba(0, 242, 255, 0.02)';
        ctx.fillRect(0, this.scanlinePos, this.game.width, 2);

        // Desenha Obstáculos
        this.obstacles.forEach(obs => {
            const grad = ctx.createLinearGradient(obs.x, obs.y, obs.x + obs.w, obs.y + obs.h);
            grad.addColorStop(0, '#111');
            grad.addColorStop(1, '#1a1a1a');

            ctx.fillStyle = grad;
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

            // Borda Neon
            ctx.strokeStyle = '#00f2ff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f2ff';
            ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
            ctx.shadowBlur = 0;

            // Detalhes Internos (Pattern)
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x + 10, obs.y);
            ctx.lineTo(obs.x + 10, obs.y + obs.h);
            ctx.stroke();
        });
    }

    checkCollision(x, y, radius) {
        for (let obs of this.obstacles) {
            if (x + radius > obs.x && x - radius < obs.x + obs.w &&
                y + radius > obs.y && y - radius < obs.y + obs.h) {
                return true;
            }
        }
        return false;
    }
}

