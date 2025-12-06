import { freamwork } from "../../framework/index.js";
import { push } from "../../framework/route.js";
import { Boomb } from "../components/Boomb.js";



export function connectToServer(nickname) {
  try {
    const ws = new WebSocket('ws://localhost:8080');
     

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        nickname: nickname
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
      } catch (error) {
        console.error(' Erreur parsing message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Déconnecté du serveur');
    };

    ws.onerror = (error) => {
      console.error(' Erreur WebSocket:', error);
    };

    freamwork.setState({ ws: ws });
  } catch (error) {
    console.error(' Erreur connexion:', error);
  }
}

function handleServerMessage(data) {

  switch (data.type) {
    case 'room_assigned':
      freamwork.setState({
        roomId: data.roomId,
        myId: data.playerId,
        players: data.players || {},
        messages: data.chatMessage
      });
      push('lobby');
      break;
    case 'game_start':
      freamwork.setState({
        gameStarted: true,
        players: data.players || {},
        map: data.map
      });
      freamwork.state.players = data.players
      push('game');
      startGameLoop();
      break;
    case 'countdown':
      freamwork.setState({ countdown: data.countdown });
      break;
    case 'players_update':
      freamwork.setState({ players: data.players || {} });
      break;

    case 'chat_message':
      const messages = [...freamwork.state.messages, data.message];
      freamwork.setState({ messages: messages });
      break;
    case 'playermove':
      for (let index = 0; index < freamwork.state.player.list.length; index++) {
        const element = freamwork.state.player.list[index];

        if (element.id == data.id) {

          element.update(data.message, true)
        }
      }
      break
    case 'boomb':
      var bom = new Boomb(data.message)
      freamwork.state.boombs.push(bom)
      setTimeout(() => {
        freamwork.state.boombs = freamwork.state.boombs.filter(p => {
          if (p.id != bom.id) {
            return true
          }
          p.exblogen()
          p.smoke()
          return false
        })
      }, 3000);
      break
    default:
      console.log(' Message inconnu:', data.type);
  }
}

function startGameLoop() {
  let frameCount = 0;
  let lastFpsUpdate = 0;

  function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    for (let index = 0; index < freamwork.state.player?.list.length; index++) {
      const element = freamwork.state.player.list[index];
      element.update()

    }
    frameCount++;
    if (timestamp >= lastFpsUpdate + 1000) {
      frameCount = 0;
      lastFpsUpdate = timestamp;
    }
  }
  gameLoop();
}