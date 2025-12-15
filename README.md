# Bomberman DOM

A web-based, high-performance Bomberman game built using only DOM manipulation , inspired by the classic multiplayer battle game. Up to 4 players compete, but only one can survive!

## Project Overview


This project is based on the following subject:

> In the beginning there are 4 players, and only one comes out alive. Each player starts in a different corner of the map. The game must run at a minimum of 60fps at all times, with no frame drops, and proper use of `requestAnimationFrame`. Performance measurement is required to ensure smooth gameplay. Canvas, or external frameworks are **not** allowed; only DOM and your own mini-framework may be used.

A real-time chat using WebSockets is included, allowing players to communicate during the game.

---

## Game Mechanics

### Players

- **2 to 4 players** per game.
- Each player starts with **3 lives**. Lose all lives and you're out!
- Players are placed in the map corners at the start.

### Map

- **Fixed map**: All players see the entire map.
- **Walls**: Indestructible, always in the same place.
- **Blocks**: Destructible, randomly generated each game.
- **Safe spawn**: Players always have space to escape initial bomb explosions.

### Power Ups

Destroying blocks may randomly spawn power ups:
- **Bombs**: +1 to max bombs dropped at once.
- **Flames**: +1 explosion range in all directions.
- **Speed**: Move faster.

### Game Flow

1. **Nickname Entry**: Players enter a nickname to join.
2. **Waiting Room**: Shows a player counter (up to 4).
3. **Game Start**:
   - If 2+ players join but not 4 within 20s, a 10s countdown starts.
   - If 4 players join before 20s, the 10s countdown starts immediately.
   - Game begins after countdown.

### Chat

- Real-time chat using WebSockets.
- All players can communicate before and during the game.

---

## Technical Requirements

- **DOM only**: No canvas, or external frameworks.
- **Performance**: Must run at 60fps+ at all times, with no frame drops.
- **requestAnimationFrame**: Used for all rendering/animation.


---

## Getting Started

### Prerequisites

- Node.js 
- npm

### Installation

```bash
git clone https://learn.zone01oujda.ma/git/azraji/bomberman-dom.git
cd bomberman-dom
npm install

```

### Running the Game

```bash
node server/index.js
```

Visit `http://localhost:8080` in your browser.


## Project Structure

- `server/` - Game source code
- `framework/` - Used framework code
- `app/` - Frontend code

---

---

## Made by 
-@azraji   -@abalouri    -@ychatoua 

---

Enjoy Bomberman DOM and may the best bomber win!
