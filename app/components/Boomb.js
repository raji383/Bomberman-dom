import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { variables } from "../../variables.js";



export class Boomb {
    constructor(boom, id) {
        this.boom = boom;
        this.range = boom.range;

        this.gridX = boom.x;
        this.gridY = boom.y;

        // convert grid → px
        this.x = this.gridX * variables.GRID_CELL_SIZE_h;
        this.y = this.gridY * variables.GRID_CELL_SIZE_h;

        this.id = id;
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
    playerwinner() {
        for (let i = 0; i < freamwork.state.player.list.length; i++) {
            const element = freamwork.state.player.list[i];
            if (element.alive) {
                return element.name
            }
        }
    }

    exblogen() {
        freamwork.state.player.list.forEach(player => {
            if ((this.inrangX(player) || this.inrangY(player)) && player.alive) {
                player.lives--;
                player.x = player.insX;
                player.y = player.insY;
                if (player.lives <= 0) {
                    player.alive = false;
                    freamwork.state.number--
                }
            }
        });

        freamwork.setState(prev => ({ ...prev }))
    }
    smoke() {
        //  X
        for (let i = 0; i <= this.range; i++) {

            if (freamwork.state.map[this.gridY][this.gridX + i] === 0 || freamwork.state.map[this.gridY][this.gridX + i] === 3) {
                createExplosion(this.gridX + i, this.gridY, this.id);
            } else if (freamwork.state.map[this.gridY][this.gridX + i] === 2) {
                createExplosion(this.gridX + i, this.gridY, this.id);

                freamwork.state.ws.send(JSON.stringify({
                    type: 'boxdestroy',
                    message: {
                        x: this.gridX + i,
                        y: this.gridY
                    }
                }));
                break
                // freamwork.state.map[this.gridY][this.gridX + i] = 0
            } else if (freamwork.state.map[this.gridY + i][this.gridX] === 1) {
                break
            }
        }
        for (let i = -this.range; i <= 0; i++) {

            if (freamwork.state.map[this.gridY][this.gridX + i] === 0 || freamwork.state.map[this.gridY][this.gridX + i] === 3) {
                createExplosion(this.gridX + i, this.gridY, this.id);
            } else if (freamwork.state.map[this.gridY][this.gridX + i] === 2) {
                createExplosion(this.gridX + i, this.gridY, this.id);

                freamwork.state.ws.send(JSON.stringify({
                    type: 'boxdestroy',
                    message: {
                        x: this.gridX + i,
                        y: this.gridY
                    }
                }));
                break
                // freamwork.state.map[this.gridY][this.gridX + i] = 0
            } else if (freamwork.state.map[this.gridY + i][this.gridX] === 1) {
                break
            }
        }

        //  Y
        for (let i = 0; i <= this.range; i++) {
            if (freamwork.state.map[this.gridY + i][this.gridX] === 0) {
                createExplosion(this.gridX, this.gridY + i, this.id);
            } else if (freamwork.state.map[this.gridY + i][this.gridX] === 2) {
                createExplosion(this.gridX, this.gridY + i, this.id);
                // freamwork.state.map[this.gridY + i][this.gridX] = 0
                freamwork.state.ws.send(JSON.stringify({
                    type: 'boxdestroy',
                    message: {
                        x: this.gridX,
                        y: this.gridY + i
                    }
                }));
                break

            } else if (freamwork.state.map[this.gridY + i][this.gridX] === 1) {
                break
            }
        }
        for (let i = -this.range; i <= 0; i++) {
            if (freamwork.state.map[this.gridY + i][this.gridX] === 0) {
                createExplosion(this.gridX, this.gridY + i, this.id);
            } else if (freamwork.state.map[this.gridY + i][this.gridX] === 2) {
                createExplosion(this.gridX, this.gridY + i, this.id);
                // freamwork.state.map[this.gridY + i][this.gridX] = 0
                freamwork.state.ws.send(JSON.stringify({
                    type: 'boxdestroy',
                    message: {
                        x: this.gridX,
                        y: this.gridY + i
                    }
                }));
                break
            } else if (freamwork.state.map[this.gridY + i][this.gridX] === 1) {
                break
            }
        }

        freamwork.setState(prev => ({ ...prev }))
    }


    draw() {
        // render as an <img> so the src is explicit and sizing is consistent
        const size = Math.round(variables.GRID_CELL_SIZE_h);
        // center the image inside the cell 
        const left = Math.round(this.x);
        const top = Math.round(this.y);

        return createElement({
            tag: "img",
            attrs: {
                src: this.img,
                class: "boom",
                draggable: "false",
                style: `
                    position: absolute;
                    left: ${left}px;
                    top: ${top}px;
                    width: ${size}px;
                    height: ${size}px;
                    object-fit: contain;
                    image-rendering: pixelated;
                    pointer-events: none;
                    transform: translateZ(0);
                `
            }
        });
    }
}


class Explosion {
    constructor(gridX, gridY, id) {
        this.x = gridX * variables.GRID_CELL_SIZE_w;
        this.y = gridY * variables.GRID_CELL_SIZE_h;
        this.id = id

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
            freamwork.setState(prev => ({ ...prev }))

            if (this.scale < 2) {

                requestAnimationFrame(grow);
            } else {
                freamwork.state.explosion =
                    freamwork.state.explosion.filter(e => e !== this);

                freamwork.setState(prev => ({ ...prev }))
            }
        };

        requestAnimationFrame(grow);
    }

    draw() {
        return this.vnode;
    }
}


function createExplosion(gx, gy, id) {
    let exp = new Explosion(gx, gy, id);
    freamwork.state.explosion.push(exp);
    freamwork.setState(prev => ({ ...prev }))
}

