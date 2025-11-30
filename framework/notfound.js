import { createElement } from "../framework/createjsx.js";
import { freamwork } from "../framework/index.js";
export function notfound() {
        return createElement({
            tag: "div",
            attrs: { class: "notfound-container" },
            children: [
                {
                    tag: "h1",
                    children: ["404 - Page Not Found"]
                },
                {
                    tag: "p",
                    children: ["The page you are looking for does not exist."]
                },
                { tag: "a",

                    events: {
                        click: () => {
                             freamwork.push('');
                        }
                    },
                    children: ["Go to Home"]

                }
            ]
        });
    
}