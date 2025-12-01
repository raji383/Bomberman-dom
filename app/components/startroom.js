import { createElement } from "../../framework/createjsx.js";

export default function Room() {

    console.log(12);

    return createElement({
        tag: "div",
        attrs: { class: "container" },
        children: [
            {
                tag: "div",
                attrs: { class: "logo" },
                children: ["💣 BOMBERMAN"]
            },
            {
                tag: "div",
                attrs: { class: "subtitle" },
                children: ["استعد للمغامرة!"]
            },
            {
                tag: "div",
                attrs: { class: "bomb-container" },
                children: [
                    {
                        tag: "div",
                        attrs: { class: "bomb" },
                        children: [
                            {
                                tag: "div",
                                attrs: { class: "fuse" },
                                children: [
                                    {
                                        tag: "div",
                                        attrs: { class: "spark" },
                                        children: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                tag: "div",
                attrs: { class: "loading-bar" },
                children: [
                    {
                        tag: "div",
                        attrs: { class: "loading-progress" },
                        children: []
                    }
                ]
            },
            {
                tag: "div",
                attrs: { class: "loading-text" },
                children: [
                    "جاري التحميل",
                    {
                        tag: "span",
                        attrs: { class: "dots" },
                        children: [
                            { tag: "span", children: ["."] },
                            { tag: "span", children: ["."] },
                            { tag: "span", children: ["."] }
                        ]
                    }
                ]
            },
            {
                tag: "div",
                attrs: { class: "tips" },
                children: ["💡 نصيحة: استخدم القنابل بذكاء لهزيمة أعدائك!"]
            }
        ]
    }
    );
}