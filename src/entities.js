export class EntityManager {
    constructor(game) {
        this.game = game;
        this.squad = [];
        this.enemies = [];
        this.projectiles = [];

        this.initSquad();
    }

    initSquad() {
        // Inicializa 4 tropas em formação de diamante
        const startPos = { x: 100, y: 384 };
        const offsets = [{ x: 0, y: -25 }, { x: 0, y: 25 }, { x: -30, y: 0 }, { x: 30, y: 0 }];

        offsets.forEach(off => {
            this.squad.push(new Unit(startPos.x + off.x, startPos.y + off.y, 'squad'));
        });
    }

    setSquadTarget(x, y) {
        // Formação de Diamante ao redor do ponto de destino
        const offsets = [
            { dx: 25, dy: 0 },   // Lider
            { dx: -25, dy: 0 },  // Retaguarda
            { dx: 0, dy: -25 },  // Asa Esquerda
            { dx: 0, dy: 25 }    // Asa Direita
        ];

        this.squad.forEach((unit, index) => {
            unit.setTarget(x + offsets[index].dx, y + offsets[index].dy);
        });
    }

    update(deltaTime) {
        this.squad.forEach(unit => unit.update(deltaTime, this.game.map));
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.game.map));
    }

    draw(ctx) {
        this.squad.forEach(unit => unit.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }
}

class Unit {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 12;
        this.speed = 120; // Pixels por segundo (Constante)
        this.target = null;
        this.color = type === 'squad' ? '#00f2ff' : '#ff3366';
        this.health = 100;
    }

    setTarget(x, y) {
        this.target = { x, y };
    }

    update(deltaTime, map) {
        if (!this.target) return;

        // Vetor de direção
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            const vx = (dx / distance) * this.speed * deltaTime;
            const vy = (dy / distance) * this.speed * deltaTime;

            // Tentativa de movimento com desvio (Simple Steering)
            if (!map.checkCollision(this.x + vx, this.y + vy, this.radius)) {
                this.x += vx;
                this.y += vy;
            } else {
                // Tenta deslizar pelas paredes
                if (!map.checkCollision(this.x + vx, this.y, this.radius)) {
                    this.x += vx;
                } else if (!map.checkCollision(this.x, this.y + vy, this.radius)) {
                    this.y += vy;
                }
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Detalhe de direção ou "Viseira"
        ctx.fillStyle = '#000';
        ctx.fillRect(this.radius - 8, -2, 6, 4);

        ctx.restore();
    }
}
