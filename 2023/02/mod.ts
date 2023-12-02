import { loadFile, splitLines, timedSolution } from "../utils.ts";

type CubeColor = "green" | "blue" | "red";

const parseGames = (lines: string[]) =>
  lines.map((line) => {
    const [gameString, setsString] = line.split(":");
    const [_game, gameNumber] = gameString.split(" ");
    const sets = setsString.trim().split(";").map((set) =>
      set.split(",").map((s) => s.trim()).map<
        { count: number; color: CubeColor }
      >((s) => {
        const [count, color] = s.split(" ") as [string, CubeColor];
        return { count: Number(count), color };
      })
    );
    return { id: Number(gameNumber), sets };
  });

await timedSolution(1, async () => {
  const max: Record<CubeColor, number> = {
    "green": 13,
    "red": 12,
    "blue": 14,
  };
  const games = await loadFile(true).then(splitLines).then(parseGames);
  return games.filter((game) =>
    game.sets.every((set) =>
      set.every(({ count, color }) => count <= max[color])
    )
  ).reduce((a, b) => a + b.id, 0);
});

await timedSolution(2, async () => {
  const games = await loadFile(true).then(splitLines).then(parseGames);
  return games.map((game) => {
    return {
      ...game,
      minCubeCounts: game.sets.reduce<
        { "red": number; "green": number; "blue": number }
      >((acc, set) => {
        for (const { color, count } of set) {
          acc[color] = Math.max(acc[color], count);
        }
        return acc;
      }, { "red": 0, "green": 0, "blue": 0 }),
    };
  }).reduce(
    (sum, game) =>
      sum +
      game.minCubeCounts.blue * game.minCubeCounts.green *
        game.minCubeCounts.red,
    0,
  );
});
