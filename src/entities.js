export class EntityManager {
    constructor(game) {
        this.game = game;
        this.squad = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];

        this.initSquad();
        this.spawnTimer = 0;
    }

    initSquad() {
        const startPos = { x: 100, y: 384 };
        const offsets = [{ x: 0, y: -25 }, { x: 0, y: 25 }, { x: -30, y: 0 }, { x: 30, y: 0 }];

        offsets.forEach(off => {
            this.squad.push(new Unit(startPos.x + off.x, startPos.y + off.y, 'squad', this));
        });
    }

    setSquadTarget(x, y) {
        const offsets = [
            { dx: 25, dy: 0 },
            { dx: -25, dy: 0 },
            { dx: 0, dy: -25 },
            { dx: 0, dy: 25 }
        ];

        this.squad.forEach((unit, index) => {
            unit.setTarget(x + offsets[index].dx, y + offsets[index].dy);
        });
    }

    update(deltaTime) {
        // Spawn de inimigos
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > 3 && this.enemies.length < 8) {
            this.spawnEnemy();
            this.spawnTimer = 0;
        }

        // Update Squad
        this.squad = this.squad.filter(u => u.health > 0);
        this.squad.forEach(unit => unit.update(deltaTime, this.game.map, this.enemies));

        // Update Inimigos
        this.enemies = this.enemies.filter(e => e.health > 0);
        this.enemies.forEach(enemy => enemy.update(deltaTime, this.game.map, this.squad));

        // Update Projéteis
        this.projectiles = this.projectiles.filter(p => !p.dead);
        this.projectiles.forEach(p => p.update(deltaTime));

        // Update Partículas
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update(deltaTime));

        // Colisões
        this.checkProjectileCollisions();
    }

    spawnEnemy() {
        if (Math.random() > 0.7) {
            const x = Math.random() * (this.game.width - 200) + 100;
            const y = Math.random() * (this.game.height - 200) + 100;
            if (!this.game.map.checkCollision(x, y, 20)) {
                this.enemies.push(new Turret(x, y, this));
            }
        } else {
            const x = this.game.width + 50;
            const y = Math.random() * (this.game.height - 100) + 50;
            this.enemies.push(new Enemy(x, y, this));
        }
    }

    checkProjectileCollisions() {
        this.projectiles.forEach(p => {
            const targets = p.ownerType === 'squad' ? this.enemies : this.squad;
            targets.forEach(t => {
                const dx = p.x - t.x;
                const dy = p.y - t.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < t.radius + 2) {
                    t.health -= 15;
                    p.dead = true;
                    this.createExplosion(p.x, p.y, p.color);
                }
            });

            if (this.game.map.checkCollision(p.x, p.y, 2)) {
                p.dead = true;
                this.createExplosion(p.x, p.y, '#fff');
            }
        });
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
        this.projectiles.forEach(p => p.draw(ctx));
        this.squad.forEach(unit => unit.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }
}

export class Unit {
    constructor(x, y, type, manager) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.manager = manager;
        this.radius = 12;
        this.speed = 120;
        this.target = null;
        this.color = type === 'squad' ? '#00f2ff' : '#ff3366';
        this.health = 100;
        this.maxHealth = 100;

        // Combate
        this.range = 250;
        this.fireRate = 0.8;
        this.fireTimer = 0;
    }

    setTarget(x, y) {
        this.target = { x, y };
    }

    update(deltaTime, map, enemies) {
        this.fireTimer += deltaTime;

        if (this.fireTimer >= this.fireRate) {
            const nearest = this.findNearestEnemy(enemies);
            if (nearest && nearest.dist < this.range) {
                this.fire(nearest.enemy);
                this.fireTimer = 0;
            }
        }

        if (!this.target) return;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            const vx = (dx / distance) * this.speed * deltaTime;
            const vy = (dy / distance) * this.speed * deltaTime;

            if (!map.checkCollision(this.x + vx, this.y + vy, this.radius)) {
                this.x += vx;
                this.y += vy;
            } else {
                if (!map.checkCollision(this.x + vx, this.y, this.radius)) {
                    this.x += vx;
                } else if (!map.checkCollision(this.x, this.y + vy, this.radius)) {
                    this.y += vy;
                }
            }
        }
    }

    findNearestEnemy(enemies) {
        let nearest = null;
        let minDist = Infinity;
        enemies.forEach(e => {
            const dx = e.x - this.x;
            const dy = e.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                nearest = { enemy: e, dist };
            }
        });
        return nearest;
    }

    fire(target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const angle = Math.atan2(dy, dx);
        this.manager.projectiles.push(new Projectile(this.x, this.y, angle, this.type, this.color));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Barra de vida
        ctx.fillStyle = '#111';
        ctx.fillRect(-this.radius, -this.radius - 12, this.radius * 2, 4);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.radius, -this.radius - 12, (this.radius * 2) * (this.health / this.maxHealth), 4);

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.fillRect(this.radius - 8, -2, 6, 4);

        ctx.restore();
    }
}

class Enemy extends Unit {
    constructor(x, y, manager) {
        super(x, y, 'enemy', manager);
        this.speed = 60;
        this.health = 40;
        this.maxHealth = 40;
    }

    update(deltaTime, map, squad) {
        const nearest = this.findNearestEnemy(squad);
        if (nearest) {
            this.setTarget(nearest.enemy.x, nearest.enemy.y);
        }
        super.update(deltaTime, map, squad);
    }
}

class Turret extends Unit {
    constructor(x, y, manager) {
        super(x, y, 'enemy', manager);
        this.color = '#ff9900';
        this.health = 120;
        this.maxHealth = 120;
        this.range = 350;
        this.fireRate = 1.6;
        this.radius = 18;
    }

    update(deltaTime, map, squad) {
        this.fireTimer += deltaTime;
        if (this.fireTimer >= this.fireRate) {
            const nearest = this.findNearestEnemy(squad);
            if (nearest && nearest.dist < this.range) {
                this.fire(nearest.enemy);
                this.fireTimer = 0;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Barra de vida
        ctx.fillStyle = '#111';
        ctx.fillRect(-this.radius, -this.radius - 15, this.radius * 2, 5);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.radius, -this.radius - 15, (this.radius * 2) * (this.health / this.maxHealth), 5);

        ctx.fillStyle = '#222';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class Projectile {
    constructor(x, y, angle, ownerType, color) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 450;
        this.ownerType = ownerType;
        this.color = color;
        this.dead = false;
        this.life = 2.0;
    }

    update(deltaTime) {
        this.x += Math.cos(this.angle) * this.speed * deltaTime;
        this.y += Math.sin(this.angle) * this.speed * deltaTime;
        this.life -= deltaTime;
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * 12, this.y - Math.sin(this.angle) * 12);
        ctx.stroke();
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 120 + 60;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.size = Math.random() * 4 + 1;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= deltaTime * 2.5;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}
