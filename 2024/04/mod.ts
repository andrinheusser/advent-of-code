import { lines, timedSolution } from "../../utils/utils.ts";

await timedSolution(1, async () => {
  const grid = await Deno.readTextFile("input.txt").then((text) =>
    text.split("\n").map((line) => line.split(""))
  );

  const horizontal = grid.map((line) => line.join(""));
  const vertical = Array.from({ length: grid[0].length }, (_, i) =>
    grid.map((line) => line[i]).join("")
  );
  const diagonal = Array.from(
    { length: grid.length + grid[0].length - 1 },
    (_, i) =>
      Array.from(
        { length: Math.min(i + 1, grid.length, grid[0].length) },
        (_, j) => grid[j][i - j]
      ).join("")
  );
  const antidiagonal = Array.from(
    { length: grid.length + grid[0].length - 1 },
    (_, i) =>
      Array.from(
        { length: Math.min(i + 1, grid.length, grid[0].length) },
        (_, j) => grid[j][grid[0].length - 1 - i + j]
      ).join("")
  );

  const regex = /(?=(XMAS|SAMX))/g;
  const all = [horizontal, vertical, diagonal, antidiagonal].join(",");
  const matches = [...all.matchAll(regex)].map((match) => match[1]);
  return matches.length;
});

await timedSolution(2, async () => {
  let previousLines: string[][] = [],
    y = 0,
    found = 0;
  function other(input: "M" | "S"): "M" | "S" {
    return input === "M" ? "S" : "M";
  }

  for await (const line of lines("input.txt")) {
    const chars = line.split("");

    for (let x = 0; x < chars.length; x++) {
      const bl = chars[x];
      if (bl === "M" || bl === "S") {
        const brX = x + 2;
        if (brX > chars.length || y < 2) continue;
        const br = chars[brX];
        const a = previousLines[0][x + 1];
        const tl = previousLines[1][x];
        const tr = previousLines[1][x + 2];
        if (
          a === "A" &&
          tr === other(bl) &&
          ((tl === "S" && br === "M") || (tl === "M" && br === "S"))
        ) {
          found++;
        }
      }
    }

    y++;
    previousLines = [chars, ...previousLines].slice(0, 2);
  }
  return found;
});
