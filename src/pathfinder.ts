// Maze solver: finds the shortest action list (fewest Step + Rotate actions) that leads
// from the StartPoint to the EscapePoint, following the rules of the official tester.
//
// Rules (taken from the tester's own logic):
//  - Step: move 1..14 cells in a straight line (1 left, 2 right, 3 up, 4 down). The target cell
//    must be inside the outer walls or be the EscapePoint, and the step cannot cross a Wall.
//  - Trap (level 2+): touching a trap sends the player back to the StartPoint and the trap
//    disappears. We only ever land exactly on a trap, never jump over one, so the tester
//    behaves the same in every direction.
//  - Rotate (level 3): the inner 15x15 area consists of 9 districts of 5x5 cells (numbered
//    1..9 row by row). A district can be rotated left (counter-clockwise) or right (clockwise),
//    but not the one the player currently stands in. Walls and traps rotate with the district.
//
// Search: A* over (position, rotation of every district, removed traps). Rotations are only
// generated right before a step that passes through or lands in the rotated district. Any
// solution can be reordered like that without getting longer, so the result stays optimal
// while the search avoids rotating districts "just in case".

import type { MazeData, Position } from './xml2json.js'

export type StepDirection = 1 | 2 | 3 | 4 // left, right, up, down
export type RotateDirection = 1 | 2 // left (counter-clockwise), right (clockwise)

export type MazeAction =
  | { kind: 'step', direction: StepDirection, cellNumber: number }
  | { kind: 'rotate', district: number, direction: RotateDirection }

const SIZE = 17
const CELLS = SIZE * SIZE
const DISTRICT_SIZE = 5
const DISTRICT_CELLS = DISTRICT_SIZE * DISTRICT_SIZE
const DISTRICTS_PER_ROW = 3
const DISTRICT_COUNT = DISTRICTS_PER_ROW * DISTRICTS_PER_ROW
const ROTATION_STATES = 1 << (2 * DISTRICT_COUNT) // 2 bits per district
const MAX_CELL_NUMBER = 14
const TRAP_MIN_LEVEL = 2
const ROTATE_MIN_LEVEL = 3
const MAX_TRIGGERABLE_TRAPS = 20 // more traps than this are simply avoided like walls
const INFINITY = 1e9

const EXACT_SEARCH = { weight: 1, maxNodes: 3_000_000, maxMillis: 25_000 }
const FALLBACK_SEARCHES = [
  { weight: 2, maxNodes: 2_000_000, maxMillis: 10_000 },
  { weight: 5, maxNodes: 2_000_000, maxMillis: 10_000 },
]

const STEPS: { direction: StepDirection, dRow: number, dColumn: number }[] = [
  { direction: 4, dRow: 1, dColumn: 0 },
  { direction: 2, dRow: 0, dColumn: 1 },
  { direction: 1, dRow: 0, dColumn: -1 },
  { direction: 3, dRow: -1, dColumn: 0 },
]

// ---------------------------------------------------------------------------------------------
// Board geometry (0-based cell index = row * SIZE + column)

const rowOf = (cell: number) => Math.floor(cell / SIZE)
const columnOf = (cell: number) => cell % SIZE
const toCell = (position: Position) => (position.row - 1) * SIZE + (position.column - 1)

const isInside = (row: number, column: number) => row >= 1 && row <= SIZE - 2 && column >= 1 && column <= SIZE - 2

// district of every inner cell (-1 for the outer walls) and the cell's index inside the district
const districtOf = new Int8Array(CELLS).fill(-1)
const localOf = new Int8Array(CELLS)
const cellOfLocal = new Int16Array(DISTRICT_COUNT * DISTRICT_CELLS)
for (let row = 1; row <= SIZE - 2; row++) {
  for (let column = 1; column <= SIZE - 2; column++) {
    const cell = row * SIZE + column
    const district = Math.floor((row - 1) / DISTRICT_SIZE) * DISTRICTS_PER_ROW + Math.floor((column - 1) / DISTRICT_SIZE)
    const local = ((row - 1) % DISTRICT_SIZE) * DISTRICT_SIZE + ((column - 1) % DISTRICT_SIZE)
    districtOf[cell] = district
    localOf[cell] = local
    cellOfLocal[district * DISTRICT_CELLS + local] = cell
  }
}

