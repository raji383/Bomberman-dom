import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
 class Players {
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

            return new Player(this, x, y, name);
        });
    }
}




class Player {
    constructor(PlayerList, x, y, name) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.playerList = PlayerList;
        this.img = '/tools/player.png';
    }




    draw(deltaTime) {
        console.log("da");
        
        return createElement({
            tag: "div",
            attrs: {
                id: "p",
                style: `
          position: absolute;
          left: ${this.x}px;
          top: ${this.y}px;
          width: 80px;
          height: 80px;
          background-size: cover;
          background-image: url('${this.img}');
          background-repeat: no-repeat;
          image-rendering: pixelated;
          background-position: 80px 0;
          z-index: 10;
        `
            },
            children: []
        })

    }
}
export function NEW() {
    return  new Players(freamwork.state.players);

}