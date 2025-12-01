import { createElement } from "../../framework/createjsx.js";
import { connectToServer } from "../web/webSocket.js";

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
                children:["Get ready for the adventure!"]
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
                attrs: { class: "player-name-container" },
                children: [
                    {
                        tag: "input",
                        attrs: {
                            type: "text",
                            placeholder: "Enter player name",
                            class: "player-name-input"
                        },
                        events: {
                            keydown: (e) => {
                                if (e.key === "Enter") {
                                    console.log(e.target.value);
                                    connectToServer(e.target.value);
                                }
                            }
                        }
                    }
                    ,
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
                            "Enter player name",
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
                        children: ["💡 Tip: Use bombs wisely to defeat your enemies!"]
                    }
                ]
            }
        ]
    });
}