// One "left" rotation, exactly as the tester does it: (row, column) -> (4 - column, row)
const rotateLocalLeft = (local: number) => {
  const row = Math.floor(local / DISTRICT_SIZE)
  const column = local % DISTRICT_SIZE
  return (DISTRICT_SIZE - 1 - column) * DISTRICT_SIZE + row
}

const rotationOf = (rotations: number, district: number) => (rotations >> (2 * district)) & 3
const withRotation = (rotations: number, district: number, rotation: number) =>
  (rotations & ~(3 << (2 * district))) | (rotation << (2 * district))

// ---------------------------------------------------------------------------------------------
// Maze model

type Model = {
  startCell: number
  escapeCell: number
  // item index in a district cell for every rotation: [(district * 4 + rotation) * 25 + local], -1 = empty
  itemAt: Int16Array
  itemTrapBit: number[] // 0 for walls, the trap's bit in the "removed traps" mask otherwise
  itemLocal: number[]
  itemDistrict: number[]
  // rotations allowed per district (bit k = k left-rotations). Rotations that give an identical
  // district are merged into the smallest one, so only those "representatives" are allowed.
  allowedRotations: number[]
  // cheapest way to turn a district from one representative rotation into another:
  // delta in left-rotations (0..3), indexed by [(district * 4 + from) * 4 + to]
  rotationDelta: Int8Array
  // lower bound on the remaining actions, indexed by reducedNode(cell, own district rotation)
  estimate: Int32Array
}

const rotationCost = (delta: number) => (delta === 0 ? 0 : delta === 2 ? 2 : 1)

const buildModel = (maze: MazeData): Model => {
  const trapsActive = maze.level >= TRAP_MIN_LEVEL
  const rotationsActive = maze.level >= ROTATE_MIN_LEVEL

  const itemTrapBit: number[] = []
  const itemLocal: number[] = []
  const itemDistrict: number[] = []
  const addItem = (position: Position, trapBit: number) => {
    const cell = toCell(position)
    if (!isInside(rowOf(cell), columnOf(cell))) return
    itemTrapBit.push(trapBit)
    itemLocal.push(localOf[cell] as number)
    itemDistrict.push(districtOf[cell] as number)
  }

  maze.walls.forEach(wall => addItem(wall, 0))
  let trapCount = 0
  if (trapsActive) {
    maze.traps.forEach(trap => {
      // traps beyond the limit are never touched, so for the search they behave like walls
      const trapBit = trapCount < MAX_TRIGGERABLE_TRAPS ? 1 << trapCount++ : 0
      addItem(trap, trapBit)
    })
  }

  const itemAt = new Int16Array(DISTRICT_COUNT * 4 * DISTRICT_CELLS).fill(-1)
  itemLocal.forEach((startLocal, item) => {
    const district = itemDistrict[item] as number
    let local = startLocal
    for (let rotation = 0; rotation < 4; rotation++) {
      itemAt[(district * 4 + rotation) * DISTRICT_CELLS + local] = item
      local = rotateLocalLeft(local)
    }
  })

  // merge rotations that produce the same district layout
  const allowedRotations: number[] = []
  const representative = new Int8Array(DISTRICT_COUNT * 4)
  for (let district = 0; district < DISTRICT_COUNT; district++) {
    const layouts: string[] = []
    let allowed = 0
    for (let rotation = 0; rotation < 4; rotation++) {
      let layout = ''
      for (let local = 0; local < DISTRICT_CELLS; local++) {
        const item = itemAt[(district * 4 + rotation) * DISTRICT_CELLS + local] as number
        layout += item < 0 ? '.' : itemTrapBit[item] ? `t${item}` : 'w'
      }
      const same = layouts.indexOf(layout)
      representative[district * 4 + rotation] = same >= 0 ? same : rotation
      if (same < 0 && (rotationsActive || rotation === 0)) allowed |= 1 << rotation
      layouts.push(layout)
    }
    allowedRotations.push(allowed)
  }

  const rotationDelta = new Int8Array(DISTRICT_COUNT * 16)
  for (let district = 0; district < DISTRICT_COUNT; district++) {
    for (let from = 0; from < 4; from++) {
      for (let to = 0; to < 4; to++) {
        let best = -1
        for (let target = 0; target < 4; target++) {
          if (representative[district * 4 + target] !== to) continue
          const delta = (target - from + 4) % 4
          if (best < 0 || rotationCost(delta) < rotationCost(best)) best = delta
        }
        rotationDelta[(district * 4 + from) * 4 + to] = best
      }
    }
  }

  const model: Model = {
    startCell: toCell(maze.start),
    escapeCell: toCell(maze.escape),
    itemAt,
    itemTrapBit,
    itemLocal,
    itemDistrict,
    allowedRotations,
    rotationDelta,
    estimate: new Int32Array(0),
  }
  model.estimate = buildEstimate(model)
  return model
}

