import { createElement } from "../../framework/createjsx.js";
import { freamwork } from "../../framework/index.js";
import { connectToServer } from "../web/ws.js";

export default function NicknameScreen() {
  const { playerName, eroor } = freamwork.state;

  const handleInput = (e) => {
    freamwork.setState({ playerName: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();


    if (playerName && playerName.trim() && playerName.trim().length <= 10) {
      connectToServer(playerName.trim());
    } else {
      freamwork.setState(prev => ({
        ...prev,
        eroor: "i want name last of  10"
      }));
      setTimeout(() => {
        freamwork.setState(prev => ({
          ...prev,
          eroor: null
        }));

      }, 2000)
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
      (eroor) && (createElement({
        tag: "p",
        attrs: { class: "eroor" },
        children: [`${eroor}`]

      })),
      createElement({
        tag: "p",
        attrs: { class: "subtitle" },
        children: ["Join the battle and be the last survivor!"]
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
              placeholder: "Enter your nickname",
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
            children: ["🎮 Join Game"]
          })
        ]
      }),
      createElement({
        tag: "div",
        attrs: { class: "instructions" },
        children: [
          createElement({
            tag: "h3",
            children: ["🎯 How to Play?"]
          }),
          createElement({
            tag: "ul",
            children: [
              createElement({
                tag: "li",
                children: ["👥 2-4 players per match"]
              }),
              createElement({
                tag: "li",
                children: ["💣 Place bombs with SPACE"]
              }),
              createElement({
                tag: "li",
                children: ["🎮 Move using the ARROW KEYS"]
              }),
              createElement({
                tag: "li",
                children: ["⚡ Collect power-ups to boost your abilities"]
              })
            ]
          })
        ]
      })
    ]
  });
}
