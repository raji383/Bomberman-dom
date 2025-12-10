import { freamwork } from "../../framework/index.js";
import { push, router } from "../../framework/route.js";
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
        map: data.map,
        number: Number(data.number)
      });
      push('game');
      startGameLoop();
      break;
    case 'join_timer':
      freamwork.setState({ join_timer: data.value, countdown: null });
      break;
    case 'start_timer':
      freamwork.setState({ countdown: data.value, join_timer: null });
      break;
    case 'players_update':
      freamwork.setState({ players: data.players });
      break;

    case 'chat_message':
      freamwork.setState(prev => ({
        ...prev,
        messages: [...prev.messages, data.message]
      }));

      break;
    case 'number':
      for (let i = 0; i < freamwork.state.player.list.length; i++) {
        const element = freamwork.state.player.list[i];
        if (element.id == data.number) {
          if (element.alive) {
            element.alive = false;
            freamwork.state.number--
            freamwork.setState(prev => ({ ...prev }))

          }
        }
      }


      break;
    case 'playermove':

      for (let index = 0; index < freamwork.state.player.list.length; index++) {
        const element = freamwork.state.player.list[index];
        if (element.id == data.id) {
          element.event = data.message.key
        }
      }
      freamwork.setState(prev => ({ ...prev }))

      break
    case 'playerstop':

      for (let index = 0; index < freamwork.state.player.list.length; index++) {
        const element = freamwork.state.player.list[index];
        if (element.id == data.id) {
          element.event = null
        }
      }
      freamwork.setState(prev => ({ ...prev }))
      break
    case 'boomb':

      var bom = new Boomb(data.message, data.id)
      console.log(bom.id);

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
      setTimeout(() => {
        freamwork.state.explosion = freamwork.state.explosion.filter(p => {
          if (bom.id == p.id) return false
        })
        freamwork.setState(prev => ({ ...prev }))
      }, 4000);
      break
    case 'winning':
      freamwork.state.gameOver = data.message + "  is the  winner";
      freamwork.setState(prev => ({ ...prev }))
      break
    case 'boxdestroy':
      setTimeout(() => {
        freamwork.setState({ map: data.message });
      }, 0)
      break
    case 'powerUp':
      for (let index = 0; index < freamwork.state.player.list.length; index++) {
        const element = freamwork.state.player.list[index];
        if (element.id == data.id) {
          switch (data.power) {
            case 'energy':
              if (element.speed < 9) {

                element.speed++
              }
              break
            case 'bombNbr':
              if (element.bombs < 5) {

                element.bombs++
              }
              break
            case 'bombRange':
              if (element.power < 8) {

                element.power++;
              }
              break
            default:
              console.log(' Message inconnu:', data.type);
          }
        }
      }
      freamwork.setState({ map: data.message });

      freamwork.setState(prev => ({ ...prev }))
      break
    default:
      console.log(' Message inconnu:', data.type);
  }
}
function playerwinner() {
  for (let i = 0; i < freamwork.state.player.list.length; i++) {
    const element = freamwork.state.player.list[i];
    if (element.alive) {
      return element.name
    }
  }
}

function startGameLoop() {
  let lastTime = performance.now();
  let lastFpsUpdate = performance.now();
  let frameCount = 0;

  function gameLoop(timestamp) {
 if (freamwork.state.number !=1){
   requestAnimationFrame(gameLoop);
 }
    if (freamwork.state.number <= 1 && freamwork.state.number!=null) {
      
      
      freamwork.state.ws.send(JSON.stringify({
        type: 'winning',
        message: playerwinner()
      }));

    }

    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    const players = freamwork.state.player?.list || [];
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const key = p.event
      const proposedX = key === "ArrowLeft" ? p.x - p.speed
        : key === "ArrowRight" ? p.x + p.speed
          : p.x;
      const proposedY = key === "ArrowUp" ? p.y - p.speed
        : key === "ArrowDown" ? p.y + p.speed
          : p.y;
      if (!p.canMove(proposedX, proposedY)) {
        freamwork.state.ws.send(JSON.stringify({
          type: "playerstop",
          message: {
            key: key,
          },
          playerId: freamwork.state.myId
        }));

      }
      if (p.alive) p.update(delta);
    }

    frameCount++;

    if (timestamp >= lastFpsUpdate + 1000) {
      freamwork.state.fps = frameCount;
      frameCount = 0;
      lastFpsUpdate = timestamp;
    }
  }
 if (freamwork.state.number !=1){

   requestAnimationFrame(gameLoop);
 }
}
