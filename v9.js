// removed time
// a = canvas
// b = body
// c = ctx
// d  = dotSize
// e = event
// f = colors
// g = dots
// h = selected
// k = isSelecting
// m = score
// n = highestRow
// o = dot.o
// p = dot (first level)
// q = dot (second level)
// r = hasBelow
// s = dot.bdown
// t = dot.bup
// D = dir
// i = iter
// L = x offset
// R = y offset

with(Math) {
for(i in c)c[i[0]+(i[6]||'')]=c[i]
W = a.width
H = a.height
d = min(W, H) / 7
L = W / 2 - d * 3 + d / 2
R = H / 2 - d * 3

f = ['#e43', '#92a', '#29e', '#4a5', '#f90']

g = []
h = []
m = n = k = 0

onmousedown = function () {
  k = 1
}

// initialize grid
for (x = 0; x < 6; x++) {
  for (y = 0; y < 6; y++) {
    g.push({
      o: f[random()*5|0],
      ty: R + y * d,
      x: L + x * d,
      y: R + y * d,
      r: y,
      c: x
    })
  }
}

onmouseup = ontouchend = function () {
  k = 0

  // ignore single selections
  if (!h[1]) {
    h = []
  }

  // respawn dots above board
  for (i in h) {
    p = h[i]
    if (p.r >= 0) {
      m++
      p.r -= n + 1
      p.y = R + p.r * d
      p.o = f[random()*5|0]
    }
  }

  n = 0
  h = []
}

onmousemove = ontouchmove = function (e) {

  // normalize touch inputs
  if (e.pageX) {
    X = e.pageX
    Y = e.pageY
  } else {
    X = e.touches[0].pageX
    Y = e.touches[0].pageY
    k = 1
  }

  // select dots
  if (k) {
    for (i in g) {
      p = g[i]

      // skip if dot is not the same color or isn't neighboring
      if (h[0] &&
        (h[0].o != p.o |
          abs(
            abs(h[0].r - p.r) - abs(h[0].c - p.c)
          ) != 1))
        continue

      if (
        abs(X - p.x) < d / 2 &&
        abs(Y - p.y) < d / 2
      ) {
        if (h.indexOf(p) == -1) {
          h.unshift(p)
          n = max(p.r, n)
        } else if (h[1] == p) {
          h.shift()
        }
      }
    }
  }
}


setInterval(function() {

  // clear canvas
  c.ce(0, 0, W, H)
  c.lineWidth = d / 6
  c.lineJoin = 'round'

  // physics and painting
  for (i in g) {
    p = g[i]

    // if p doesn't have p neighbor below, move it down
    r = 0
    for (j in g) {
      q = g[j]
      if (p.r + 1 == q.r && p.c == q.c) {
        r = 1
      }
    }
    if (!r && p.r != 5) {
      p.r++
      p.ty = R + p.r * d
    }

    // falling animation
    if (p.y != p.ty) {
      D = p.y > p.ty ? -1 : 1
      p.y += p.tt * D
      p.tt *= p.s && !p.t ? 0.5 : 1.5

      if (D == 1 && p.y >= p.ty) {
        p.y = p.ty
      } else if (D == -1 && p.y <= p.ty) {
        p.y = p.ty
        if (p.s) {
          p.s = 1
        }
      }

      // flip up/down
      if (!p.s && !p.t && p.y == p.ty) {
        p.s = 1
        p.ty -= d / 3
        p.tt = d / 5
      } else if (p.s && !p.t && p.y == p.ty) {
        p.t = 1
        p.tt = d / 15
        p.ty += d / 3
      }

    } else {
      p.tt = d / 15
      p.s = 0
      p.t = 0
    }

    // paint
    c.strokeStyle = p.o
    if (h.indexOf(p) != -1) {
      c.sR(p.x - d / 3, p.y - d / 3, d / 1.5, d / 1.5)
    }
    c.sR(p.x - d / 4, p.y - d / 4, d / 2, d / 2)
  }

  // m
  c.font = d / 3 + 'px s'
  c.fx(m, L, R + d * 6)

  // paint selection lines
  if (h[0]) {
    c.strokeStyle = h[0].o
    c.ba()
    c.m(X, Y)
    for (i in h) {
      p = h[i]
      c.l(p.x, p.y)
    }
    c.s()
  }
}, 33)
}
