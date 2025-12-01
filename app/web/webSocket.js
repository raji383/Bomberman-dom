import { freamwork } from "../../framework/index.js";

export function connectToServer(name) {
    try {
        const ws = new WebSocket('ws://localhost:3000');

        ws.onopen = () => {
            console.log('Connecté au serveur',name);
            ws.send(JSON.stringify({
                type: 'join',
                nickname: name
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(' Message serveur:', data.type);
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
