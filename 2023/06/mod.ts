import { loadFile, splitLines, timedSolution } from "../utils.ts";

const numberRegex = /\d+/g;

const solveRace = (
  { time, distance: distanceRecord }: { time: number; distance: number },
) => {
  const halfTime = Math.floor(time / 2) + 1;
  let testTime = halfTime;
  let currentRecord = (time - testTime) * testTime;
  while (currentRecord > distanceRecord) {
    testTime++;
    currentRecord = (time - testTime) * testTime;
  }
  return (testTime - halfTime) * 2 + (time % 2 === 0 ? 1 : 0);
};

await timedSolution(1, async () => {
  const data = await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => line.match(numberRegex)!.map(Number))
  ).then((values) => {
    return values[0].reduce<{ time: number; distance: number }[]>(
      (acc, cur, i) => {
        acc.push({ time: cur, distance: values[1][i] });
        return acc;
      },
      [],
    );
  });
  return data.reduce((acc, cur) => {
    return acc * solveRace(cur);
  }, 1);
});

await timedSolution(2, async () => {
  const data = await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) =>
      Number(line.match(numberRegex)!.reduce((acc, cur) => acc + cur, ""))
    )
  ).then((values) => {
    return { time: values[0], distance: values[1] };
  });
  return solveRace(data);
});
