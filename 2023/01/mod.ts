import { loadFile, splitLines, timedSolution } from "../utils.ts";

await timedSolution(1, async () => {
  const data = await loadFile(true).then(splitLines);
  return data.map((line) => line.split("").map(Number).filter((n) => !isNaN(n)))
    .map((numbers) => Number(numbers[0] + "" + numbers[numbers.length - 1]))
    .reduce((a, b) => a + b);
});
await timedSolution(2, async () => {
  const letterNumbers = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];

  function f(needle: string, haystack: string) {
    const results = haystack.matchAll(new RegExp(`${needle}`, "g"));
    return [...results].map((result) => result.index);
  }

  return await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => {
      const occurences: { index: number; num: number }[] = [];
      for (let i = 0; i < letterNumbers.length; i++) {
        const num = letterNumbers[i];
        const found = f(num, line);
        if (found.length > 0) {
          occurences.push(
            ...found.map((index) => ({ index: index!, num: i + 1 })),
          );
        }
      }
      const occIndexes = occurences.map((o) => o.index);
      const nums = line.split("").map((c, i) => {
        if (occIndexes.includes(i)) {
          const replacement = occurences.find((o) => o.index === i);
          return replacement!.num;
        }
        return Number(c);
      }).filter((n) => !isNaN(n)).filter((_n, i, line) =>
        i === 0 || i === line.length - 1
      ).join("");

      if (nums.length === 1) {
        return Number(`${nums}${nums}`);
      }
      return Number(nums);
    }).reduce((a, b) => a + b, 0)
  );
});
