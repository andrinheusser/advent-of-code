import { timedSolution } from "../../utils/utils.ts";

function blink(start: number): number[] {
  if (start === 0) {
    return [1];
  } else if (start.toString().length % 2 == 0) {
    const startStr = start.toString();
    return [
      +startStr.slice(0, startStr.length / 2),
      +startStr.slice(startStr.length / 2),
    ];
  }
  return [start * 2024];
}

await timedSolution(1, async () => {
  let input = await Deno.readTextFile("input.txt").then((res) =>
    res.split(" ").map(Number)
  );

  for (let i = 0; i < 25; i++) {
    input = input.map((n) => blink(n)).flat();
  }

  return input.length;
});

type State = Map<number, number>;

await timedSolution(2, async () => {
  const input = await Deno.readTextFile("input.txt").then((res) =>
    res.split(" ").map(Number)
  );

  let state: State = new Map(input.map((n) => [n, 1]));

  for (let i = 0; i < 75; i++) {
    const results = new Map<number, number>();
    for (const [factor, times] of state) {
      const result = blink(factor);
      for (const r of result) {
        results.set(r, (results.get(r) ?? 0) + times);
      }
    }
    state = results;
  }

  let stones = 0;
  for (const [_factor, times] of state) {
    stones += times;
  }
  return stones;
});
