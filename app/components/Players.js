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
            return new Player(i, element.x, element.y, name, element.id);
        });
    }
}

class Player {
    constructor(i, x, y, name, id) {
        this.name = name;
        this.id = id;

        this.img = `/tools/player${i + 1}.png`;
        this.lives = 3;
        this.power = 1;
        this.speed = 1;
        this.bombs = 1;
        this.alive = this.lives > 0 ? true : false;

        this.pressedKeys = [];
        this.inagif = 'down';
        this.lastKey;
        this.frameIndex = 0;
        this.frameCount = 0;

        // Sprite vars
        this.renderW = variables.GRID_CELL_SIZE_h;
        this.renderH = variables.GRID_CELL_SIZE_h;
        this.xOffset = 0;
        this.yOffset = 0;

        this.x = x;
        this.y = y;
        this.gridX = Math.round(this.x / variables.GRID_CELL_SIZE_w);
        this.gridY = Math.round(this.y / variables.GRID_CELL_SIZE_h);

        this.initInputListeners();
    }

    initInputListeners() {
        setTimeout(() => {
            if (freamwork.state?.myId && this.id === freamwork.state.myId) {

                window.addEventListener('keydown', (e) => {
                    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        if (!this.pressedKeys.includes(e.key)) {
                            this.pressedKeys.push(e.key);
                        }
                    }


                    if (e.key === " ") {
                        freamwork.state.ws.send(JSON.stringify({
                            type: "boomb",
                            playerId: this.id
                        }));
                    }
                });

                window.addEventListener('keyup', (e) => {
                    if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        const index = this.pressedKeys.indexOf(e.key);
                        if (index > -1) {
                            this.pressedKeys.splice(index, 1);
                        }
                    }
                });
            }
        }, 100);
    }

    Spritesheet(delta) {

        if (this.lastKey === "ArrowLeft") this.inagif = 'left';
        else if (this.lastKey === "ArrowRight") this.inagif = 'right';
        else if (this.lastKey === "ArrowUp") this.inagif = 'up';
        else if (this.lastKey === "ArrowDown") this.inagif = 'down';

        const dirMap = { down: 0, left: 1, right: 2, up: 3 };
        const dirRow = dirMap[this.inagif] ?? 0;

        if (this.lastKey) {
            this.frameCount++;
            if (this.frameCount > 6) {
                this.frameIndex = (this.frameIndex + 1) % 3;
                this.frameCount = 0;
            }
        } else {
            this.frameIndex = 1;
        }

        this.xOffset = -(this.frameIndex * this.renderW);
        this.yOffset = -(dirRow * this.renderH);
    }

    update(delta) {
        this.deltaTime = delta;
        if (freamwork.state?.ws && this.id == freamwork.state.myId) {
            const lastKey = this.pressedKeys[this.pressedKeys.length - 1];

            if (lastKey) {
                freamwork.state.ws.send(JSON.stringify({
                    type: "playerMove",
                    direction: lastKey,
                    delta: this.deltaTime,
                    playerId: this.id
                }));
            }
        }

        this.Spritesheet(this.deltaTime);
        freamwork.setState(prev => ({ ...prev }));
    }

    draw() {

        this.gridX = Math.round(this.x / variables.GRID_CELL_SIZE_w);
        this.gridY = Math.round(this.y / variables.GRID_CELL_SIZE_h);

        return createElement({
            tag: "div",
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
                    transition: none;
                `
            }
        });
    }
}