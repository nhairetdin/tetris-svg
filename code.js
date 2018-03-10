const FPS = 1, INTERVAL = 1000 / FPS, UNIT = 10
let lastTime = (new Date()).getTime(), currentTime = 0, delta = 0, vendors = ['webkit', 'moz'], counter = 0, pause = true, draw = SVG('draw')
draw.rect(100, 200).fill('rgba(255, 255, 255, 0)').stroke({ width: 1, color: 'rgb(222, 222, 222)' })

class Piece {
  constructor (x, y, d) {
    this._x = x, this._y = y, this._originX = x, this._originY = y
    this._rect = d.rect(9, 9).move(this._x, this._y).fill('rgba(255, 0, 102, 0.1)').stroke({ width: 0.5, color: '#f06'})
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
    this._rect.finish()
    this.animate(50, ">")
  }

  get getRect() { return this._rect }

  animate(duration, easing) {
    this._rect.finish()
    this._rect.animate(duration, easing).move(this._x, this._y)
  }
}

class Block {
  constructor() {
    this._pieces = [], this._origin
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
    for (let i = 0; i < this._types[6].length; i++) {
      let p = new Piece(this._types[6][i].x * UNIT, this._types[6][i].y * UNIT, draw)
      this._pieces.push(p)
      if (this._types[6][i].origin) {
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

let block = new Block()
block.createPieces()

function forward() {
  block.move("down", 300, "bounce")
  console.log(block.getPieces[0].getX, block.getPieces[0].getY)
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
      block.move("left", 50, ">")
      break;
    case 38: //up
      block.move("up", 50, ">")
      break;
    case 39: //right
      block.move("right", 50, ">")
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
