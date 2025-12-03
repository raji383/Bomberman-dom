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
                [1, 10],
                [10, 1],
                [10, 10]
            ];

            let [x, y] = positions[i] || [1, 1];

            return new Player(i, x, y, name, element.id);
        });
    }
}




class Player {
    constructor(i, x, y, name, id) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.img = `/tools/player${i+1}.png`;
        this.id = id;
        this.inagif = 'down';
        this.frameIndex = 0;
        this.frameCount = 0;
        this.element = null;

        this.frameW = 37;
        this.frameH = 50;

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
        if (e.key === "ArrowLeft") {
            this.x--;
            this.inagif = 'left';
        } else if (e.key === "ArrowRight") {
            this.x++;
            this.inagif = 'right';
        } else if (e.key === "ArrowUp") {
            this.y--;
            this.inagif = 'up';
        } else if (e.key === "ArrowDown") {
            this.y++;
            this.inagif = 'down';
        }

        this.Spritesheet();
        router()

    }

    draw() {
        const el = createElement({
            tag: "div",
            events: {
                keydown: (e) => {
                    if (freamwork.state?.ws) {
                        freamwork.state.ws.send(JSON.stringify({
                            type: 'playermove',
                            message: { key: e.key },
                            playerId: freamwork.state.myId
                        }));
                    }
                }
            },
            attrs: {
                class: "p",
                style: `
                    position: absolute;
                    left: ${this.x}%;
                    top: ${this.y}%;
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