// ---------------------------------------------------------------------------------------------
// The "reduced" maze
//
// Every district except the one the player stands in can be rotated at any time, so whether a
// cell can be reached only depends on (cell, rotation of the player's own district, removed traps).
// That is ~1200 states instead of millions, which gives us:
//  - an exact and instant "is there any way out?" check
//  - a strong lower bound for A*: the number of steps needed if rotations were free

// Calls visit(cell, rotation of the landing district, triggered trap bit) for every step.
// removedTraps < 0 means "relaxed": a trap can be walked over and can also be triggered.
const forEachReducedStep = (
  model: Model,
  cell: number,
  ownRotation: number,
  removedTraps: number,
  visit: (cell: number, rotation: number, triggeredTrap: number) => void,
) => {
  const ownDistrict = districtOf[cell] as number
  const validRotations = new Int8Array(DISTRICT_COUNT)
  for (const { dRow, dColumn } of STEPS) {
    validRotations.fill(15)
    for (let n = 1; n <= MAX_CELL_NUMBER; n++) {
      const row = rowOf(cell) + dRow * n
      const column = columnOf(cell) + dColumn * n
      if (row < 0 || row >= SIZE || column < 0 || column >= SIZE) break
      const target = row * SIZE + column
      if (target === model.escapeCell) {
        visit(target, 0, 0)
        break
      }
      if (!isInside(row, column)) break

      const district = districtOf[target] as number
      const candidates = district === ownDistrict
        ? 1 << ownRotation
        : (validRotations[district] as number) & (model.allowedRotations[district] as number)
      let passable = 0
      for (let rotation = 0; rotation < 4; rotation++) {
        if (!(candidates & (1 << rotation))) continue
        const item = model.itemAt[(district * 4 + rotation) * DISTRICT_CELLS + (localOf[target] as number)] as number
        const trapBit = item < 0 ? 0 : model.itemTrapBit[item] as number
        if (item >= 0 && !trapBit) continue // wall
        if (item < 0 || (removedTraps >= 0 && removedTraps & trapBit)) {
          passable |= 1 << rotation
          visit(target, rotation, 0)
        } else {
          visit(model.startCell, 0, trapBit)
          if (removedTraps < 0) {
            passable |= 1 << rotation
            visit(target, rotation, 0)
          }
        }
      }
      if (!passable) break
      if (district !== ownDistrict) validRotations[district] = passable
    }
  }
}

const reducedNode = (cell: number, rotation: number) => cell * 4 + rotation

