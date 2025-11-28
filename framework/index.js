import { render } from "./render.js";
import { addRoute, push, router } from "./route.js";
import { setState } from "./state.js";
import { mount } from "./createjsx.js";

class Framework {
    constructor() {
        this.state = {};
        this.parent = document.getElementById("app");

        this.OldDOM = null;
        this.newDOM = null;

        // APIs
        this.render = render;
        this.mount = mount;
        this.setState = setState;

        // Router
        this.defaultRoute = '';
        this.routes = {};
        this.addRoute = addRoute;
        this.router = router;
        this.push = push;

    }
}

export const freamwork = new Framework();
