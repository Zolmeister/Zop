with(Math){
for($ in c)c[$[0]+($[6]||'')]=c[$]
W = a.width
H = a.height
dotSize = min(W, H) / 7
xs = W / 2 - dotSize * 3 + dotSize / 2
ys = H / 2 - dotSize * 3

colors = ['#e43', '#92a', '#29e', '#4a5', '#f90']

dots = []
selected = []
isSelecting = false

score = highestRow = 0
time = 61

onmousedown = function () {
  isSelecting = true
}

// initialize grid
for (var x = 0; x < 6; x++) {
  for (var y = 0; y < 6; y++) {
    dots.push({
      color: colors[random()*5|0],
      ty: ys + y * dotSize,
      x: xs + x * dotSize,
      y: ys + y * dotSize,
      r: y,
      c: x
    })
  }
}

onmouseup = ontouchend = function () {
  isSelecting = false

  // ignore single selections
  if (selected.length < 2) {
    selected = []
  }

  // respawn dots above board
  for (var i = 0; i < selected.length; i++) {
    var dot = selected[i]
    if (dot.r >= 0) {
      score++
      dot.r -= highestRow + 1
      dot.y = ys + dot.r * dotSize
      dot.color = colors[random()*5|0]
    }
  }

  highestRow = 0
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
        (selected[0].color != dot.color ||
          abs(
            abs(selected[0].r - dot.r) - abs(selected[0].c - dot.c)
          ) != 1))
        continue
      if (abs(mouseX - dot.x) < dotSize / 2 &&
             abs(mouseY - dot.y) < dotSize / 2) {
        if (selected.indexOf(dot) == -1) {
          selected.unshift(dot)
          highestRow = max(dot.r, highestRow)
        } else if (selected[1] == dot) {
          selected.shift()
        }
      }
    }
  }
}


setInterval(function() {
  time = max(time - 0.03, 0)

  // clear canvas
  c.ce(0, 0, W, H)


  // physics and painting
  for (var i = dots.length - 1; i >= 0; i--) {
    var a = dots[i]

    // if dot doesn't have a neighbor below, move it down
    var hasBelow = false
    for (var j = 0; j < dots.length; j++) {
      var b = dots[j]
      if (a.r + 1 == b.r && a.c == b.c) {
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
    if (selected.indexOf(a) != -1) {
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
}
