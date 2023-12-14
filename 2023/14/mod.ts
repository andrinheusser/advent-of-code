import { fileContents, timedSolution } from "../utils.ts";

await timedSolution(1, async () => {
  const bounds: Array<number> = [];
  let line = 0, score = 0, rockCount = 0;
  for await (const [char, i] of fileContents("./input.txt")) {
    switch (char) {
      case "\n":
        line++;
        break;
      case ".":
        if (line === 0) bounds[i] = -1;
        break;
      case "#":
        bounds[line === 0 ? i : i % (bounds.length + 1)] = line;
        break;
      case "O": {
        const boundsIndex = line === 0 ? i : i % (bounds.length + 1);
        const obstacleIndex = bounds[boundsIndex];
        const slideTo = obstacleIndex === undefined ? 0 : obstacleIndex + 1;
        bounds[boundsIndex] = slideTo;
        score += slideTo;
        rockCount++;
        break;
      }
    }
  }
  return Math.abs(score - rockCount * line);
});

await timedSolution(2, async () => {
  return await Promise.resolve(1);
});
