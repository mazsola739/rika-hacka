/* Actions RFC
<Actions>
    <Step>
        <Direction>INTEGER 1 (left), 2 (right), 3 (up) or 4 (down)</Direction>
        <CellNumber>INTEGER 1-14</CellNumber>
    </Step>
    <Rotate>
        <District>INTEGER 1-9</District>
        <Direction>INTEGER 1 (left) or 2 (right)</Direction>
    </Rotate>
</Actions>
*/
type Steps = string[]
type Rotations = string[]

const generateActions = (steps: Steps, rotations: Rotations) =>
`<Actions>
${steps && steps.map(step => step)}
${rotations ? rotations.map(rotation => rotation) +
'</Actions>' : '</Actions>'}
`

    const generateSteps = (direction: string, amount: number) =>
`   <Step>
        <Direction>${direction === 'left' ? 1 : direction === 'right' ? 2 : direction === 'up' ? 3 : 4}</Direction>
        <CellNumber>${amount}</CellNumber>
    </Step>`

    const generateRotations = (district: number, direction: string) =>
`   <Rotate>
        <District>${district}</District>
        <Direction>${direction === 'left' ? 1 : 2}</Direction>
    </Rotate>`

export const json2xml = (json: string) => {
    // TODO generate the right steps and rotations
    const result = generateActions([generateSteps('right', 1)], [])

    return result
}

console.log(json2xml('asd'))
