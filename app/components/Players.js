import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { variables } from "../../variables.js";
export class Players {
    constructor(playerList) {
        this.players = playerList;
        this.list = this.createPlayers();
    }
    createPlayers() {
        return this.players?.map((element, i) => {
            const name = element.nickname;

            let positions = [
                [1, 1],
                [15, 1],
                [1, 15],
                [15, 15]
            ];

            let [x, y] = positions[i] || [1, 1];
            return new Player(i, x, y, name, element.id);
        });
    }
}




class Player {
    constructor(i, x, y, name, id) {
        this.name = name;
        this.id = id;

        this.gameH = variables.GRID_CELL_SIZE_h * 17;
        this.gameWidth = this.gameH;

        // spr
        this.img = `/tools/player${i + 1}.png`;

        // powerup
        this.lives = 3;
        this.power = 2;
        this.speed = 1;
        this.bombs = 1;
        // speed is responsive based on grid cell size: a fraction of the cell height
        this.alive = this.lives > 0 ? true : false;
        // move
        this.inagif = 'down';
        this.frameIndex = 0;
        this.frameCount = 0;
        this.event;

        // frame
        this.spriteLoaded = false;
        this.frameW_original = 0;
        this.frameH_original = 0;


        // w and h
        this.renderW = variables.GRID_CELL_SIZE_h;
        this.renderH = variables.GRID_CELL_SIZE_h;

        // offset
        this.xOffset = 0;
        this.yOffset = 0;

        // x and y
        this.insX = variables.GRID_CELL_SIZE_h * x;
        this.insY = variables.GRID_CELL_SIZE_h * y;
        this.x = this.insX;
        this.y = this.insY;
        this.gridX = Math.round(this.x / variables.GRID_CELL_SIZE_w);
        this.gridY = Math.round(this.y / variables.GRID_CELL_SIZE_h);
        this.loadSprite();
    }

    loadSprite() {
        const img = new Image();
        img.src = this.img;

        img.onload = () => {
            this.frameW_original = img.width / 3;
            this.frameH_original = img.height / 4;
            this.spriteLoaded = true;
        };
    }

    Spritesheet() {
        if (!this.element || !this.spriteLoaded) return;

        const dirMap = { down: 0, left: 1, right: 2, up: 3 };
        const dirRow = dirMap[this.inagif] ?? 0;

        this.frameCount++;
        if (this.frameCount > 6) {
            this.frameIndex = (this.frameIndex + 1) % 3;
            this.frameCount = 0;
        }

        this.xOffset = -(this.frameIndex * this.renderW);
        this.yOffset = -(dirRow * this.renderH);
    }
    toGrid(px) {
        return Math.round(px / variables.GRID_CELL_SIZE_h);
    }
    hndelcollision(gridY, gridX) {
        const cell = variables.GRID_CELL_SIZE_h;

        if (this.event === "ArrowLeft") {
            this.x = (gridX + 1) * cell;
        } else if (this.event === "ArrowRight") {
            this.x = (gridX * cell) - this.renderW;

        } else if (this.event === "ArrowUp") {
            this.y = (gridY + 1) * cell;
        } else if (this.event === "ArrowDown") {
            this.y = (gridY * cell) - this.renderH;
        }
    }

    canMove(newX, newY) {
        const cell = variables.GRID_CELL_SIZE_h;

        const pad = 6;

        const W = this.renderW - (pad * 2);
        const H = this.renderH - (pad * 2);

        const points = [
            [newX + pad, newY + pad],             // Top-Left
            [newX + pad + W, newY + pad],         // Top-Right
            [newX + pad, newY + pad + H],         // Bottom-Left
            [newX + pad + W, newY + pad + H]      // Bottom-Right
        ];

        const map = freamwork.state.map;
        const rows = map.length;
        const cols = map[0].length;

        for (let [px, py] of points) {
            const gx = Math.floor(px / cell);
            const gy = Math.floor(py / cell);

            if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) return false;

            const tile = map[gy][gx];
            if (tile === 1 || tile === 2) return false;
        }

