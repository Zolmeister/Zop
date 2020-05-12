for($ in c)c[$[0]+($[6]||'')]=c[$]
W = a.width
H = a.height
dotSize = Math.min(W, H) / 7
xs = W / 2 - dotSize * 3 + dotSize / 2
ys = H / 2 - dotSize * 3

colors = ['#e43', '#92a', '#29e', '#4a5', '#f90']

dots = []
selected = []
isSelecting = false
mouseX = 0
mouseY = 0
squareColor = 0

score = 0
time = 61

choice = function(arr) {
  return arr[Math.random()*arr.length|0]
}

isBelow = function (a, b) {
  return a.r + 1 == b.r && a.c == b.c
}

collideDot = function (x, y, dot) {
  return Math.abs(x - dot.x) < dotSize / 2 &&
         Math.abs(y - dot.y) < dotSize / 2
}

contains = function (arr, x) {
  return arr.indexOf(x) != -1
}

isNeighbor = function (a, b) {
  return Math.abs(Math.abs(a.r - b.r) - Math.abs(a.c - b.c)) == 1
}

onmousedown = function (e) {
  isSelecting = true
}

// initialize grid
for (var x = 0; x < 6; x++) {
  for (var y = 0; y < 6; y++) {
    dots.push({
      color: choice(colors),
      ty: ys + y * dotSize,
      x: xs + x * dotSize,
      y: ys + y * dotSize,
      r: y,
      c: x
    })
  }
}

onmouseup = ontouchend = function (e) {
  isSelecting = false

  // ignore single selections
  if (selected.length < 2) {
    selected = []
  }

  // square was made
  for (var i = 0; i < dots.length; i++) {
    var dot = dots[i]
    if (dot.color == squareColor) {
      selected.push(dot)
    }
  }

  // find how much to move each dot
  var highestRow = 0
  for (var i = 0; i < selected.length; i++) {
    var dot = selected[i]
    highestRow = Math.max(dot.r, highestRow)
  }

  // respawn dots above board
  for (var i = 0; i < selected.length; i++) {
    var dot = selected[i]

    // make sure color is unique
    do {
      var color = choice(colors)
    } while (color == squareColor)
    if (dot.r >= 0) {
      score++
      dot.r -= highestRow + 1
      dot.y = ys + dot.r * dotSize
      dot.color = color
    }
  }

  squareColor = 0
  selected = []
}

onmousemove = ontouchmove = function (e) {

  // normalize touch inputs
  if (e.pageX) {
    mouseX = e.pageX
    mouseY = e.pageY
  } else {
    mouseX = e.touches[0].pageX
    mouseY = e.touches[0].pageY
    isSelecting = true
  }

  // select dots
  if (isSelecting && time) {
    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i]

      // skip if dot is not the same color or isn't neighboring
      if (selected.length &&
        (selected[0].color != dot.color || !isNeighbor(dot, selected[0])))
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


setInterval(function() {
  time = Math.max(time - 0.03, 0)

  // clear canvas
  c.ce(0, 0, W, H)


  // physics and painting
  for (var i = dots.length - 1; i >= 0; i--) {
    var a = dots[i]

    // if dot doesn't have a neighbor below, move it down
    var hasBelow = false
    for (var j = 0; j < dots.length; j++) {
      var b = dots[j]
      if (isBelow(a, b)) {
        hasBelow = true
        break
      }
    }
    if (!hasBelow && a.r != 5) {
      a.r++
      a.ty = ys + a.r * dotSize
    }

    // falling animation
    if (a.y != a.ty) {
      dir = a.y > a.ty ? -1 : 1
      a.y += a.tt * dir
      a.tt *= a.bdown && !a.bup ? 0.5 : 1.5

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
        a.ty -= dotSize / 3
        a.tt = dotSize / 5
      } else if (a.bdown && !a.bup && a.y == a.ty) {
        a.bup = true
        a.tt = dotSize / 15
        a.ty += dotSize / 3
      }

    } else {
      a.tt = dotSize / 15
      a.bdown = false
      a.bup = false
    }

    // paint
    c.fillStyle = a.color
    if (contains(selected, a) || a.color == squareColor) {
      c.fc(a.x - dotSize / 3, a.y - dotSize / 3, dotSize / 1.5, dotSize / 1.5)
    }
    c.fc(a.x - dotSize / 4, a.y - dotSize / 4, dotSize / 2, dotSize / 2)
  }

  // paint selection lines
  if (selected.length) {
    c.strokeStyle = selected[0].color
    c.lineJoin = 'round'
    c.lineWidth = dotSize / 6
    c.ba()
    c.m(mouseX, mouseY)
    for (var i = 0; i < selected.length; i++) {
      var dot = selected[i]
      c.l(dot.x, dot.y)
    }
    c.s()
  }

  // score
  c.font = dotSize / 3 + 'px s'
  c.fillStyle = '#000'
  c.fx('$' + score, xs + dotSize * 3, ys + dotSize * 6)
  c.fx(time|0, xs, ys + dotSize * 6)
}, 33)
