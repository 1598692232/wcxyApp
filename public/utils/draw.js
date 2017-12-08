export function drawRect(ctx, x, y, w, h) {
    ctx.rect(x, y, w, h)
    ctx.stroke()
}

export function drawArrow (ctx, x1, y1, x2, y2) {
    // Arrow Tail
    const fromPoint = {
      x: x1,
      y: y1
    }
    // Arrow Head
    const toPoint = {
      x: x2,
      y: y2
    }

    // Arrow Head Size
    const headRate = 1 / 6

    // Calculate Arrow
    const deltaX = Math.abs(x2 - x1)
    const deltaY = Math.abs(y2 - y1)
    const length = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2))

    // Unit vector of the arrow (Main axis)
    const direction = {
      x: (x2 - x1) / length,
      y: (y2 - y1) / length
    }
    // Cross unit vector of the arrow (cross axis, 90 deg to main axis)
    const directionCross = {
      left: {
        x: -direction.y,
        y: direction.x
      },
      right: {
        x: direction.y,
        y: -direction.x
      }
    }
    // Point where main axis & cross axis meet
    const origin = {
      x: x1 + direction.x * (1 - headRate) * length,
      y: y1 + direction.y * (1 - headRate) * length
    }

    // wings
    const wings = {
      left: {
        inner: {
          x: origin.x + directionCross.left.x * length * headRate / 4,
          y: origin.y + directionCross.left.y * length * headRate / 4
        },
        outer: {
          x: origin.x + directionCross.left.x * length * headRate / 2,
          y: origin.y + directionCross.left.y * length * headRate / 2
        }
      },
      right: {
        inner: {
          x: origin.x + directionCross.right.x * length * headRate / 4,
          y: origin.y + directionCross.right.y * length * headRate / 4
        },
        outer: {
          x: origin.x + directionCross.right.x * length * headRate / 2,
          y: origin.y + directionCross.right.y * length * headRate / 2
        }
      }
    }

    const nodes = [
      fromPoint,
      wings.left.inner,
      wings.left.outer,
      toPoint,
      wings.right.outer,
      wings.right.inner,
      fromPoint
    ]

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    for (let i = 1; i < nodes.length; i++) {
      const node = nodes[i]
      ctx.lineTo(node.x, node.y)
    }
    ctx.closePath()
    ctx.fill()
}

export function drawLine (ctx, x1, y1, x2, y2) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.closePath()
    ctx.stroke()
}

