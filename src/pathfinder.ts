type Maze = string[][]
type Json = {level: number, start: number[], escape: number[], maze: Maze}
type Path = [number, number, string[], Set<string>];
type Queue = Path[]

const direction = ["D", "L", "R", "U"];
const directionRow = [1, 0, 0, -1];
const directionColumn = [0, -1, 1, 0]

const isValid = (row: number, column: number, maze: Maze, path: string[], disarmedTraps: Set<string>) => {
  return (
    row >= 0 &&
    column >= 0 &&
    (row < maze.length && column < maze[0].length  || path.includes("h")) && 
    (maze[row][column] === " " || maze[row][column] === "e" || disarmedTraps.has(`${row},${column}`))
  )
}

// Breadth-first search
export const findPath = (json: Json) => {
  const { start, escape, maze } = json
  let queue: Queue = [[start[0], start[1], [], new Set<string>()]]
  maze[start[0]][start[1]] = "o"

  while (queue.length > 0) {
    let [row, column, path, disarmedTraps]: Path = queue.shift()!
    if (row === escape[0] && column === escape[1]) {
      return path.filter((direction) => direction !== "h")
    }


    for (let i = 0; i < 4; i++) {
      const nextRow = row + directionRow[i]
      const nextColumn = column + directionColumn[i]

      if (maze[nextRow] && maze[nextRow][nextColumn] === "h" && !disarmedTraps.has(`${nextRow},${nextColumn}`)) {
        let newDisarmedTraps = new Set(disarmedTraps)
        newDisarmedTraps.add(`${nextRow},${nextColumn}`)
        queue.push([start[0], start[1], [...path, direction[i], "h"], newDisarmedTraps])
      } else if (isValid(nextRow, nextColumn, maze, path, disarmedTraps)) {
        queue.push([nextRow, nextColumn, [...path, direction[i]], disarmedTraps])
        maze[nextRow][nextColumn] = "o"
      }
    }
  }

  return []
}
