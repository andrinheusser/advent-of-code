const input = await Deno.readTextFile("input.txt");

const lines = input.split("\r\n").filter((l) => !!l);

const WIN = 6;
const LOSS = 0;
const DRAW = 3;

const ROCK = 1;
const PAPER = 2;
const SCISSOR = 3;

const NEEDSLOSS = 1;
const NEEDSDRAW = 2;
const NEEDSWIN = 3;

const shapes: Record<string, number> = {
  A: ROCK,
  B: PAPER,
  C: SCISSOR,
  X: ROCK,
  Y: PAPER,
  Z: SCISSOR,
};

const chooseShape = (oppShape: number, outcome: number) => {
  if (outcome === NEEDSWIN) {
    if (oppShape === ROCK) return PAPER;
    if (oppShape === PAPER) return SCISSOR;
    if (oppShape === SCISSOR) return ROCK;
  }
  if (outcome === NEEDSDRAW) {
    if (oppShape === ROCK) return ROCK;
    if (oppShape === PAPER) return PAPER;
    if (oppShape === SCISSOR) return SCISSOR;
  }
  if (outcome === NEEDSLOSS) {
    if (oppShape === ROCK) return SCISSOR;
    if (oppShape === PAPER) return ROCK;
    if (oppShape === SCISSOR) return PAPER;
  }
  return 0;
};

const scoreRound = (oppShape: number, myShape: number) => {
  let score = myShape;
  if (oppShape === myShape) score += DRAW;
  if (oppShape === ROCK && myShape === SCISSOR) score += LOSS;
  if (oppShape === ROCK && myShape === PAPER) score += WIN;
  if (oppShape === PAPER && myShape === SCISSOR) score += WIN;
  if (oppShape === PAPER && myShape === ROCK) score += LOSS;
  if (oppShape === SCISSOR && myShape === ROCK) score += WIN;
  if (oppShape === SCISSOR && myShape === PAPER) score += LOSS;
  return score;
};

let total = 0;
for (let line of lines) {
  const [oppShape, outcome] = line.split(" ").map((s) => shapes[s]);
  const result = scoreRound(oppShape, chooseShape(oppShape, outcome));
  if (result > 0) {
    total += result;
  }
}

console.log({ total });
