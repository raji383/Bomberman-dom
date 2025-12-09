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
                [100, 1],
                [1, 100],
                [100, 100]
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
        this.power = 1;
        this.speedpx = 1;
        // speed is responsive based on grid cell size: a fraction of the cell height
        this.speed = Math.max(1, Math.round(variables.GRID_CELL_SIZE_h * (this.speedpx / 10)));
        this.alive = this.live > 0 ? true : false;
        this.bomb = true;
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
        this.renderW = variables.GRID_CELL_SIZE_h - 3;
        this.renderH = variables.GRID_CELL_SIZE_h - 3;

        // offset
        this.xOffset = 0;
        this.yOffset = 0;

        // x and y
        this.insX = x == 100
            ? this.gameWidth - this.renderW - variables.GRID_CELL_SIZE_h
            : this.gameWidth * (x / 100) + variables.GRID_CELL_SIZE_h;;
        this.insY = y == 100
            ? this.gameH - this.renderH - variables.GRID_CELL_SIZE_h
            : this.gameH * (y / 100) + variables.GRID_CELL_SIZE_h;;
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
        // responsive inset so the player's visible sprite can overlap slightly without false collisions
        const inset = Math.max(1, Math.round(variables.GRID_CELL_SIZE_h * 0.06));
        const W = Math.max(1, this.renderW - inset * 2);
        const H = Math.max(1, this.renderH - inset * 2);

        const points = [
            [newX + inset, newY + inset],                 // Top-left
            [newX + inset + W - 1, newY + inset],         // Top-right
            [newX + inset, newY + inset + H - 1],         // Bottom-left
            [newX + inset + W - 1, newY + inset + H - 1]  // Bottom-right
        ];

        const map = freamwork.state?.map;
        if (!map || !map.length) return false;
        const maxY = map.length;
        const maxX = map[0].length;

        for (let [px, py] of points) {
            const gridX = Math.floor(px / variables.GRID_CELL_SIZE_w);
            const gridY = Math.floor(py / variables.GRID_CELL_SIZE_h);

            // out of bounds -> cannot move
            if (gridX < 0 || gridY < 0 || gridY >= maxY || gridX >= maxX) {
                return false;
            }

            const cell = map[gridY][gridX];
            // treat 1 (wall) and 2 (box) as blocking tiles
            if (cell === 1 || cell === 2) {
                return false;
            }
        }

        return true;
    }



    update(e = { key: "" }) {
        this.event = e.key
        if (e.key === "ArrowLeft") {
            this.x -= this.speed;
            this.inagif = 'left';

        } else if (e.key === "ArrowRight") {
            this.x += this.speed;
            this.inagif = 'right';

        } else if (e.key === "ArrowUp") {
            this.y -= this.speed;
            this.inagif = 'up';

        } else if (e.key === "ArrowDown") {
            this.y += this.speed;
            this.inagif = 'down';
        }

        this.Spritesheet();
        // trigger a global re-render via framework state so all player components update responsively
        try {
            freamwork.setState(prev => ({ ...prev }));
        } catch (err) {
            // fallback to router if setState isn't available for some reason
            if (typeof router === 'function') router();
        }
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
                        if (key === " " && this.live > 0 && this.bomb) {
                            freamwork.state.ws.send(JSON.stringify({
                                type: "boomb",
                                message: {
                                    key,
                                    x: this.gridX,
                                    y: this.gridY,
                                    range: this.power
                                },
                                playerId: freamwork.state.myId
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

                            if (this.canMove(proposedX, proposedY)) {
                                const gx = Math.round(proposedX / variables.GRID_CELL_SIZE_w);
                                const gy = Math.round(proposedY / variables.GRID_CELL_SIZE_h);

                                freamwork.state.ws.send(JSON.stringify({
                                    type: "playermove",
                                    message: {
                                        key,
                                        x: gx,
                                        y: gy,
                                        range: this.power
                                    },
                                    playerId: freamwork.state.myId
                                }));
                            }
                        }
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

