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
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.frameIndex = 0;
        this.frameW = variables.GRID_CELL_SIZE_w;
        this.frameH = variables.GRID_CELL_SIZE_h;

        this.cols = 5;
        this.rows = 4;

        this.vnode = this.createVNode();

        this.animate();
    }

    createVNode() {
        return {
            tag: "div",
            attrs: {
                class: "explosion",
                style: `
                    position: absolute;
                    left: ${this.x}px;
                    top: ${this.y}px;
                    width: ${this.frameW}px;
                    height: ${this.frameH}px;
                    background-image: url('./tools/explosion.png');
                    background-size: ${this.frameW * this.cols}px ${this.frameH * this.rows}px;
                    background-repeat: no-repeat;
                    background-position: 0px 0px;
                `
            },
            children: []
        };
    }

    updateFrame() {
        let col = this.frameIndex % this.cols;
        let row = Math.floor(this.frameIndex / this.cols);

        let xOffset = -(col * this.frameW);
        let yOffset = -(row * this.frameH);
        console.log("dhal");
        
        this.vnode.attrs.style = `
            position: absolute;
            left: ${this.x}px;
            top: ${this.y}px;
            width: ${this.frameW}px;
            height: ${this.frameH}px;
            background-image: url('./tools/explosion.png');
            background-size: ${this.frameW * this.cols}px ${this.frameH * this.rows}px;
            background-repeat: no-repeat;
            background-position: ${xOffset}px ${yOffset}px;
        `;
    }

    animate() {
        const interval = setInterval(() => {

            this.updateFrame();
            router(); // ← re-render

            this.frameIndex++;

            if (this.frameIndex >= this.cols * this.rows) {
                clearInterval(interval);

                // filter VDOM node
                freamwork.state.explosion =
                    freamwork.state.explosion.filter(v => v !== this.vnode);

                router();
            }

        }, 50);
    }

    draw() {
        return this.vnode;
    }
}

function createExplosion(gx, gy) {
    let px = gx * variables.GRID_CELL_SIZE_h;
    let py = gy * variables.GRID_CELL_SIZE_h;

    let exp = new Explosion(px, py);
    freamwork.state.explosion.push(exp.draw());
}

