export class Player {
    constructor(x, y, id, name, roomId, ws, room) {
        this.cell = 35;
        this.insyalX = x * this.cell;
        this.insyalY = y * this.cell;
        this.x = this.insyalX;
        this.y = this.insyalY;
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

        let nextX = this.x;
        let nextY = this.y;

        switch (direction) {
            case "ArrowUp": nextY -= vel; break;
            case "ArrowDown": nextY += vel; break;
            case "ArrowLeft": nextX -= vel; break;
            case "ArrowRight": nextX += vel; break;
            default: return;
        }

        // Check collision with the new coordinates
        if (this.checkCollision(nextX, nextY)) {
            this.x = nextX;
            this.y = nextY;
        }
    }

    checkCollision(newX, newY) {
        const map = this.room.map.map;
        const cellSize = this.cell;
        const padding = 4;

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

            if (tile === 4 && this.speed <= 5) { // Energy
                this.speed++
                map[gy][gx] = 0
            } else if (tile === 5 && this.maxBombs <= 5) { // BombNbr
                this.maxBombs++
                map[gy][gx] = 0

            } else if (tile === 6 && this.bombRange <= 5) { // BombRange
                this.bombRange++
                map[gy][gx] = 0

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