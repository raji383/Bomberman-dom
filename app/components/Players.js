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

        this.gameH = variables.GRID_CELL_SIZE_h * 17;
        this.gameWidth = this.gameH;

        // spr
        this.img = `/tools/player${i + 1}.png`;

        // powerup
        this.lives = 3;
        this.power = 1;
        this.speed = 5;
        this.bombs = 1;
        // speed is responsive based on grid cell size: a fraction of the cell height
        this.alive = this.lives > 0 ? true : false;
        // move
        this.inagif = 'down';
        this.frameIndex = 0;
        this.frameCount = 0;
        this.event="ArrowDown";

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

        this.x = x;
        this.y = y;
        this.gridX = Math.round(this.x / variables.GRID_CELL_SIZE_w);
        this.gridY = Math.round(this.y / variables.GRID_CELL_SIZE_h);
    }

    Spritesheet(delta) {
        
        if (this.event === "ArrowLeft") {
            this.inagif = 'left';
        } else if (this.event === "ArrowRight") {
            this.inagif = 'right';
        } else if (this.event === "ArrowUp") {
            this.inagif = 'up';
        } else if (this.event === "ArrowDown") {
            this.inagif = 'down';
        } 
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

    update(delta) {
        this.deltaTime = delta
        this.Spritesheet(this.deltaTime)
        freamwork.setState(prev => ({ ...prev }))
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
                        if (key === " " ) {
                            
                            
                            freamwork.state.ws.send(JSON.stringify({
                                type: "boomb",
                                playerId: this.id 
                            }));
                            return;
                        }

                        // movement keys: only send if the player can move to the intended position
                        if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") {

                            freamwork.state.ws.send(JSON.stringify({
                                type: "playerMove",
                                direction: key,
                                delta: this.deltaTime,
                                playerId: this.id
                            }));



                        }
                    }
                },

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
