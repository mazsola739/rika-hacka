// Turns the solver's action list into the Actions XML the tester expects:
//   <Step>   Direction: 1 left, 2 right, 3 up, 4 down  | CellNumber: 1-14
//   <Rotate> District: 1-9                             | Direction: 1 left, 2 right

import type { MazeAction } from './pathfinder.js'

const actionToXml = (action: MazeAction) =>
  action.kind === 'step'
    ? [
        '  <Step>',
        `    <Direction>${action.direction}</Direction>`,
        `    <CellNumber>${action.cellNumber}</CellNumber>`,
        '  </Step>',
      ].join('\n')
    : [
        '  <Rotate>',
        `    <District>${action.district}</District>`,
        `    <Direction>${action.direction}</Direction>`,
        '  </Rotate>',
      ].join('\n')

export const json2xml = (actions: MazeAction[]): string =>
  ['<Actions>', ...actions.map(actionToXml), '</Actions>'].join('\n')
