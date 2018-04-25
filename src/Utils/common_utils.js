/* UTILS FUNCTIONS */

const smallCost = 1
const diagCost = Math.sqrt(2 * smallCost * smallCost)

const getEuclidianDistance = (x0, y0, x1, y1) =>
  Math.sqrt((x0 - x1) ** 2 + (y0 - y1) ** 2)

const octileHeuristic = (nodeA, nodeB) => {
  const dx = Math.abs(nodeA.x - nodeB.x)
  const dy = Math.abs(nodeA.y - nodeB.y)
  return (
    Math.min(dx, dy) * diagCost +
    (Math.max(dx, dy) - Math.min(dx, dy)) * smallCost
  )
}

const compare = (a, b) => {
  if (a.priority < b.priority) {
    return true
  } else if (a.priority > b.priority) {
    return false
  } else if (a.f < b.f) {
    return true
  } else if (a.h < b.h) {
    return true
  } else if (a.g < b.g) {
    return true
  }
  return false
}

const pushUpdateF = (pq, n) => {
  const l = []
  let found = false
  while (!pq.isEmpty()) {
    const tmp = pq.poll()
    if (tmp.id === n.id) {
      found = true
      if (tmp.f < n.f) {
        pq.add(tmp)
      } else {
        pq.add(n)
      }
      break
    }
    l.push(tmp)
  }
  while (l.length !== 0) {
    pq.add(l.shift())
  }
  if (!found) {
    pq.add(n)
  }
}

const pushUpdateH = (pq, n) => {
  const l = []
  let found = false
  while (!pq.isEmpty()) {
    const tmp = pq.poll()
    if (tmp.id === n.id) {
      found = true
      if (tmp.h < n.h) {
        pq.add(tmp)
      } else {
        pq.add(n)
      }
      break
    }
    l.push(tmp)
  }
  while (l.length !== 0) {
    pq.add(l.shift())
  }
  if (!found) {
    pq.add(n)
  }
}

export {
  smallCost,
  diagCost,
  getEuclidianDistance,
  octileHeuristic,
  compare,
  pushUpdateF,
  pushUpdateH
}
