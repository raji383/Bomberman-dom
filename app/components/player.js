class Player {
    constructor(nickname) {
        this.nickname = nickname;
    }
    
}
class Players {
    constructor() {
        this.Players = [];
    }
    addPlayer(nickname) {
        const player = new Player(nickname);
        this.Players.push(player);
    }
}