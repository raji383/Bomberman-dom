import { createElement } from "../../framework/createjsx.js";

export default function Room() {

    console.log(12);

    return createElement({
        tag: "div",
        attrs: { class: "room" },
        children: ["start"]
    });
}