// Lower bound for every (cell, own district rotation): steps to the EscapePoint when rotating
// is free and traps can be crossed. Never overestimates and never drops by more than the
// cost of an action, so A* stays optimal.
const buildEstimate = (model: Model) => {
  const incoming: number[][] = Array.from({ length: CELLS * 4 }, () => [])
  for (let cell = 0; cell < CELLS; cell++) {
    const district = districtOf[cell] as number
    if (district < 0 && cell !== model.startCell) continue
    for (let rotation = 0; rotation < 4; rotation++) {
      if (district < 0 ? rotation > 0 : !((model.allowedRotations[district] as number) & (1 << rotation))) continue
      const from = reducedNode(cell, rotation)
      forEachReducedStep(model, cell, rotation, -1, (toCell, toRotation) => {
        (incoming[reducedNode(toCell, toRotation)] as number[]).push(from)
      })
    }
  }

  const estimate = new Int32Array(CELLS * 4).fill(INFINITY)
  const goal = reducedNode(model.escapeCell, 0)
  estimate[goal] = 0
  const queue = [goal]
  for (let head = 0; head < queue.length; head++) {
    const to = queue[head] as number
    for (const from of incoming[to] as number[]) {
      if ((estimate[from] as number) !== INFINITY) continue
      estimate[from] = (estimate[to] as number) + 1
      queue.push(from)
    }
  }
  return estimate
}

// Exact check: removing a trap never makes anything unreachable (it only sends the player back
// to the start), so keep removing every reachable trap until the escape is reached or nothing changes.
const isSolvable = (model: Model) => {
  let removedTraps = 0
  while (true) {
    const seen = new Uint8Array(CELLS * 4)
    const queue = [reducedNode(model.startCell, 0)]
    seen[queue[0] as number] = 1
    let triggered = 0
    let escaped = false
    for (let head = 0; head < queue.length && !escaped; head++) {
      const node = queue[head] as number
      forEachReducedStep(model, Math.floor(node / 4), node % 4, removedTraps, (cell, rotation, trapBit) => {
        if (trapBit) {
          triggered |= trapBit
          return
        }
        if (cell === model.escapeCell) escaped = true
        const next = reducedNode(cell, rotation)
        if (!seen[next]) {
          seen[next] = 1
          queue.push(next)
        }
      })
    }
    if (escaped) return true
    if (!(triggered & ~removedTraps)) return false
    removedTraps |= triggered
  }
}

// ---------------------------------------------------------------------------------------------
// Search

const encodeState = (cell: number, rotations: number, removedTraps: number) =>
  (removedTraps * ROTATION_STATES + rotations) * CELLS + cell

const decodeState = (key: number) => {
  const cell = key % CELLS
  const rest = (key - cell) / CELLS
  const rotations = rest % ROTATION_STATES
  return { cell, rotations, removedTraps: (rest - rotations) / ROTATION_STATES }
}

const heuristic = (model: Model, cell: number, rotations: number) => {
  const district = districtOf[cell] as number
  return model.estimate[reducedNode(cell, district < 0 ? 0 : rotationOf(rotations, district))] as number
}

type Emit = (cell: number, rotations: number, removedTraps: number, cost: number) => void

// cell state in a district rotation: 0 = free, 1 = wall, 2 = active trap
const cellState = (model: Model, cell: number, rotation: number, removedTraps: number) => {
  const item = model.itemAt[((districtOf[cell] as number) * 4 + rotation) * DISTRICT_CELLS + (localOf[cell] as number)] as number
  if (item < 0) return 0
  const trapBit = model.itemTrapBit[item] as number
  if (!trapBit) return 1
  return removedTraps & trapBit ? 0 : 2
}

