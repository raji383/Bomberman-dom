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
    exblogen() {

        freamwork.state.player.list = freamwork.state.player.list.filter((player) => {
            if (player.x == this.x) {
                console.log(freamwork.state.player.list);

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