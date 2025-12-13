export class Player {
    constructor(x, y, id, name, roomId, ws, room) {
        this.cell = 35;

        // Fix typo: insyal -> initial
        this.initialX = x * this.cell;
        this.initialY = y * this.cell;

        this.x = this.initialX;
        this.y = this.initialY;

        this.id = id;
        this.nickname = name;
        this.roomId = roomId;
        this.ws = ws;
        this.room = room;

        this.speed = 1;
        this.maxBombs = 1;
        this.activeBombs = 0;
        this.bombRange = 1;

        this.size = this.cell;
    }

    update(direction, delta) {
        const vel = this.speed * this.cell * delta;
        const cellSize = this.cell;

        let dx = 0;
        let dy = 0;

        let nextX = this.x;
        let nextY = this.y;

        switch (direction) {
            case "ArrowUp":
                dy = -1; nextY -= vel;
                break;
            case "ArrowDown":
                dy = 1; nextY += vel;
                break;
            case "ArrowLeft":
                dx = -1; nextX -= vel;
                break;
            case "ArrowRight":
                dx = 1; nextX += vel;
                break;
            default: return;
        }

        if (this.checkCollision(nextX, nextY)) {
            this.x = nextX;
            this.y = nextY;
        } else {
            const slideAmount = vel * 0.7;
            const threshold = cellSize * 0.4;

            const playerCenterX = this.x + (this.size / 2);
            const playerCenterY = this.y + (this.size / 2);

            if (dx !== 0) {
                const gridY = Math.floor(playerCenterY / cellSize);
                const idealY = (gridY * cellSize);
                const diff = idealY - this.y;

                if (Math.abs(diff) < threshold) {
                    const direction = Math.sign(diff); 
                    const newY = this.y + (direction * slideAmount);

                    if (this.checkCollision(this.x, newY)) {
                        this.y = newY;
                    }
                }
            }            else if (dy !== 0) {
                const gridX = Math.floor(playerCenterX / cellSize);
                const idealX = (gridX * cellSize);
                const diff = idealX - this.x;

                if (Math.abs(diff) < threshold) {
                    const direction = Math.sign(diff);
                    const newX = this.x + (direction * slideAmount);

                    if (this.checkCollision(newX, this.y)) {
                        this.x = newX;
                    }
                }
            }
        }
    }

    checkCollision(newX, newY) {
        const map = this.room.map.map;
        const cellSize = this.cell;
        const padding = 6; 

        const points = [
            { x: newX + padding, y: newY + padding }, // Top-Left
            { x: newX + this.size - padding, y: newY + padding }, // Top-Right
            { x: newX + padding, y: newY + this.size - padding }, // Bottom-Left
            { x: newX + this.size - padding, y: newY + this.size - padding } // Bottom-Right
        ];

        for (const point of points) {
            const gx = Math.floor(point.x / cellSize);
            const gy = Math.floor(point.y / cellSize);

            if (!map[gy] || map[gy][gx] === undefined) return false;

            let tile = map[gy][gx];

            if (tile === 1 || tile === 2) {
                return false;
            }

            if (tile >= 4 && tile <= 6) {
                let powerType = "";
                let consumed = false;

                if (tile === 4 && this.speed < 6) { 
                    this.speed += 1; 
                    powerType = "energy";
                    consumed = true;
                } else if (tile === 5 && this.maxBombs < 6) {
                    this.maxBombs++;
                    powerType = "bombNbr";
                    consumed = true;
                } else if (tile === 6 && this.bombRange < 6) {
                    this.bombRange++;
                    powerType = "bombRange";
                    consumed = true;
                }

                if (consumed) {
                    map[gy][gx] = 0;

                    this.room.broadcast({
                        type: 'powerUp',
                        playerId: this.id, 
                        power: powerType,
                        message: map, 
                        x: gx,
                        y: gy
                    });
                }
            }
        }
        return true;
    }

    tryPlaceBomb() {
        if (this.activeBombs >= this.maxBombs) {
            return null;
        }

        const centerX = this.x + (this.size / 2);
        const centerY = this.y + (this.size / 2);

        const gx = Math.floor(centerX / this.cell);
        const gy = Math.floor(centerY / this.cell);


        this.activeBombs++;
        return { x: gx, y: gy };
    }
}