const expand = (model: Model, cell: number, rotations: number, removedTraps: number, emit: Emit) => {
  const ownDistrict = districtOf[cell] as number
  const validRotations = new Int8Array(DISTRICT_COUNT)
  const passed: number[] = []

  // every combination of rotations for the districts the step only passes through
  // (landingDistrict is handled by the caller)
  const emitWithPassed = (index: number, landingDistrict: number, nextRotations: number, cost: number, target: number, nextRemoved: number) => {
    if (index === passed.length) {
      emit(target, nextRotations, nextRemoved, cost)
      return
    }
    const district = passed[index] as number
    const current = rotationOf(rotations, district)
    const valid = (validRotations[district] as number) & (model.allowedRotations[district] as number)
    if (district === landingDistrict || valid & (1 << current)) {
      // no need to rotate now: a later rotation can always happen right before it is needed
      emitWithPassed(index + 1, landingDistrict, nextRotations, cost, target, nextRemoved)
      return
    }
    for (let rotation = 0; rotation < 4; rotation++) {
      if (!(valid & (1 << rotation))) continue
      const delta = model.rotationDelta[(district * 4 + current) * 4 + rotation] as number
      emitWithPassed(index + 1, landingDistrict, withRotation(nextRotations, district, rotation), cost + rotationCost(delta), target, nextRemoved)
    }
  }

  for (const { dRow, dColumn } of STEPS) {
    validRotations.fill(15)
    passed.length = 0
    for (let n = 1; n <= MAX_CELL_NUMBER; n++) {
      const row = rowOf(cell) + dRow * n
      const column = columnOf(cell) + dColumn * n
      if (row < 0 || row >= SIZE || column < 0 || column >= SIZE) break
      const target = row * SIZE + column

      if (target === model.escapeCell) {
        emitWithPassed(0, -1, rotations, 1, target, removedTraps)
        break
      }
      if (!isInside(row, column)) break

      const district = districtOf[target] as number
      const candidates = district === ownDistrict
        ? 1 << rotationOf(rotations, district)
        : (validRotations[district] as number) & (model.allowedRotations[district] as number)

      // land on the target cell (possibly after rotating its district)
      let freeRotations = 0
      for (let rotation = 0; rotation < 4; rotation++) {
        if (!(candidates & (1 << rotation))) continue
        const state = cellState(model, target, rotation, removedTraps)
        if (state === 1) continue
        if (state === 0) freeRotations |= 1 << rotation
        const current = rotationOf(rotations, district)
        const cost = 1 + rotationCost(model.rotationDelta[(district * 4 + current) * 4 + rotation] as number)
        const nextRotations = withRotation(rotations, district, rotation)
        if (state === 0) {
          emitWithPassed(0, district, nextRotations, cost, target, removedTraps)
        } else {
          const item = model.itemAt[(district * 4 + rotation) * DISTRICT_CELLS + (localOf[target] as number)] as number
          emitWithPassed(0, district, nextRotations, cost, model.startCell, removedTraps | (model.itemTrapBit[item] as number))
        }
      }

      // keep going only through free cells
      if (!freeRotations) break
      if (district !== ownDistrict) {
        validRotations[district] = freeRotations
        if (passed.indexOf(district) < 0) passed.push(district)
      }
    }
  }
}