        return true;
    }

    update(delta = 0) {
        const cellSize = variables.GRID_CELL_SIZE_h;
        const vel = this.speed * (cellSize / 3) * delta;

        let dx = 0;
        let dy = 0;

        if (this.event === "ArrowLeft") {
            dx = -vel;
            this.inagif = 'left';
        } else if (this.event === "ArrowRight") {
            dx = vel;
            this.inagif = 'right';
        } else if (this.event === "ArrowUp") {
            dy = -vel;
            this.inagif = 'up';
        } else if (this.event === "ArrowDown") {
            dy = vel;
            this.inagif = 'down';
        } else {
            return;
        }

        const nextX = this.x + dx;
        const nextY = this.y + dy;

        if (this.canMove(nextX, nextY)) {
            this.x = nextX;
            this.y = nextY;
        }else {
            const slideSpeed = (this.speed * (cellSize / 3) * delta) * 1.5;

            const threshold = cellSize / 2;

            const playerCenterX = this.x + (this.renderW / 2);
            const playerCenterY = this.y + (this.renderH / 2);

            if (dx !== 0) {
                const gridY = Math.floor(playerCenterY / cellSize);
                const idealY = (gridY * cellSize) + (cellSize - this.renderH) / 2;

                const diff = idealY - this.y;

                if (Math.abs(diff) < threshold) {
                    const sign = Math.sign(diff);

                    let moveAmount = sign * slideSpeed;
                    if (Math.abs(moveAmount) > Math.abs(diff)) {
                        moveAmount = diff; // Snap to center if close enough
                    }

                    if (moveAmount !== 0 && this.canMove(this.x, this.y + moveAmount)) {
                        this.y += moveAmount;
                    }
                }
            } else if (dy !== 0) {
                const gridX = Math.floor(playerCenterX / cellSize);
                const idealX = (gridX * cellSize) + (cellSize - this.renderW) / 2;

                const diff = idealX - this.x;

                if (Math.abs(diff) < threshold) {
                    const sign = Math.sign(diff);

                    let moveAmount = sign * slideSpeed;
                    if (Math.abs(moveAmount) > Math.abs(diff)) {
                        moveAmount = diff;
                    }

                    if (moveAmount !== 0 && this.canMove(this.x + moveAmount, this.y)) {
                        this.x += moveAmount;
                    }
                }
            }
        }

        const centerX = this.x + (this.renderW / 2);
        const centerY = this.y + (this.renderH / 2);
        const gridX = Math.floor(centerX / cellSize);
        const gridY = Math.floor(centerY / cellSize);

        if (freamwork.state.map[gridY] && freamwork.state.map[gridY][gridX]) {
            const currentTile = freamwork.state.map[gridY][gridX];
            if (currentTile === 4) { // Energy
                freamwork.state.ws.send(JSON.stringify({
                    type: 'powerUp',
                    message: { x: gridX, y: gridY, power: "energy" },
                    playerId: this.id
                }));
            } else if (currentTile === 5) { // BombNbr
                freamwork.state.ws.send(JSON.stringify({
                    type: 'powerUp',
                    message: { x: gridX, y: gridY, power: "bombNbr" },
                    playerId: this.id
                }));
            } else if (currentTile === 6) { // BombRange
                freamwork.state.ws.send(JSON.stringify({
                    type: 'powerUp',
                    message: { x: gridX, y: gridY, power: "bombRange" },
                    playerId: this.id
                }));
            }
        }

        this.Spritesheet();

        try {
            freamwork.setState(prev => ({ ...prev }));
        } catch { router(); }
    }


    draw() {
        this.gridX = Math.round(this.x / variables.GRID_CELL_SIZE_w);
        this.gridY = Math.round(this.y / variables.GRID_CELL_SIZE_h);

        const el = createElement({
            tag: "div",
            events: {
                keydown: (e) => {
                    if (freamwork.state?.ws && this.id == freamwork.state.myId) {

                        const key = e.key;
                        // BOOM (space) stays the same
                        if (key === " " && this.lives > 0 && this.bombs > 0) {
                            this.bombs--
                            setTimeout(() => {
                                this.bombs++
                            }, 4000)
                            freamwork.state.ws.send(JSON.stringify({
                                type: "boomb",
                                message: {
                                    key: key,
                                    x: this.gridX,
                                    y: this.gridY,
                                    range: this.power,
                                    id: this.id
                                },
                                playerId: this.id + this.bombs
                            }));
                            return;
                        }

                        // movement keys: only send if the player can move to the intended position
                        if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") {
                            const proposedX = key === "ArrowLeft" ? this.x - this.speed
                                : key === "ArrowRight" ? this.x + this.speed
                                    : this.x;
                            const proposedY = key === "ArrowUp" ? this.y - this.speed
                                : key === "ArrowDown" ? this.y + this.speed
                                    : this.y;

                            freamwork.state.ws.send(JSON.stringify({
                                type: "playermove",
                                message: {
                                    key: key,
                                    range: this.power
                                },
                                playerId: freamwork.state.myId
                            }));


                        }
                    }
                },
                keyup: (e) => {
                    const key = e.key

                    if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") {
                        freamwork.state.ws.send(JSON.stringify({
                            type: "playerstop",
                            message: {
                                key: key,
                                range: this.power
                            },
                            playerId: freamwork.state.myId
                        }));
                    }
                }
            },
            attrs: {
                class: "p",
                style: `
                    position: absolute;
                    left: ${this.x}px;
                    top: ${this.y}px;
                    width: ${this.renderW}px;
                    height: ${this.renderH}px;
                    background-image: url('${this.img}');
                    background-repeat: no-repeat;
                    background-position: ${this.xOffset}px ${this.yOffset}px;
                    background-size: ${this.renderW * 4}px ${this.renderH * 4}px;
                    image-rendering: pixelated;
                    z-index: 10;
                `
            }
        });

        this.element = el;
        return el;
    }
}
