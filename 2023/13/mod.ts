import { loadFile, splitLines, timedSolution } from "../utils.ts";

function findHorizontalReflection(data: string[], wasRotated = false) {
  const reflectionIndexes: number[] = [];
  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const next = data[i + 1];
    if (current === next) {
      reflectionIndexes.push(i);
    }
  }
  for (const index of reflectionIndexes) {
    let correct = true;
    for (let a = index, z = index + 1; a >= 0 && z < data.length; a--, z++) {
      if (data[a] !== data[z]) {
        correct = false;
      }
    }

    if (correct) {
      const translatedIndex = wasRotated
        ? data.length - index - 1
        : (index + 1) * 100;
      return translatedIndex;
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
  const data = await loadFile(true).then((f) =>
    f.split("\n\n").map(splitLines)
  );
  const patterns = data.map((pattern) => {
    return {
      original: pattern,
      rotated: rotate(pattern),
    };
  });
  return patterns.reduce((sum, { original, rotated }) => {
    return sum + findHorizontalReflection(original) +
      findHorizontalReflection(rotated, true);
  }, 0);
});
