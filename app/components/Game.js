import { freamwork } from "../../framework/index.js";
import { createElement } from "../../framework/createjsx.js";

export default function Game() {
    console.log(freamwork.state.mapcomp);

    return createElement(freamwork.state.mapcomp);
}