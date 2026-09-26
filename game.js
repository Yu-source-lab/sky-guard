const canvas = document.querySelector('#game');
const context = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const levelElement = document.querySelector('#level');
const livesElement = document.querySelector('#lives');
const messageElement = document.querySelector('#message');

const planeImage = new Image();
const obstacleImage = new Image();
planeImage.src = 'assets/airplane.svg';
obstacleImage.src = 'assets/obstacle.svg';

const keys = new Set();
const stars = [];
const shots = [];
const obstacles = [];
let score = 0;
let level = 1;
let lives = 3;
let isRunning = false;
let lastFrameTime = 0;
let spawnTimer = 0;

const player = {
  x: canvas.width / 2 - 28,
  y: canvas.height - 72,
  width: 56,
  height: 56,
  speed: 330,
  cooldown: 0
};

for (let index = 0; index < 70; index += 1) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.8 + 0.3,
    speed: 15 + Math.random() * 30
  });
}

function resetGame() {
  score = 0;
  level = 1;
  lives = 3;
  shots.length = 0;
  obstacles.length = 0;
  player.x = canvas.width / 2 - 28;
  isRunning = true;
  messageElement.textContent = '';
  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function fireShot() {
  if (player.cooldown > 0) return;

  shots.push({
    x: player.x + player.width / 2 - 3,
    y: player.y - 8,
    width: 6,
    height: 18,
    speed: 480
  });
  player.cooldown = 0.22;
}

function spawnObstacle() {
  const size = 34 + Math.random() * 20;
  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size,
    speed: 75 + level * 12 + Math.random() * 45
  });
}

function overlaps(first, second) {
  return first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

function loseLife() {
  lives -= 1;
  if (lives <= 0) {
    isRunning = false;
    messageElement.textContent = 'Mission failed! Press R or Space to restart.';
  }
}

function update(deltaTime) {
  stars.forEach((star) => {
    star.y += star.speed * deltaTime;
    if (star.y > canvas.height) star.y = 0;
  });

  if (keys.has('ArrowLeft') || keys.has('a')) player.x -= player.speed * deltaTime;
  if (keys.has('ArrowRight') || keys.has('d')) player.x += player.speed * deltaTime;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  if (keys.has(' ') || keys.has('Spacebar')) fireShot();

  player.cooldown = Math.max(0, player.cooldown - deltaTime);
  spawnTimer -= deltaTime;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = Math.max(0.28, 1.05 - level * 0.08);
  }

  shots.forEach((shot) => { shot.y -= shot.speed * deltaTime; });
  obstacles.forEach((obstacle) => { obstacle.y += obstacle.speed * deltaTime; });
  for (let obstacleIndex = obstacles.length - 1; obstacleIndex >= 0; obstacleIndex -= 1) {
    const obstacle = obstacles[obstacleIndex];
    if (obstacle.y > canvas.height) {
      obstacles.splice(obstacleIndex, 1);
      loseLife();
      continue;
    }
    for (let shotIndex = shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
      if (overlaps(shots[shotIndex], obstacle)) {
        shots.splice(shotIndex, 1);
        obstacles.splice(obstacleIndex, 1);
        score += 10;
        level = 1 + Math.floor(score / 100);
        break;
      }
    }
    if (overlaps(player, obstacle)) {
      obstacles.splice(obstacleIndex, 1);
      loseLife();
    }
  }

  scoreElement.textContent = score;
  levelElement.textContent = level;
  livesElement.textContent = Math.max(0, lives);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#071020';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#b9e6ff';
  stars.forEach((star) => {
    context.globalAlpha = 0.45;
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;

  shots.forEach((shot) => {
    context.fillStyle = '#67e8f9';
    context.shadowColor = '#67e8f9';
    context.shadowBlur = 12;
    context.fillRect(shot.x, shot.y, shot.width, shot.height);
    context.shadowBlur = 0;
  });
  obstacles.forEach((obstacle) => {
    context.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
  context.drawImage(planeImage, player.x, player.y, player.width, player.height);
}

function gameLoop(currentTime) {
  if (!isRunning) return;
  const deltaTime = Math.min((currentTime - lastFrameTime) / 1000, 0.04);
  lastFrameTime = currentTime;
  update(deltaTime);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  keys.add(event.key);
  if ([' ', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
  if (event.key.toLowerCase() === 'r' || (!isRunning && event.key === ' ')) resetGame();
});
window.addEventListener('keyup', (event) => keys.delete(event.key));

draw();
