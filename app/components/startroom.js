import { createElement } from "../../framework/createjsx.js";
import { router } from "../../framework/route.js";
import { connectToServer } from "../web/webSocket.js";

export default function Room() {


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
                children: ["Get ready for the adventure!"]
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
                                    connectToServer(e.target.value);
                                    history.pushState({}, "", "/waiting");
                                    router();

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