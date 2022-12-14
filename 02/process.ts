const input = await Deno.readTextFile("input.txt");

const lines = input.split("\r\n").filter((l) => !!l);

type Outcome = "win" | "lose" | "draw";
type Shape = "rock" | "paper" | "scissors";

const shapeMap: Record<string, Shape> = {
  A: "rock",
  B: "paper",
  C: "scissors",
  X: "rock",
  Y: "paper",
  Z: "scissors",
};
const outcomeMap: Record<string, Outcome> = {
  X: "lose",
  Y: "draw",
  Z: "win",
};

const matchShape = (shape: string): Shape => shapeMap[shape];

const shapeValues: Record<Shape, number> = {
  rock: 1,
  paper: 2,
  scissors: 3,
};
const outcomeValues: Record<Outcome, number> = {
  win: 6,
  lose: 0,
  draw: 3,
};

const decideOutcome = (us: Shape, them: Shape): Outcome => {
  if (us === them) return "draw";
  if (us === "rock" && them === "scissors") return "win";
  if (shapeValues[us] === shapeValues[them] + 1) return "win";
  return "lose";
};

const winShape = (shape: Shape): Shape => {
  if (shape === "scissors") return "rock";
  return Object.keys(shapeValues)[shapeValues[shape]] as Shape;
};
const loseShape = (shape: Shape): Shape => {
  if (shape === "rock") return "scissors";
  return Object.keys(shapeValues)[shapeValues[shape] - 2] as Shape;
};

const chooseShapeForOutcome = (outcome: Outcome, them: Shape): Shape => {
  if (outcome === "win") return winShape(them);
  if (outcome === "lose") return loseShape(them);
  return them;
};

const scoreRound = (myShape: Shape, outcome: Outcome) =>
  shapeValues[myShape] + outcomeValues[outcome];

const part1 = () =>
  lines.reduce((acc, line) => {
    const [oppChar, myChar] = line.split(" ");

    const oppShape = matchShape(oppChar);
    const myShape = matchShape(myChar);

    return acc + scoreRound(myShape, decideOutcome(myShape, oppShape));
  }, 0);

const part2 = () =>
  lines.reduce((acc, line) => {
    const [oppChar, outcomeChar] = line.split(" ");
    const oppShape = matchShape(oppChar);
    const outcome = outcomeMap[outcomeChar];
    const myShape = chooseShapeForOutcome(outcome, oppShape);
    return acc + scoreRound(myShape, outcome);
  }, 0);

console.log("part 1 ", part1());
console.log("part 2 ", part2());
