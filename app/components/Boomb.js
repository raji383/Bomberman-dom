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

            return !(this.inrangX(player) || this.inrangY(player));
        });

        router();
    }
    smoke() {
        //  X
        for (let i = -this.range; i <= this.range; i++) {
            if (freamwork.state.map[this.gridY][this.gridX + i] === 0) {
                createExplosion(this.gridX + i, this.gridY);
            } else if (freamwork.state.map[this.gridY][this.gridX + i] === 2) {
                freamwork.state.map[this.gridY][this.gridX + i] = 0
            }
        }

        //  Y
        for (let i = -this.range; i <= this.range; i++) {
            if (freamwork.state.map[this.gridY + i][this.gridX] === 0) {
                createExplosion(this.gridX, this.gridY + i);
            } else if (freamwork.state.map[this.gridY + i][this.gridX] === 2) {
                freamwork.state.map[this.gridY + i][this.gridX] = 0
                createExplosion(this.gridX, this.gridY + i);

            }
        }

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


class Explosion {
    constructor(gridX, gridY) {
        this.x = gridX * variables.GRID_CELL_SIZE_w;
        this.y = gridY * variables.GRID_CELL_SIZE_h;

        this.size = variables.GRID_CELL_SIZE_w - 5;
        this.scale = 0.1;

        this.vnode = this.createVNode();

        this.animate();
    }

    createVNode() {
        return createElement({
            tag: "div",
            attrs: {
                class: "explosion-circle",
                style: `
                    position: absolute;
                    left: ${this.x}px;
                    top: ${this.y}px;
                    width: ${this.size}px;
                    height: ${this.size}px;
                    background-color: rgba(255,165,0,0.9);
                    border-radius: 50%;
                    z-index: 15;
                    border: 2px solid rgba(255,0,0,0.8);
                    box-shadow: 0 0 20px rgba(255,165,0,0.8);
                    transform: scale(${this.scale});
                `
            },
            children: []
        });
    }



    animate() {
        const grow = () => {
            this.scale += 0.1;
            this.vnode = this.createVNode();
            router();

            if (this.scale < 2) {
                requestAnimationFrame(grow);
            } else {
                freamwork.state.explosion =
                    freamwork.state.explosion.filter(e => e !== this);

                router();
            }
        };

        requestAnimationFrame(grow);
    }

    draw() {
        return this.vnode;
    }
}


function createExplosion(gx, gy) {
    let exp = new Explosion(gx, gy);

    freamwork.state.explosion.push(exp);
    router();
}

