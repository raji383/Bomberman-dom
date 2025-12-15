import { freamwork } from "../../framework/index.js";
import { push, router } from "../../framework/route.js";
import { variables } from "../../variables.js";
import { Boomb, createExplosion } from "../components/Boomb.js";
export function connectToServer(nickname) {
  try {
    const ws = new WebSocket(`ws://${location.hostname}:8080`);
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        nickname: nickname,
        cell: variables.GRID_CELL_SIZE_h

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
        number: Number(data.number),

      });
      freamwork.state.join_timer = null
      freamwork.state.countdown = null
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
    case 'playerMove':
      const players = freamwork.state.player?.list || [];
      for (let i = 0; i < players.length; i++) {

        const p = players[i];

        if (p.id == data.playerId) {

          p.x = data.x
          p.y = data.y
          p.speed = data.speed
          p.power = data.range
          p.bombs = data.bomb
          p.lastKey = data.direction
        }

      }
      freamwork.state.map = data.map

      break
    case 'playerstop':

      // for (let index = 0; index < freamwork.state.player.list.length; index++) {
      //   const element = freamwork.state.player.list[index];
      //   if (element.id == data.id) {
      //     element.event = null
      //   }
      // }
      freamwork.setState(prev => ({ ...prev }))
      break
    case 'boomb':

      var bom = new Boomb(data.message, data.id)
      freamwork.state.boombs.push(bom)

      break
    case 'explosion':
      const center = data.fire[0];
      if (center) {
        freamwork.state.boombs = freamwork.state.boombs.filter(b => {
          return !(b.gridX === center.x && b.gridY === center.y);
        });
      }
      freamwork.state.map = data.map;
      if (data.fire) {
        data.fire.forEach(cell => {
          createExplosion(cell.x, cell.y);
        });
      }
     break;
    case 'player_died':
      const playersList = freamwork.state.player?.list || [];
      playersList.forEach(p => {
        if (p.id === data.id && p.alive && p.candie) {
          p.candie = false
          setTimeout(()=>{
            p.candie =true
          },3000)
           p.lives--
          if (p.lives <= 0) {
            if (freamwork.state.number > 1) {
                p.alive = false
              if (freamwork.state.number) {
                freamwork.state.number--;
              }
            }
          } else {
            p.x = data.x
            p.y = data.y

          }
        }
      });
      break;
    case 'winning':
      console.log(data);

      freamwork.state.gameOver = data.message + "  is the  winner";
      if (data.id == freamwork.state.myId) {
        freamwork.state.winner = true
      } else {
        freamwork.state.winner = false
      }
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
function playerwinnerId() {
  for (let i = 0; i < freamwork.state.player.list.length; i++) {
    const element = freamwork.state.player.list[i];
    if (element.alive) {
      return element.id
    }
  }
}
function startGameLoop() {
  let lastTime = performance.now();
  function gameLoop(timestamp) {
    if (freamwork.state.number != 1) {
      requestAnimationFrame(gameLoop);
    }
    if (freamwork.state.number <= 1 && freamwork.state.number != null) {
      freamwork.state.ws.send(JSON.stringify({
        type: 'winning',
        message: playerwinner(),
        playerId: playerwinnerId()
      }));
    }
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    const player = freamwork.state.player?.list || [];
    for (let i = 0; i < player.length; i++) {
      const p = player[i];
      p.update(delta)
    }
    if (freamwork.state.explosion) {
      freamwork.state.explosion.forEach((exp) => {
        exp.animate();
      });
    }
  }
  if (freamwork.state.number != 1) {

    requestAnimationFrame(gameLoop);
  }
}
