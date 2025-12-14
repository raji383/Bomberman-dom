import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { variables } from "../../variables.js";

export class Boomb {
    constructor(boom, id) {
        this.range = boom.range;
        this.gridX = boom.x;
        this.gridY = boom.y;

        this.x = this.gridX * variables.GRID_CELL_SIZE_h;
        this.y = this.gridY * variables.GRID_CELL_SIZE_h;

        this.id = id;
        this.img = '/tools/bomb.png';
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
                    z-index: 5; 
                `
            }
        });
    }
}
class Explosion {
    constructor(gridX, gridY) {
        this.x = gridX * variables.GRID_CELL_SIZE_h;
        this.y = gridY * variables.GRID_CELL_SIZE_h;
        this.size = variables.GRID_CELL_SIZE_h;

        this.startTime = Date.now();
        this.duration = 300;

        this.currentScale = 0.5;
        this.opacity = 1;
        
        this.finished = false;
        this.vnode = this.createVNode();
    }

    createVNode() {
        return createElement({
            tag: "div",
            attrs: {
                class: "explosion-fire",
                style: `
                    position: absolute;
                    left: ${this.x}px;
                    top: ${this.y}px;
                    width: ${this.size}px;
                    height: ${this.size}px;
                    
                    background-color: rgba(255, 69, 0, 0.8);
                    border-radius: 20%;
                    z-index: 15;
                    box-shadow: 0 0 15px rgba(255, 140, 0, 1);
                    
                    transform: scale(${this.currentScale});
                    opacity: ${this.opacity};
                    
                    will-change: transform, opacity;
                `
            }
        });
    }

    animate() {
        if (this.finished) return;
        const now = Date.now();
        const elapsed = now - this.startTime;
        
        const progress = elapsed / this.duration;

        if (progress >= 1) {
            this.finished = true;
            if (freamwork.state.explosion) {
                freamwork.state.explosion = freamwork.state.explosion.filter(e => e !== this);
            }
        } else {
            
            this.currentScale = 0.5 + progress; 
            
            if (progress > 0.5) {
                this.opacity = 1 - ((progress - 0.7) / 0.3);
            }

            this.vnode = this.createVNode();
        }
    }
    draw() {
        return this.vnode;
    }
}
export function createExplosion(gx, gy) {
    let exp = new Explosion(gx, gy);
    if (!freamwork.state.explosion) freamwork.state.explosion = [];
    freamwork.state.explosion.push(exp);
}
