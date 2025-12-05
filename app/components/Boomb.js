import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { router } from "../../framework/route.js";
import { variables } from "../../variables.js";



export class Boomb {
    constructor(boom) {
        this.range = boom.range;
        this.gameWidth = window.innerWidth * (80 / 100);
        this.gameH = window.innerHeight * (80 / 100);
        this.x = boom.x;
        this.y = boom.y;
        this.id = boom.id;
        this.img = '/tools/bomb.png'
    }
    inrangX(player) {
        if (player.y == this.y &&
            player.x < this.x + this.range &&
            player.x > this.x - this.range) {
            return true
        }
        return false
    }
    inrangY(player) {
        if (player.x == this.x &&
            player.y < this.y + this.range &&
            player.y > this.y - this.range) {
            return true
        }
        return false
    }
    exblogen() {

        freamwork.state.player.list = freamwork.state.player.list.filter((player) => {
            if (this.inrangX(player) || this.inrangY(player)) {
                return false
            }
            return true
        })

        router()
    }
    draw() {
        console.log("sdf", this.x);

        return createElement({
            tag: "div",
            attrs: {
                class: "boom",
                style: `
                    position: absolute;
                    left: ${this.x}px;
                    top: ${this.y}px;
                    z-index: 1000;
                    background-image: url('${this.img}');
                    width: ${variables.GRID_CELL_SIZE_h}px;
                    height: ${variables.GRID_CELL_SIZE_h}px;
                    `
            }
        })
    }
}