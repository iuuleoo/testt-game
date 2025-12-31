const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// Detecta se é mobile
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// Função para definir a velocidade
function getSpeed() {
  if (isMobile) {
    return Math.min(canvas.width, canvas.height) * 0.25; // bem mais rápido
  } else {
    return 2; // velocidade fixa no PC
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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

// Player sempre centralizado no canvas
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

// Background inicia na posição correta
const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: image,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
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

// 🎵 Música de fundo (começa automaticamente e volume mais baixo)
const backgroundMusic = new Audio("audio/map.wav"); // coloque o caminho correto da sua música
backgroundMusic.loop = true;
backgroundMusic.volume = 0.1; // volume mais baixo
backgroundMusic.play().catch(() => {
  // Alguns navegadores bloqueiam autoplay, então podemos ignorar o erro
});

// Função principal após carregar o background
image.onload = () => {
  function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
      rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
      rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
      rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
      rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    );
  }

  function animate() {
    window.requestAnimationFrame(animate);

    background.draw();
    boundaries.forEach((boundary) => boundary.draw());
    player.draw();
    foreground.draw();

    const speed = getSpeed(); // velocidade atual

    let moving = true;
    player.moving = false;

    if (keys.w.pressed && lastKey === "w") {
      player.moving = true;
      player.image = player.sprites.up;
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y + speed,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) movables.forEach((movable) => (movable.position.y += speed));
    } else if (keys.a.pressed && lastKey === "a") {
      player.moving = true;
      player.image = player.sprites.left;
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x + speed,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) movables.forEach((movable) => (movable.position.x += speed));
    } else if (keys.s.pressed && lastKey === "s") {
      player.moving = true;
      player.image = player.sprites.down;
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x,
                y: boundary.position.y - speed,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) movables.forEach((movable) => (movable.position.y -= speed));
    } else if (keys.d.pressed && lastKey === "d") {
      player.moving = true;
      player.image = player.sprites.right;
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];
        if (
          rectangularCollision({
            rectangle1: player,
            rectangle2: {
              ...boundary,
              position: {
                x: boundary.position.x - speed,
                y: boundary.position.y,
              },
            },
          })
        ) {
          moving = false;
          break;
        }
      }
      if (moving) movables.forEach((movable) => (movable.position.x -= speed));
    }
  }

  animate();
};

// Eventos do teclado
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
