export const xml2json = (xml: string) => {
    const splittedXml = xml.split('\n')
    // base grid with walls and empty spaces
    const maze = [
        ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'x'],
        ['x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x', 'x'],
   ]
    const result = {level: 0, start: [-1, -1], escape: [-1, -1], maze}

    let state = ''
    let row = -1
    let column = -1

    const lvlRegExp = /<level>(\d+)<\/level>/i
    const startPointRegExp = /<startpoint>/i
    const escapePointRegExp = /<escapepoint>/i
    const wallRegExp = /<wall>/i
    const trapRegExp = /<trap>/i
    const rowRegExp = /<row>(\d+)<\/row>/i
    const columnRegExp = /<column>(\d+)<\/column>/i

    splittedXml.forEach(line => {
        const levelMatch = line.match(lvlRegExp)
        const startingPointMatch = line.match(startPointRegExp)
        const escapePointMatch = line.match(escapePointRegExp)
        const wallMatch = line.match(wallRegExp)
        const trapMatch = line.match(trapRegExp)

        if (levelMatch) {
            result.level = +levelMatch[1]
        }

        if (startingPointMatch) {
            state = 's'
        } else if (escapePointMatch) {
            state = 'e'
        } else if (wallMatch) {
            state = 'x'
        } else if (trapMatch) {
            state = 'h'
        }

        const rowMatch = line.match(rowRegExp)
        const columnMatch = line.match(columnRegExp)

        if (rowMatch) {
            row = +rowMatch[1] - 1
        }

        if (columnMatch) {
            column = +columnMatch[1] - 1
        }

        if (state && row >= 0 && column >= 0) {
            result.maze[row][column] = state

            if (state === 's') {
                result.start = [row, column]
            }
            if (state === 'e') {
                result.escape = [row, column]
            }

            row = -1
            column = -1
            state = ''
        }
    })
    return result
}
