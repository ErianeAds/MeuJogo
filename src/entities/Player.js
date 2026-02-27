export class Player {
    constructor(game) {
        this.game = game;
        this.width = 40;
        this.height = 40;
        this.x = 40;
        this.y = 520; // Perto do chão inicial
        this.speed = 4;
        this.color = '#00ffcc';

        // Estado de movimento
        this.velX = 0;
        this.velY = 0;

        // Física básica
        this.gravity = 0.5;
        this.jumpForce = -10;
        this.isGrounded = false;
    }

    update() {
        // Reset da velocidade X (Sem aceleração gradual)
        this.velX = 0;

        // Movimentação Digital (X e Y apenas, sem diagonal fluida conforme GDD)
        if (this.game.keys['ArrowLeft'] || this.game.keys['KeyA']) {
            this.velX = -this.speed;
        } else if (this.game.keys['ArrowRight'] || this.game.keys['KeyD']) {
            this.velX = this.speed;
        }

        // Pulo
        if ((this.game.keys['ArrowUp'] || this.game.keys['Space'] || this.game.keys['KeyW']) && this.isGrounded) {
            this.velY = this.jumpForce;
            this.isGrounded = false;
        }

        // Aplica Gravidade
        this.velY += this.gravity;

        // Atualização de Posição e Colisão será tratada pelo Game Engine para garantir AABB strict
        this.applyPhysics();
    }

    applyPhysics() {
        // Movimento Horizontal
        this.x += this.velX;
        this.checkWallCollisions('horizontal');

        // Movimento Vertical
        this.y += this.velY;
        this.checkWallCollisions('vertical');
    }

    checkWallCollisions(direction) {
        const left = Math.floor(this.x / this.game.tileSize);
        const right = Math.floor((this.x + this.width - 1) / this.game.tileSize);
        const top = Math.floor(this.y / this.game.tileSize);
        const bottom = Math.floor((this.y + this.height - 1) / this.game.tileSize);

        // Verifica colisão com tiles do level
        for (let row = top; row <= bottom; row++) {
            for (let col = left; col <= right; col++) {
                if (this.game.level[row] && this.game.level[row][col] !== 0) {
                    const tile = this.game.level[row][col];

                    if (tile === 2) { // LAVA: Reset Imediato
                        this.reset();
                        return;
                    }

                    if (tile === 1) { // Sólido
                        if (direction === 'horizontal') {
                            if (this.velX > 0) { // Indo para direita
                                this.x = col * this.game.tileSize - this.width;
                            } else if (this.velX < 0) { // Indo para esquerda
                                this.x = (col + 1) * this.game.tileSize;
                            }
                        } else if (direction === 'vertical') {
                            if (this.velY > 0) { // Caindo
                                this.y = row * this.game.tileSize - this.height;
                                this.velY = 0;
                                this.isGrounded = true;
                            } else if (this.velY < 0) { // Subindo
                                this.y = (row + 1) * this.game.tileSize;
                                this.velY = 0;
                            }
                        }
                    }
                }
            }
        }

        // Constraints de borda do canvas (Backup)
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
    }

    reset() {
        this.game.deathCount++;
        this.x = 40;
        this.y = 480;
        this.velX = 0;
        this.velY = 0;
        this.isGrounded = false;
    }

    draw(ctx) {
        // Renderiza o player com um visual de brilho neon
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;

        // Corpo principal
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Detalhe "Cyber" (Olhos/Viseira)
        ctx.fillStyle = '#0d0221';
        ctx.fillRect(this.x + 25, this.y + 10, 10, 5);

        ctx.shadowBlur = 0; // Reset para outros desenhos
    }
}
