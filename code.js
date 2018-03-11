const FPS = 2, INTERVAL = 1000 / FPS, UNIT = 1, WIDTH = 10, HEIGHT = 20, STACK = []
const COLOR = [
  {"stroke": "rgb(189, 255, 3)", "fill": "rgba(189, 255, 3, 0.1)"},
  {"stroke": "rgb(138, 3, 255)", "fill": "rgba(138, 3, 255, 0.1)"},
  {"stroke": "rgb(251, 78, 20)", "fill": "rgba(251, 78, 20, 0.1)"},
  {"stroke": "rgb(20, 187, 251)", "fill": "rgba(20, 187, 251, 0.1)"},
  {"stroke": "rgb(251, 225, 20)", "fill": "rgba(251, 225, 20, 0.1)"},
  {"stroke": "rgb(0, 255, 153)", "fill": "rgba(0, 255, 153, 0.1)"},
  {"stroke": "rgb(255, 0, 102)", "fill": "rgba(255, 0, 102, 0.1)"}
]

let lastTime = (new Date()).getTime(), currentTime = 0, delta = 0, vendors = ['webkit', 'moz'], counter = 0, pause = true, draw = SVG('draw')
draw.rect(WIDTH, HEIGHT).fill('rgba(255, 255, 255, 0)').stroke({ width: 0.1, color: 'rgb(222, 222, 222)' })

for (let x = 0; x < WIDTH; x++) {
  STACK[x] = []
  for (let y = 0; y < HEIGHT; y++) {
    STACK[x][y] = null
  }
}

class Piece {
  constructor (x, y, d, type) {
    this._x = x, this._y = y, this._originX = x, this._originY = y
    this._rect = d.rect(0.9, 0.9)
      .move(this._x, this._y)
      .fill(COLOR[type].fill)
      .stroke({ width: 0.05, color: COLOR[type].stroke})
      .radius(0.05)
  }

  get getX()    { return this._x }
  get getY()    { return this._y }

  moveLeft()  { this._x -= UNIT }
  moveUp()    { this._y -= UNIT }
  moveRight() { this._x += UNIT }
  moveDown()  { this._y += UNIT }

  rotate(angle, p, q) {
    angle = angle * Math.PI / 180
    let newX = Math.round((this._x - p) * Math.cos(angle) - (this._y - q) * Math.sin(angle)) + p
    let newY = Math.round((this._x - p) * Math.sin(angle) + (this._y - q) * Math.cos(angle)) + q
    this._x = newX
    this._y = newY
    this._rect.stop()
    this.animate(50, ">")
  }

  get getRect() { return this._rect }

  animate(duration, easing) {
    this._rect.stop()
    this._rect.animate(duration, easing).move(this._x, this._y)
  }
}

class Block {
  constructor(type) {
    this._pieces = [], this._origin, this._type = type
    this._types = [
      [{"x": 0, "y": 0}, {"x": 0, "y": 1, "origin": true}, {"x": 0, "y": 2}, {"x":0, "y":3}],
      [{"x": 0, "y": 0}, {"x": 1, "y": 0, "origin": true}, {"x": 2, "y": 0}, {"x": 2, "y": 1}],
      [{"x": 0, "y": 0}, {"x": 1, "y": 0, "origin": true}, {"x": 2, "y": 0}, {"x": 0, "y": 1}],
      [{"x": 0, "y": 0}, {"x": 1, "y": 0, "origin": true}, {"x": 2, "y": 0}, {"x": 1, "y": 1}],
      [{"x": 0, "y": 0}, {"x": 1, "y": 0}, {"x": 0, "y": 1}, {"x": 1, "y": 1, "origin": true}],
      [{"x": 0, "y": 0}, {"x": 1, "y": 0, "origin": true}, {"x": 1, "y": 1}, {"x": 2, "y": 1}],
      [{"x": 1, "y": 0, "origin": true}, {"x": 2, "y": 0}, {"x": 0, "y": 1}, {"x": 1, "y": 1}]
    ]
  }

  createPieces() {
    for (let i = 0; i < this._types[this._type].length; i++) {
      let p = new Piece(this._types[this._type][i].x * UNIT, this._types[this._type][i].y * UNIT, draw, this._type)
      this._pieces.push(p)
      if (this._types[this._type][i].origin) {
        this._origin = p
      }
    }
  }

  move(direction, duration, easing) {
    this._pieces.forEach(p => {
      switch (direction) {
        case "left":
          p.moveLeft()
          break;
        case "up":
          p.moveUp()
          break;
        case "right":
          p.moveRight()
          break;
        case "down":
          p.moveDown()
          break;
      }
      p.animate(duration, easing)
    })
  }

  get getPieces() { return this._pieces }
  get origin()    { return this._origin }

  rotate(angle) {
    this._pieces.forEach(piece => {
      piece.rotate(angle, this._origin.getX, this._origin.getY)
    })
  }
}

let block = getNewBlock()
block.createPieces()

function forward() {
  if (checkCollision("down")) {
    let pieces = block.getPieces
    for (let i = 0; i < pieces.length; i++) {
      STACK[pieces[i].getX][pieces[i].getY] = pieces[i]
    }
    block = getNewBlock()
    block.createPieces()
  } else {
    console.log(block.getPieces[0].getX, block.getPieces[0].getY)
    block.move("down", 100, ">")
  }
}

function checkCollision(direction) {
  let pieces = block.getPieces
  switch (direction) {
    case "down":
      for (let i = 0; i < pieces.length; i++) {
        if (pieces[i].getY + 1 === 20) {
          return true
        }

        if (STACK[pieces[i].getX][pieces[i].getY + 1] !== null) {
          return true
        }
      }
      break;
    default:
      return false
  }
}

function getNewBlock() {
  return new Block(Math.floor(Math.random() * 7))
}

for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
}

function init() {
  window.addEventListener("keydown", handleKeyDown, false);
  toggleGameOn()
}

function toggleGameOn() {
    pause = !pause

    if(!pause) {
      gameLoop()
    }
}

function gameLoop() {
  if (!pause) {
    window.requestAnimationFrame(gameLoop)
    currentTime = (new Date()).getTime()
    delta = (currentTime-lastTime);

    if (delta > INTERVAL) {
      forward()
      lastTime = currentTime - (delta % INTERVAL)
    }
  }
}

function handleKeyDown(e) {
  switch (e.keyCode) {
    case 37: //left
      block.move("left", 100, ">")
      break;
    case 38: //up
      block.move("up", 50, ">")
      break;
    case 39: //right
      block.move("right", 100, ">")
      break;
    case 40: //down
      block.move("down", 50, ">")
      break;
    case 65: //a
      block.rotate(270)
      break;
    case 68: //d
      block.rotate(90)
      break;
    case 80: //p
      toggleGameOn()
      break;
  }
}
