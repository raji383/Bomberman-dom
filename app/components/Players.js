import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { router } from "../../framework/route.js";
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
        this.gameWidth = window.innerWidth * (80 / 100);
        this.gameH = window.innerHeight * (80 / 100);
        this.img = `/tools/player${i + 1}.png`;
        this.id = id;

        this.power = 50;
        this.speed = 5;

        this.inagif = 'down';
        this.frameIndex = 0;
        this.frameCount = 0;
        this.element = null;

        this.frameW = 37;
        this.frameH = 50;

        this.x = x == 100 ? this.gameWidth * (x / 100) - this.frameW : this.gameWidth * (x / 100);
        this.y = y == 100 ? this.gameH * (y / 100) - this.frameH : this.gameH * (y / 100);

        this.xOffset = 0;
        this.yOffset = 0;
    }

    Spritesheet() {
        if (!this.element) return;

        const dirMap = {
            down: 0,
            left: 1,
            right: 2,
            up: 3
        };

        let dirRow = dirMap[this.inagif] ?? 0;

        this.frameCount++;
        if (this.frameCount > 6) {
            this.frameIndex = (this.frameIndex + 1) % 3;
            this.frameCount = 0;
        }

        this.xOffset = -(this.frameIndex * this.frameW);
        this.yOffset = -(dirRow * this.frameH);

    }

    update(e = { key: "" }) {
        if (e.key === "ArrowLeft" && this.x > 0) {
            this.x -= this.speed;
            this.inagif = 'left';
        } else if (e.key === "ArrowRight" && this.x + this.frameW < this.gameWidth) {
            this.x += this.speed;
            this.inagif = 'right';
        } else if (e.key === "ArrowUp" && this.y > 0) {
            this.y -= this.speed;
            this.inagif = 'up';
        } else if (e.key === "ArrowDown" && this.y + this.frameH < this.gameH) {
            this.y += this.speed;
            this.inagif = 'down';
        } else if (e.key === " ") {


        }

        this.Spritesheet();
        router()

    }

    draw() {
        console.log(this.x, this.y);


        const x = this.x > this.gameWidth ? `calc(${this.x}px - ${this.frameW}px)` : `${this.x}px`;
        const y = this.y > this.gameH ? `calc(${this.y}px - ${this.frameH}px)` : `${this.y}px`;

        const el = createElement({
            tag: "div",
            events: {
                keydown: (e) => {
                    if (freamwork.state?.ws && this.id == freamwork.state.myId) {
                        let type = "playermove";

                        if (e.key === " ") {
                            type = "boomb";
                        }
                        freamwork.state.ws.send(JSON.stringify({
                            type: type,
                            message: {
                                key: e.key,
                                x: this.x,
                                y: this.y,
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
                    left: ${x};
                    top: ${y};
                    width: ${this.frameW}px;
                    height: ${this.frameH}px;
                    background-image: url('${this.img}');
                    background-repeat: no-repeat;
                    background-position: ${this.xOffset}px ${this.yOffset}px;
                    image-rendering: pixelated;
                    z-index: 10;
                `
            },
            children: []
        });

        this.element = el;

        return el;
    }
}
