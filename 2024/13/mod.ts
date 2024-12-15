import { timedSolution } from "../../utils/utils.ts";

type Coords = [number, number];

await timedSolution(1, async () => {
  const input = await parseInput();

  return input.reduce<number>((acc, curr) => {
    const cost = findPath(curr["Prize"], [curr["A"], curr["B"]]);
    return acc + (cost === Infinity ? 0 : cost);
  }, 0);
});
await timedSolution(2, async () => {
  const input = await parseInput();
  const add = 10000000000000;

  return input.reduce<number>((acc, curr) => {
    return (
      acc +
      useMath([curr["Prize"][0] + add, curr["Prize"][1] + add], {
        a: curr["A"],
        b: curr["B"],
      })
    );
  }, 0);
});

function isGreater(a: Coords, b: Coords) {
  return a[0] > b[0] || a[1] > b[1];
}
async function parseInput(fileName = "input.txt") {
  return await Deno.readTextFile(fileName).then((res) =>
    res.split("\n\n").map((set) => {
      return set.split("\n").reduce<Record<string, Coords>>((acc, curr) => {
        const [left, right] = curr.split(": ");
        const [x, y] = right.split(", ");
        return {
          ...acc,
          [left === "Prize" ? left : left.slice(-1)]: [
            +x.slice(2),
            +y.slice(2),
          ],
        };
      }, {});
    })
  );
}

function useMath(target: Coords, { a, b }: { a: Coords; b: Coords }) {
  const divisor = a[0] * b[1] - a[1] * b[0],
    timesA = Math.floor((target[0] * b[1] - target[1] * b[0]) / divisor),
    timesB = Math.floor((target[1] * a[0] - target[0] * a[1]) / divisor),
    meets =
      a[0] * timesA + b[0] * timesB === target[0] &&
      a[1] * timesA + b[1] * timesB === target[1];

  return meets ? 3 * timesA + timesB : 0;
}

function step(step: Coords, times: number): Coords {
  return [step[0] * times, step[1] * times];
}

function checkOption(target: Coords, option: Coords) {
  const times = target[0] / option[0];
  return target[1] / option[1] === times ? times : Infinity;
}

export function findPath(target: Coords, options: Coords[], cap = 100) {
  const pivotsSTartingWithA: Coords[] = [];

  const stepA = options[0];

  for (let i = 0; i < Infinity; i++) {
    const nextA = step(stepA, i);
    const nextAOk = !isGreater(nextA, target);
    if (nextAOk) {
      pivotsSTartingWithA.push(nextA);
    } else {
      break;
    }
  }

  const startA = pivotsSTartingWithA
    .map((p, times) => {
      return {
        times,
        timesB: checkOption([target[0] - p[0], target[1] - p[1]], options[1]),
      };
    })
    .filter((p) => p.timesB !== Infinity)
    .map((p) =>
      p.times > cap && p.timesB > cap ? Infinity : p.times * 3 + p.timesB
    );

  return Math.min(...startA);
}
