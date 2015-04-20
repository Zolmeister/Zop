var Game, styles, z;

z = require('zorium');
paperColors = require('zorium-paper/colors.json')

Score = require('../../models/score')
Footer = require('../footer')

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

module.exports = Game = (function() {
  var state = z.state({
    $footer: new Footer(),
    timeInterval: null,
    renderInterval: null
  })

  function Game() {}

  Game.prototype.onBeforeUnmount = function () {
    clearInterval(state().timeInterval)
  }

  Game.prototype.onMount = function ($$el) {
    var RATIO = window.devicePixelRatio || 1

    var a = $$el.children[0]
    var b = document.body
    a.width = window.innerWidth * RATIO
    a.height = window.innerHeight * RATIO
    window.onresize = function () {
      window.location.reload()
    }

    var c = a.getContext('2d')

    ctx = c
    W = a.width
    H = a.height
    dotSize = Math.min(W, H) / 7
    xs = W / 2 - dotSize * 3 + dotSize / 2
    ys = H / 2 - dotSize * 3 + dotSize / 2

    if (W > H) {
      dotSize *= 0.6
      xs = W / 2 - dotSize * 3 + dotSize / 2
      ys = H / 2 - dotSize * 3
    }

    choice = function(arr) {
      return arr[Math.floor(Math.random()*arr.length)]
    }

    colors = ['#F44336', '#9C27B0', '#2196F3', '#4CAF50', '#FF9800']

    dots = []
    for (var x = 0; x < 6; x++) {
      for (var y = 0; y < 6; y++) {
        color = choice(colors)
        dots.push({
          color: color,
          ty: ys + y * dotSize,
          x: xs + x * dotSize,
          y: ys + y * dotSize,
          r: y,
          c: x
        })
      }
    }

    window.gameRestart = function () {
      isSelecting = false
      selected = []
      isSelecting = false
      mouseX = 0
      mouseY = 0
      squareColor = null

      score = 0
      time = 60
      lastPhysicsTime = 0

      for (var x = 0; x < 6; x++) {
        for (var y = 0; y < 6; y++) {
          color = choice(colors)
          dots[x + y * 6] = {
            color: color,
            ty: ys + y * dotSize,
            x: xs + x * dotSize,
            y: ys + y * dotSize - (dotSize * x * 2),
            r: y,
            c: x,
            tt: dotSize / 15
          }
        }
      }
    }

    window.gameRestart()

    state.set({
      timeInterval: setInterval(function () {
        time -= 1
        time = Math.max(time, 0)
        if (time == 0) {
          selected = []
          isSelecting = false
          squareColor = null
          Score.save(score)
          z.router.go('/game-over')
        }
      }, 1000)
    })

    render = function() {
      var physicsScale = 1
      var delta = 1
      if (lastPhysicsTime) {
        var now = Date.now()
        delta = now - lastPhysicsTime
        // we want 60fps
        physicsScale = delta / 16
        // clamp
        physicsScale = Math.min(physicsScale, 5)
        lastPhysicsTime = now
      } else {
        lastPhysicsTime = Date.now()
      }

      if (time === 0) {
        return
      }
      ctx.clearRect(0, 0, W, H)

      if (squareColor) {
        ctx.globalAlpha = 0.1
        ctx.fillStyle = squareColor
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = 1
      }

      ctx.font = dotSize / 2 + 'px Roboto'
      function fillText(s, x, y) {
        ctx.fillText(s, x|0, y|0)
      }
      ctx.fillStyle = paperColors.$black54
      fillText(score, xs + dotSize * 2.5, ys - dotSize)
      fillText(time, xs + dotSize, ys - dotSize)
      fillText(Score.getBest(), xs + dotSize * 4, ys - dotSize)

      ctx.textAlign = 'center'
      ctx.font = 'italic ' + dotSize / 5 + 'px Roboto'
      fillText('SCORE', xs + dotSize * 2.5, ys - dotSize + dotSize / 3)
      fillText('TIME', xs + dotSize, ys - dotSize + dotSize / 3)
      fillText('BEST', xs + dotSize * 4, ys - dotSize + dotSize / 3)


      for (var i = dots.length - 1; i >= 0 ; i--) {
        var a = dots[i]
        var hasBelow = false
        for (var j = 0; j < dots.length; j++) {
          var b = dots[j]
          if (isBelow(a, b)) {
            hasBelow = true
            break
          }
        }
        if (!hasBelow && a.r != 5) {
          a.r += 1
          a.ty = ys + a.r * dotSize
        }

        if (a.y != a.ty) {
          dir = a.y > a.ty ? -1 : 1
          a.y += a.tt * dir * physicsScale
          a.tt *= a.bdown && !a.bup ? 0.7 : 1.3

          if (dir == 1 && a.y >= a.ty) {
            a.y = a.ty
          } else if (dir == -1 && a.y <= a.ty) {
            a.y = a.ty
            if (a.bdown) {
              a.bdown = true
            }
          }

          if (!a.bdown && !a.bup && a.y == a.ty) {
            a.bdown = true
            a.ty -= dotSize / 3 * 1.3
            a.tt = dotSize / 5
          } else if (a.bdown && !a.bup && a.y == a.ty) {
            a.bup = true
            a.tt = dotSize / 25
            a.ty += dotSize / 3 * 1.3
          }

        } else {
          a.tt = dotSize / 15
          a.bdown = false
          a.bup = false
        }
      }


      for (var i = 0; i < dots.length; i++) {
        dot = dots[i]
        if (contains(selected, dot) || dot.color == squareColor) {
          ctx.fillStyle = dot.color
          ctx.globalAlpha = 0.5
          ctx.fillRect(Math.floor(dot.x - dotSize / 3), Math.floor(dot.y - dotSize / 3), Math.floor(dotSize / 1.5), Math.floor(dotSize / 1.5))
          ctx.globalAlpha = 1
        }
        ctx.fillStyle = dot.color
        ctx.fillRect(Math.floor(dot.x - dotSize / 4), Math.floor(dot.y - dotSize / 4), Math.floor(dotSize / 2), Math.floor(dotSize / 2))
      }

      if (selected.length && isSelecting) {
        ctx.strokeStyle = selected[0].color
        ctx.lineJoin = 'round'
        ctx.lineWidth = dotSize / 6
        ctx.beginPath()
        ctx.moveTo(mouseX, mouseY)
        for (var i = 0; i < selected.length; i++) {
          var dot = selected[i]
          ctx.lineTo(dot.x, dot.y)
        }
        ctx.stroke()
      }

      window.requestAnimFrame(render)
    }

    isBelow = function (a, b) {
      return a.r + 1 == b.r && a.c == b.c
    }

    collideDot = function (x, y, dot) {
      return x > dot.x - dotSize / 2 &&
             x < dot.x + dotSize / 2 &&
             y > dot.y - dotSize / 2 &&
             y < dot.y + dotSize / 2
    }

    contains = function (arr, x) {
      return arr.indexOf(x) != -1
    }

    isNeighbor = function (a, b) {
      return a.r + 1 == b.r && a.c == b.c ||
             a.r - 1 == b.r && a.c == b.c ||
             a.c + 1 == b.c && a.r == b.r ||
             a.c - 1 == b.c && a.r == b.r
    }

    a.addEventListener('mousedown', touchstart)
    a.addEventListener('touchstart', touchstart)
    function touchstart(e) {
      e.preventDefault()
      if (time == 0) return
      isSelecting = true

      var x, y
      if (e.pageX) {
        x = e.pageX
        y = e.pageY
      } else {
        var t = e.changedTouches
        x = t[0].pageX
        y = t[0].pageY
      }

      onmove({
        pageX: x,
        pageY: y
      })
    }

    a.addEventListener('mouseup', touchend)
    a.addEventListener('touchend', touchend)
    function touchend(e) {
      e.preventDefault()
      isSelecting = false
      if (selected.length < 2) {
        return selected = []
      }

      if (squareColor) {
        for (var i = 0; i < dots.length; i++) {
          var dot = dots[i]
          if (dot.color == squareColor) {
            selected.push(dot)
          }
        }
      }

      var highestRow = 0
      for (var i = 0; i < selected.length; i++) {
        var dot = selected[i]
        highestRow = Math.max(dot.r, highestRow)
      }

      for (var i = 0; i < selected.length; i++) {
        var dot = selected[i]
        do {
          var color = choice(colors)
        } while (color == squareColor)
        if (dot.r >= 0) {
          score += 1
          dot.r -= highestRow + 1
          dot.y = ys + dot.r * dotSize
          dot.ty = ys + dot.r * dotSize
          dot.color = color
        }
      }

      squareColor = null
      selected = []
    }

    a.addEventListener('mousemove', onmove)
    a.addEventListener('touchmove', onmove)
    function onmove (e) {
      if (e.preventDefault)
        e.preventDefault()

      if (e.pageX) {
        mouseX = e.pageX * RATIO
        mouseY = e.pageY * RATIO
      } else {
        var t = e.changedTouches
        mouseX = t[0].pageX * RATIO
        mouseY = t[0].pageY * RATIO
        isSelecting = true
      }

      if (isSelecting && time != 0) {
        for (var i = 0; i < dots.length; i++) {
          var dot = dots[i]
          var isntSame = selected.length && selected[0].color != dot.color
          if (isntSame || selected.length && !isNeighbor(dot, selected[0]))
            continue
          if (collideDot(mouseX, mouseY, dot)) {
            if (!contains(selected, dot)) {
              selected.unshift(dot)
            } else if (selected[1] == dot) {
              selected.shift()
            } else {
              selected.unshift(dot)
              squareColor = dot.color
            }
          }
        }
      }
    }

    render()
  }

  Game.prototype.restart = function () {
    if (window.gameRestart)
      window.gameRestart()
  }

  Game.prototype.render = function() {
    var self = this
    $footer = state.$footer

    return z('z-game',
      {style: {
        width: '100%',
        height: '100%'
      }},
      z('canvas#canvas', {
        style: {
          display: 'block',
          width: '100%',
          height: '100%'
        }
      }),
      z($footer, {
        onRestart: function () {
          self.restart()
        }
      })
    )
  };

  return Game;
})();
