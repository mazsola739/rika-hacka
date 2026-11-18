// Parses the maze XML handed over by the tester.
// The parser works on the whole string (not line by line), so it does not depend on
// how the XML is formatted: one item per line, everything on one line, extra spaces, etc.

export type Position = { row: number, column: number } // 1-based, exactly as in the XML

export type MazeData = {
  level: number
  start: Position
  escape: Position
  walls: Position[]
  traps: Position[]
}

const readNumber = (xml: string, tag: string): number | null => {
  const match = new RegExp(`<${tag}>\\s*(\\d+)\\s*</${tag}>`, 'i').exec(xml)
  return match && match[1] !== undefined ? Number(match[1]) : null
}

const readPosition = (xml: string): Position | null => {
  const row = readNumber(xml, 'Row')
  const column = readNumber(xml, 'Column')
  return row === null || column === null ? null : { row, column }
}

const readItems = (xml: string, tag: string): Position[] => {
  const items: Position[] = []
  const itemRegExp = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'gi')
  let match = itemRegExp.exec(xml)
  while (match) {
    const position = readPosition(match[1] ?? '')
    if (position) items.push(position)
    match = itemRegExp.exec(xml)
  }
  return items
}

export const xml2json = (xml: string): MazeData => {
  const start = readItems(xml, 'StartPoint')[0]
  const escape = readItems(xml, 'EscapePoint')[0]
  if (!start || !escape) {
    throw new Error('The maze xml must contain a StartPoint and an EscapePoint!')
  }

  const insideItemsMatch = /<InsideItems>([\s\S]*?)<\/InsideItems>/i.exec(xml)
  const insideItems = insideItemsMatch ? insideItemsMatch[1] ?? '' : ''

  return {
    level: readNumber(xml, 'Level') ?? 1,
    start,
    escape,
    // The tester keeps walls first, then traps (in xml order). We keep the same order.
    walls: readItems(insideItems, 'Wall'),
    traps: readItems(insideItems, 'Trap'),
  }
}
