import { loadFile, splitLines, timedSolution } from "../utils.ts";

type Pattern = {
  data: string[];
  wasRotated: boolean;
};

const compareLines = (
  a: string,
  b: string,
  allowSmudges: number,
  smudges = 0,
) =>
  a.split("").every((char, i) => char === b[i] || smudges++ <= allowSmudges)
    ? smudges
    : Infinity;

function findReflection(
  { data, wasRotated }: Pattern,
  repairSmudges = 0,
) {
  for (let i = 0; i < data.length - 1; i++) {
    let smudges = compareLines(data[i], data[i + 1], repairSmudges);
    if (smudges <= repairSmudges) {
      let correct = true;
      for (let a = i - 1, z = i + 2; a >= 0 && z < data.length; a--, z++) {
        smudges += compareLines(data[a], data[z], repairSmudges - smudges);
        if (smudges > repairSmudges) {
          correct = false;
        }
      }
      if (correct && smudges === repairSmudges) {
        const translatedIndex = wasRotated
          ? data.length - i - 1
          : (i + 1) * 100;
        return translatedIndex;
      }
    }
  }
  return 0;
}

function rotate(data: string[]) {
  const cols = data[0].length;
  const rotated: Array<string> = Array(cols).fill("");
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[rotated.length - 1 - j] += data[i][j];
    }
  }
  return rotated;
}

await timedSolution(1, async () => {
  return await loadFile(true).then((f) => f.split("\n\n").map(splitLines))
    .then((data) =>
      data.map((pattern) => [
        { data: pattern, wasRotated: false },
        { data: rotate(pattern), wasRotated: true },
      ]).flat().reduce((sum, pattern) => sum + findReflection(pattern, 0), 0)
    );
});

await timedSolution(2, async () => {
  return await loadFile(true).then((f) =>
    f.split("\n\n").map(splitLines).map(
      (
        pattern,
      ) => [{ data: pattern, wasRotated: false }, {
        data: rotate(pattern),
        wasRotated: true,
      }],
    ).flat().reduce((sum, pattern) => sum + findReflection(pattern, 1), 0)
  );
});