const search = (model: Model, weight: number, maxNodes: number, deadline: number): number[] | null => {
  const nodeKey: number[] = []
  const nodeParent: number[] = []
  const nodeCost: number[] = []
  const closed: boolean[] = []
  const nodeByKey = new Map<number, number>()
  const buckets: number[][] = []
  let minBucket = 0

  const push = (node: number, cell: number, rotations: number) => {
    const estimate = heuristic(model, cell, rotations)
    if (estimate >= INFINITY) return
    const priority = (nodeCost[node] as number) + weight * estimate
    const bucket = buckets[priority] ?? (buckets[priority] = [])
    bucket.push(node)
    if (priority < minBucket) minBucket = priority
  }

  const addNode = (key: number, parent: number, cost: number) => {
    const node = nodeKey.length
    nodeKey.push(key)
    nodeParent.push(parent)
    nodeCost.push(cost)
    closed.push(false)
    nodeByKey.set(key, node)
    return node
  }

  const startNode = addNode(encodeState(model.startCell, 0, 0), -1, 0)
  push(startNode, model.startCell, 0)

  let expanded = 0
  let current = -1
  const emit: Emit = (cell, rotations, removedTraps, stepCost) => {
    const key = encodeState(cell, rotations, removedTraps)
    const cost = (nodeCost[current] as number) + stepCost
    const known = nodeByKey.get(key)
    if (known === undefined) {
      push(addNode(key, current, cost), cell, rotations)
    } else if (!closed[known] && cost < (nodeCost[known] as number)) {
      nodeCost[known] = cost
      nodeParent[known] = current
      push(known, cell, rotations)
    }
  }

  while (true) {
    while (minBucket < buckets.length && !(buckets[minBucket] as number[] | undefined)?.length) minBucket++
    if (minBucket >= buckets.length) return null // no solution

    current = (buckets[minBucket] as number[]).pop() as number
    if (closed[current]) continue
    closed[current] = true

    const { cell, rotations, removedTraps } = decodeState(nodeKey[current] as number)
    if (cell === model.escapeCell) {
      const path: number[] = []
      for (let node = current; node >= 0; node = nodeParent[node] as number) path.push(nodeKey[node] as number)
      return path.reverse()
    }

    if (nodeKey.length > maxNodes) return null
    if (++expanded % 4096 === 0 && Date.now() > deadline) return null

    expand(model, cell, rotations, removedTraps, emit)
  }
}

// ---------------------------------------------------------------------------------------------
// Turning the state path back into actions

const toActions = (model: Model, path: number[]): MazeAction[] => {
  const actions: MazeAction[] = []
  for (let i = 1; i < path.length; i++) {
    const from = decodeState(path[i - 1] as number)
    const to = decodeState(path[i] as number)

    for (let district = 0; district < DISTRICT_COUNT; district++) {
      const before = rotationOf(from.rotations, district)
      const after = rotationOf(to.rotations, district)
      if (before === after) continue
      const delta = model.rotationDelta[(district * 4 + before) * 4 + after] as number
      if (delta === 3) {
        actions.push({ kind: 'rotate', district: district + 1, direction: 2 })
      } else {
        for (let turn = 0; turn < delta; turn++) actions.push({ kind: 'rotate', district: district + 1, direction: 1 })
      }
    }

    // the step's target: either the new position, or the trap that sent the player back to the start
    let target = to.cell
    const triggeredTrap = to.removedTraps & ~from.removedTraps
    if (triggeredTrap) {
      const item = model.itemTrapBit.indexOf(triggeredTrap)
      const district = model.itemDistrict[item] as number
      let local = model.itemLocal[item] as number
      for (let turn = 0; turn < rotationOf(to.rotations, district); turn++) local = rotateLocalLeft(local)
      target = cellOfLocal[district * DISTRICT_CELLS + local] as number
    }

    const dRow = rowOf(target) - rowOf(from.cell)
    const dColumn = columnOf(target) - columnOf(from.cell)
    const direction: StepDirection = dColumn < 0 ? 1 : dColumn > 0 ? 2 : dRow < 0 ? 3 : 4
    actions.push({ kind: 'step', direction, cellNumber: Math.abs(dRow) + Math.abs(dColumn) })
  }
  return actions
}

export const findPath = (maze: MazeData): MazeAction[] => {
  const model = buildModel(maze)
  if (!isSolvable(model)) return []

  const started = Date.now()
  const exact = search(model, EXACT_SEARCH.weight, EXACT_SEARCH.maxNodes, started + EXACT_SEARCH.maxMillis)
  if (exact) return toActions(model, exact)

  // the maze is too big for the exact search: settle for a (probably) longer solution
  for (const fallback of FALLBACK_SEARCHES) {
    const path = search(model, fallback.weight, fallback.maxNodes, Date.now() + fallback.maxMillis)
    if (path) return toActions(model, path)
  }
  return []
}
