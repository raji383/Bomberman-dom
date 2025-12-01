import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import {connectToServer} from "../ws/ws.js"
export default function NicknameScreen() {
  const { playerName } = freamwork.state;

  const handleInput = (e) => {
    freamwork.setState({ playerName: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName && playerName.trim()) {
      connectToServer(playerName.trim());
    }
  };

  return createElement({
    tag: "div",
    attrs: { class: "nickname-screen" },
    children: [
      createElement({
        tag: "h1",
        children: ["💣 Bomberman Multiplayer"]
      }),
      createElement({
        tag: "p",
        attrs: { class: "subtitle" },
        children: ["Rejoins la bataille et sois le dernier survivant!"]
      }),
      createElement({
        tag: "form",
        attrs: { class: "nickname-form" },
        events: { submit: handleSubmit },
        children: [
          createElement({
            tag: "input",
            attrs: {
              type: "text",
              placeholder: "Entre ton pseudo",
              maxlength: "15",
              required: true,
              value: playerName || "",
              autofocus: true
            },
            events: {
              input: handleInput
            }
          }),
          createElement({
            tag: "button",
            attrs: { type: "submit" },
            children: ["🎮 Rejoindre la partie"]
          })
        ]
      }),
      createElement({
        tag: "div",
        attrs: { class: "instructions" },
        children: [
          createElement({
            tag: "h3",
            children: ["🎯 Comment jouer?"]
          }),
          createElement({
            tag: "ul",
            children: [
              createElement({
                tag: "li",
                children: ["👥 2-4 joueurs par partie"]
              }),
              createElement({
                tag: "li", 
                children: ["💣 Place des bombes avec ESPACE"]
              }),
              createElement({
                tag: "li",
                children: ["🎮 Déplace-toi avec les FLÈCHES"]
              }),
              createElement({
                tag: "li",
                children: ["⚡ Collecte les power-ups pour améliorer tes capacités"]
              })
            ]
          })
        ]
      })
    ]
  });
}


