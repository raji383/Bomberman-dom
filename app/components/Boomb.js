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
        const map = freamwork.state.map;

        const cast = (dx, dy) => {
            for (let i = 0; i <= this.range; i++) {
                const gx = this.gridX + dx * i;
                const gy = this.gridY + dy * i;

                const cell = map[gy]?.[gx];
                if (cell === undefined) break; 

                // empty 
                if (cell === 0 || cell === 3) {
                    createExplosion(gx, gy, this.id);

                } else if (cell === 2) {
                    // box destroy
                    createExplosion(gx, gy, this.id);

                    freamwork.state.ws.send(JSON.stringify({
                        type: 'boxdestroy',
                        message: { x: gx, y: gy }
                    }));
                    console.log(11);
                    
                    break;

                } else if (cell === 1) {
                    // wall
                    break;
                }
            }
        };

        cast(1, 0);   
        cast(-1, 0);  
        cast(0, 1);   
        cast(0, -1);  

        freamwork.setState(prev => ({ ...prev }));
    }



    draw() {
        const size = Math.round(variables.GRID_CELL_SIZE_h);
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

