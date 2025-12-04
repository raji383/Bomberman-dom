import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { router } from "../../framework/route.js";



export class Boomb {
    constructor(boom) {
        this.range = boom.range;
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
        console.log(player,this);
        
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
        console.log(freamwork.state.player.list);

        router()
    }
    draw() {

        return createElement({
            tag: "div",
            attrs: {
                class: "boom",
                style: `
                    position: absolute;
                    left: ${this.x}%;
                    top: ${this.y}%;
                    background-image: url('${this.img}');

                    `
            }
        })
    }
}