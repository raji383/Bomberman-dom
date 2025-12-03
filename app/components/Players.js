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

            return new Player(this, x, y, name, element.id);
        });
    }
}




class Player {
    constructor(PlayerList, x, y, name, id) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.playerList = PlayerList;
        this.img = '/tools/player.png';
        this.id = id
    }
    update(e, b = false) {
        if (!b) {
            console.log(freamwork.state);

        }
        if (e.key === "ArrowLeft") {
            this.x--
            router()
        } else if (e.key === "ArrowRight") {
            this.x++
            router()
        } else if (e.key === "ArrowUp") {
            this.y--
            router()
        } else if (e.key === "ArrowDown") {
            this.y++
            router()
        }
    }
    draw() {

        return createElement({
            tag: "div",
            events: {
                keydown: (e) => {

                    freamwork.state.ws.send(JSON.stringify({
                        type: 'playermove',
                        message: { key: e.key },
                        playerId: freamwork.state.myId
                    }));

                }
            }
            ,
            attrs: {
                class: "p",
                style: `
          position: absolute;
          left: ${this.x}%;
          top: ${this.y}%;
          width: 50px;
          height: 60px;
          background-size: 334%;
          background-image: url('${this.img}');
          background-repeat: no-repeat;
          image-rendering: pixelated;
          background-position: -2% 0;
          z-index: 10;
        `
            },
            children: []
        })

    }
}

