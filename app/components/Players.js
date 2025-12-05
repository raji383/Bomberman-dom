import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { router } from "../../framework/route.js";
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

        this.gameH = window.innerHeight * 0.80;
        this.gameWidth = this.gameH;

        // spr
        this.img = `/tools/player${i + 1}.png`;

        // powerup
        this.power = 1;
        this.speed = 5;

        // move
        this.inagif = 'down';
        this.frameIndex = 0;
        this.frameCount = 0;

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
        this.x = x == 100
            ? this.gameWidth - this.renderW - variables.GRID_CELL_SIZE_h
            : this.gameWidth * (x / 100) + variables.GRID_CELL_SIZE_h;

        this.y = y == 100
            ? this.gameH - this.renderH - variables.GRID_CELL_SIZE_h
            : this.gameH * (y / 100) + variables.GRID_CELL_SIZE_h;

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

    update(e = { key: "" }) {
        if (e.key === "ArrowLeft" && this.x > variables.GRID_CELL_SIZE_w) {
            this.x -= this.speed;
            this.inagif = 'left';

        } else if (e.key === "ArrowRight" && this.x + this.renderW < this.gameWidth - variables.GRID_CELL_SIZE_w) {
            this.x += this.speed;
            this.inagif = 'right';

        } else if (e.key === "ArrowUp" && this.y > variables.GRID_CELL_SIZE_w) {
            this.y -= this.speed;
            this.inagif = 'up';

        } else if (e.key === "ArrowDown" && this.y + this.renderH < this.gameH - variables.GRID_CELL_SIZE_w) {
            this.y += this.speed;
            this.inagif = 'down';
        }

        this.Spritesheet();
        router();
    }

    draw() {
        this.gridX = Math.round(this.x / variables.GRID_CELL_SIZE_w);
        this.gridY = Math.round(this.y / variables.GRID_CELL_SIZE_h);

        const el = createElement({
            tag: "div",
            events: {
                keydown: (e) => {
                    if (freamwork.state?.ws && this.id == freamwork.state.myId) {
                        let type = e.key === " " ? "boomb" : "playermove";

                        freamwork.state.ws.send(JSON.stringify({
                            type: type,
                            message: {
                                key: e.key,
                                x: this.gridX,
                                y: this.gridY,
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

