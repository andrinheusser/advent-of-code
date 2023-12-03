import { loadFile, splitLines, timedSolution } from "../utils.ts";

function isSymbol(s: string | undefined) {
  return !!s && s !== "." && isNaN(Number(s));
}

await timedSolution(1, async () => {
  const data = await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => line.split(""))
  );
  const partNumbers = [];
  let currentPartNumber:
    | {
      value: string;
      hasSymbol: boolean;
    }
    | undefined;
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      const char = data[y][x];

      if (!isNaN(Number(char))) {
        if (!currentPartNumber) {
          currentPartNumber = {
            value: char,
            hasSymbol: false,
          };
        } else {
          currentPartNumber.value += char;
        }

        if (!currentPartNumber.hasSymbol) {
          currentPartNumber.hasSymbol = [
            data[y - 1]?.[x],
            data[y - 1]?.[x + 1],
            data[y][x + 1],
            data[y + 1]?.[x + 1],
            data[y + 1]?.[x],
            data[y + 1]?.[x - 1],
            data[y][x - 1],
            data[y - 1]?.[x - 1],
          ].some(isSymbol);
        }
      } else {
        if (currentPartNumber?.hasSymbol) {
          partNumbers.push(Number(currentPartNumber.value));
          currentPartNumber = undefined;
        } else {
          if (!isNaN(Number(data[y][x + 1]))) {
            currentPartNumber = undefined;
          }
        }
      }
    }
  }
  return partNumbers.reduce((a, b) => a + b, 0);
});

await timedSolution(2, async () => {
  const data = await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => line.split(""))
  );
  type PartNumber = {
    value: string;
    gears: Set<string>;
  };
  const partNumbers = [];
  let currentPartNumber:
    | PartNumber
    | undefined;
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      const char = data[y][x];

      if (!isNaN(Number(char))) {
        if (!currentPartNumber) {
          currentPartNumber = {
            value: char,
            gears: new Set(),
          };
        } else {
          currentPartNumber.value += char;
        }

        [
          [y - 1, x],
          [y - 1, x + 1],
          [y, x + 1],
          [y + 1, x + 1],
          [y + 1, x],
          [y + 1, x - 1],
          [y, x - 1],
          [y - 1, x - 1],
        ].filter(([y, x]) => data[y]?.[x] === "*").map(([y, x]) => `${y},${x}`)
          .forEach((gear) => currentPartNumber?.gears.add(gear));
      } else {
        if (currentPartNumber?.gears.size) {
          partNumbers.push(currentPartNumber);
          currentPartNumber = undefined;
        } else {
          currentPartNumber = undefined;
        }
      }
    }
  }
  const gears = new Map<string, Array<number>>();
  partNumbers.forEach((part) =>
    Array.from(part.gears).forEach((gear) =>
      gears.set(gear, [...gears.get(gear) || [], Number(part.value)])
    )
  );

  return Array.from(gears.values()).filter((values) => values.length === 2)
    .reduce((a, b) => a + b[0] * b[1], 0);
});
