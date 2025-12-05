import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { router } from "../../framework/route.js";
import { variables } from "../../variables.js";



export class Boomb {
    constructor(boom) {
        this.boom = boom;
        this.range = boom.range;

        this.gridX = boom.x;
        this.gridY = boom.y;

        // convert grid → px
        this.x = this.gridX * variables.GRID_CELL_SIZE_h;
        this.y = this.gridY * variables.GRID_CELL_SIZE_h;

        this.id = boom.id;
        this.img = '/tools/bomb.png';
    }

    inrangX(player) {
        return (
            player.gridY === this.gridY &&
            player.gridX <= this.gridX + this.range &&
            player.gridX >= this.gridX - this.range
        );
    }

    inrangY(player) {
        return (
            player.gridX === this.gridX &&
            player.gridY <= this.gridY + this.range &&
            player.gridY >= this.gridY - this.range
        );
    }

    exblogen() {
        freamwork.state.player.list = freamwork.state.player.list.filter((player) => {
            console.log(player);
            
            return !(this.inrangX(player) || this.inrangY(player));
        });

        router();
    }

    draw() {
        return createElement({
            tag: "div",
            attrs: {
                class: "boom",
                style: `
                    position: absolute;
                    left: ${this.x}px;
                    top: ${this.y}px;
                    width: ${variables.GRID_CELL_SIZE_h}px;
                    height: ${variables.GRID_CELL_SIZE_h}px;
                    background-image: url('${this.img}');
                    background-size: cover;
                `
            }
        });
    }
}
