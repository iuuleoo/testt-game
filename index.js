const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// Ajusta canvas para ocupar toda a tela
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Mapa de colisões
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i));
}

const boundaries = [];
const offset = { x: -776, y: -600 };

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
    }
  });
});

// Sprites e imagens
const image = new Image();
image.src = "img/PelletTown.png";
const foregroundImage = new Image();
foregroundImage.src = "img/foregroundObjects.png";
const playerDownImage = new Image();
playerDownImage.src = "img/playerDown.png";
const playerUpImage = new Image();
playerUpImage.src = "img/playerUp.png";
const playerLeftImage = new Image();
playerLeftImage.src = "img/playerLeft.png";
const playerRightImage = new Image();
playerRightImage.src = "img/playerRight.png";

// Player sempre centralizado
const player = new Sprite({
  position: {
    x: canvas.width / 2 / 1 / 2 - 32,
    y: canvas.height / 3 - 1,
  },
  image: playerDownImage,
  frames: { max: 4 },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  },
});

// Background e foreground
const background = new Sprite({
  position: { x: offset.x, y: offset.y },
  image,
});
const foreground = new Sprite({
  position: { x: offset.x, y: offset.y },
  image: foregroundImage,
});

const keys = {
  w: { pressed: false },
  a: { pressed: false },
  s: { pressed: false },
  d: { pressed: false },
};
let lastKey = "";
const movables = [background, ...boundaries, foreground];

// Função de colisão
function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  );
}

// ======== ANIMAÇÃO ========
function animate() {
  window.requestAnimationFrame(animate);
  background.draw();
  boundaries.forEach((boundary) => boundary.draw());
  player.draw();
  foreground.draw();

  let moving = true;
  player.moving = false;

  if (keys.w.pressed && lastKey === "w") {
    player.moving = true;
    player.image = player.sprites.up;
    for (const boundary of boundaries) {
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y + 3 },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) movables.forEach((movable) => (movable.position.y += 3));
  } else if (keys.a.pressed && lastKey === "a") {
    player.moving = true;
    player.image = player.sprites.left;
    for (const boundary of boundaries) {
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x + 3, y: boundary.position.y },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) movables.forEach((movable) => (movable.position.x += 3));
  } else if (keys.s.pressed && lastKey === "s") {
    player.moving = true;
    player.image = player.sprites.down;
    for (const boundary of boundaries) {
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x, y: boundary.position.y - 3 },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) movables.forEach((movable) => (movable.position.y -= 3));
  } else if (keys.d.pressed && lastKey === "d") {
    player.moving = true;
    player.image = player.sprites.right;
    for (const boundary of boundaries) {
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: { x: boundary.position.x - 3, y: boundary.position.y },
          },
        })
      ) {
        moving = false;
        break;
      }
    }
    if (moving) movables.forEach((movable) => (movable.position.x -= 3));
  }
}

// ======== CONTROLES TECLADO ========
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});

// ======== TOUCH / MOBILE ========
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
});

window.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    keys.w.pressed = keys.a.pressed = keys.s.pressed = keys.d.pressed = false;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20) {
        keys.d.pressed = true;
        lastKey = "d";
      } else if (dx < -20) {
        keys.a.pressed = true;
        lastKey = "a";
      }
    } else {
      if (dy > 20) {
        keys.s.pressed = true;
        lastKey = "s";
      } else if (dy < -20) {
        keys.w.pressed = true;
        lastKey = "w";
      }
    }
  },
  { passive: false }
);

window.addEventListener("touchend", () => {
  keys.w.pressed = keys.a.pressed = keys.s.pressed = keys.d.pressed = false;
});

// Começa animação após imagens carregarem
image.onload = () => {
  animate();
};
