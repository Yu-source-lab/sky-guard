# Sky Guard

Sky Guard is a small, standalone browser game. Move the plane, fire lasers, and destroy incoming obstacles. The game becomes faster as the score increases.

## Run locally

No dependencies are required. Open `index.html` directly, or start a local server:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Controls

- `Arrow Left` / `Arrow Right` or `A` / `D`: move the plane
- `Space`: fire and start the game
- `R`: restart the game

## Project structure

- `index.html`: page structure
- `style.css`: layout and responsive styling
- `game.js`: game loop, collision detection, scoring, and levels
- `assets/`: local game image assets

The plane and obstacle images were downloaded from [OpenMoji](https://openmoji.org/) under the CC BY-SA 4.0 license. This project is for learning and demonstration purposes.
