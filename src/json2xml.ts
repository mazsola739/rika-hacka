type Steps = [string, number][]

const directionMap: { [key: string]: number } = {
  "L": 1,
  "R": 2,
  "U": 3,
  "D": 4
}

const getStepsFromPath = (steps: string[]): Steps => {
  if (steps.length === 0) return []

  let result: Steps = []
  let currentStep = steps[0]
  let count = 1

  for (let i = 1; i < steps.length; i++) {
    if (steps[i] === currentStep) {
      count++
    } else {
      result.push([currentStep, count])
      currentStep = steps[i]
      count = 1
    }
  }
  result.push([currentStep, count])

  return result
}

const generateXmlSteps = (direction: string, amount: number) => `
  <Step>
     <Direction>${directionMap[direction]}</Direction>
     <CellNumber>${amount}</CellNumber>
  </Step>`

const generateXmlActions = (steps: Steps) =>
  `<Actions>
    ${steps.map(([direction, amount]) => generateXmlSteps(direction, amount)).join("\n")}
  </Actions>`

export const json2xml = (array: string[]) => {
  const steps = getStepsFromPath(array)
  const result = generateXmlActions(steps)

  return result
}
