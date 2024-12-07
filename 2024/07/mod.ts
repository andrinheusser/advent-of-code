import { asyncReduce, lines, timedSolution } from "../../utils/utils.ts";

await timedSolution(1, () => {
  return asyncReduce(
    lines("input.txt"),
    (acc, line) => {
      const [result, ...terms] = parseLine(line);
      return (
        acc +
        (isValid({
          result,
          terms,
          operations: [(a, b) => a + b, (a, b) => a * b],
        })
          ? result
          : 0)
      );
    },
    0
  );
});
await timedSolution(2, () => {
  return asyncReduce(
    lines("input.txt"),
    (acc, line) => {
      const [result, ...terms] = parseLine(line);
      return (
        acc +
        (isValid({
          result,
          terms,
          operations: [(a, b) => a + b, (a, b) => a * b, (a, b) => +`${a}${b}`],
        })
          ? result
          : 0)
      );
    },
    0
  );
});

function parseLine(line: string): number[] {
  return line
    .split(": ")
    .map((v) => (v.includes(" ") ? v.split(" ") : v))
    .flat()
    .map(Number);
}

function isValid({
  result,
  terms,
  operations,
}: {
  result: number;
  terms: number[];
  operations: ((a: number, b: number) => number)[];
}): boolean {
  const queue = terms.reverse();
  let results: number[] = [queue.pop()!];

  while (queue.length) {
    const current = queue.pop();
    if (!current) break;
    results = results
      .map((other) => operations.map((op) => op(other, current)))
      .flat()
      .filter((r) => r <= result);
    for (let i = 0; i < results.length; i++) {
      if (results[i] === result) return true;
    }
  }
  return results.some((r) => r === result);
}
